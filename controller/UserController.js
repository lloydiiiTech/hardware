const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Import the user model
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Make sure to install this package

const JWT_SECRET = 'none'; 

// Set up multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/userprofile')); // Store images in public/userprofile
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Create unique file name
    }
});

const upload = multer({ storage: storage });

exports.register = (req, res) => {
    res.render('register', { messages: req.flash() });
};

exports.registerPost = (
    upload.single('Image'), // Middleware for handling file uploads
    async (req, res) => {
        const {
            FirstName,
            MiddleName,
            LastName,
            Suffix,
            Email,
            ContactNumber,
            Province,
            City,
            Barangay,
            Age,
            Password,
            ConfirmPassword,
            Birthday,
            Street,
            Gender,
        } = req.body;

        // Log the request body to debug the issue
        console.log('Registration Data:', req.body);
        if(Password === ConfirmPassword){
            try {
                
                const existingUser = await User.getUserByEmail(Email);
                if (existingUser) {
                    req.flash('error', 'Email already exists');
                    return res.redirect('/register');
                }
        
                const hashedPassword = await bcrypt.hash(Password, 10);
                const imagePath = req.file ? `/userprofile/${req.file.filename}` : null;
                const token = jwt.sign({ email: Email }, JWT_SECRET, { expiresIn: '1h' });
                console.log(imagePath);
                await User.createUser({
                    FirstName,
                    MiddleName,
                    LastName,
                    Suffix,
                    Email,
                    ContactNumber,
                    Province,
                    City,
                    Barangay,
                    Age,
                    Password: hashedPassword,
                    Images: imagePath,
                    Birthday,
                    Street,
                    Gender,
                    token
                });
        
                req.flash('success', 'Registration successful! Please log in.');
                return res.redirect('/login');
            } catch (error) {
                console.error('Error during registration:', error);
                req.flash('error', 'An error occurred. Please try again later.');
                return res.redirect('/register');
            }
        }else {
            // Passwords do not match
            req.flash('error', 'Passwords do not match.');
            return res.redirect('/register');
        }
    }
);


exports.login = (req, res) => {
    res.render('login', { messages: req.flash() });
};exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    console.log("Received email:", email);
    console.log("Received password:", password);

    try {
        const user = await User.getUserByEmail(email);
        console.log("User found:", user); // Log the found user

        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        console.log("Password match result:", isMatch); // Log the result of the comparison

        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        const token = jwt.sign({ id: user.Id, email: user.Email, role: user.Role }, JWT_SECRET, { expiresIn: '1h' });
        req.session.token = token;

        // Redirect based on user role
        if (user.Role === 'Admin') {
            req.flash('success', 'Login successful');
            return res.redirect('/admin');
        } else if (user.Role === 'User') {
            req.flash('success', 'Login successful');
            return res.redirect('/');
        } else {
            req.flash('error', 'Invalid user role');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred. Please try again later.');
        return res.redirect('/login');
    }
};

// Middleware to verify the JWT token
exports.verifyToken = (req, res, next) => {
    const token = req.session.token;

    if (!token) {
        req.flash('error', 'Please log in to access this page.');
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            req.flash('error', 'Session expired. Please log in again.');
            return res.redirect('/login');
        }

        req.user = decoded;
        next();
    });
};

// Logout functionality
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.redirect('/login');
    });
};



// Render the forgot password page
exports.forgotPassword = (req, res) => {
    res.render('forgot-password', { messages: req.flash() });
};
// Handle forgot password form submission
exports.forgotPasswordPost = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.getUserByEmail(email);
        if (!user) {
            req.flash('error', 'No account found with that email address');
            return res.redirect('/forgot-password');
        }

        // Generate a reset token
        const token = crypto.randomBytes(20).toString('hex');

        // Generate expiration time in MySQL DATETIME format
        const expirationDate = new Date(Date.now() + 3600000); // 1 hour from now
        function formatDateToMySQL(date) {
            return date.toISOString().slice(0, 19).replace('T', ' ');
        }
        const expiration = formatDateToMySQL(expirationDate);

        // Save token and expiration in database
        await User.saveResetToken(user.Id, token, expiration);

        // Redirect to reset-password page with token
        return res.redirect(`/reset-password/${token}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred. Please try again later.');
        return res.redirect('/forgot-password');
    }

};


// Render the reset password page
exports.resetPassword = (req, res) => {
    const token = req.params.token; // Get the token from the URL
    res.render('reset-password', { token, messages: req.flash() }); // Render the reset-password page with the token
};

// Handle new password submission
exports.resetPasswordPost = async (req, res) => {
    const { token } = req.params;  // Get token from URL parameters
    const { password, confirm } = req.body;  // Extract password and confirm password

    // Check if password and confirm password match
    if (password !== confirm) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/reset-password/${token}`);  // Redirect to reset page if they don't match
    }

    try {
        const user = await User.findUserByToken(token);  // Find user by token
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');  // Redirect if token is invalid or expired
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updatePassword(user.Id, hashedPassword);  // Update the user's password

        req.flash('success', 'Your password has been updated successfully.');
        return res.redirect('/login');  // Redirect to login page after successful password reset
    } catch (error) {
        console.error('Error during password reset:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        return res.redirect('/forgot-password');
    }
};
