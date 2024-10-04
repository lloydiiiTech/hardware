const db = require('../config/db');

exports.getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tableuser WHERE Email = ? AND Status="Active"';
        console.log("Executing query:", query, "with email:", email); // Log the query execution
        db.query(query, [email], (err, results) => {
            if (err) {
                reject(err);
            }
            if (results.length === 0) {
                resolve(null); // No user found
            } else {
                resolve(results[0]); // Return the user object
            }
        });
    });
};
exports.createUser = (userData) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO tableuser (
                FirstName, MiddleName, LastName, Suffix, Email, ContactNumber, 
                Province, City, Barangay, Age, Password, Images, Birthday, 
                Street, Gender, Status, Role
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "Active", "User")
        `;

        const values = [
            userData.FirstName, userData.MiddleName, userData.LastName, 
            userData.Suffix, userData.Email, userData.ContactNumber, 
            userData.Province, userData.City, userData.Barangay, userData.Age, 
            userData.Password, userData.Images, userData.Birthday, 
            userData.Street, userData.Gender, 
        ];

        db.query(query, values, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
};







exports.saveResetToken = (userId, token, expiration) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tableuser SET reset_token = ?, reset_expires = ? WHERE Id = ?';
        db.query(query, [token, expiration, userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


exports.findUserByToken = (token) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tableuser WHERE reset_token = ?';
        db.query(query, [token], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};


// Update the user's password and clear reset token and expiration
exports.updatePassword = (userId, newPassword) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tableuser SET Password = ?, reset_token = NULL, reset_expires = NULL WHERE Id = ?';
        db.query(query, [newPassword, userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};