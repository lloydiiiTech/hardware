const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session'); // Import express-session
const flash = require('express-flash'); // Import express-flash
const routes = require('./routes/router.js');

const app = express();



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); // Ensure this is correctly set up
app.use(bodyParser.json());
// Set up express-session
app.use(session({
    secret: 'your_secret_key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));

// Set up express-flash
app.use(flash());

// Use routes
app.use('/', routes);

app.listen(4500, () => {
    console.log('Server initialized on http://localhost:4500');
});
