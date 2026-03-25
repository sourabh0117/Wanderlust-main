const express = require('express');
const router = express.Router();
const wrapasync = require('../utils/wrapasync.js');
const passport = require('passport');
const {saveRedirectUrl} = require('../middleware.js');
const userController = require('../controllers/user.js');

// Sign UP get, post share same route path
router
    .route('/signup')
    .get(userController.renderSignupForm)
    .post(wrapasync(userController.signup));

// Log in get, post share same route path
router
    .route('/login')
    .get(userController.renderLoginFrom)
    .post(saveRedirectUrl, 
        passport.authenticate('local', 
        {failureRedirect: '/login', 
        failureFlash: true}), 
        userController.login
    );

// logout
router.get('/logout', 
    userController.logout
);

module.exports = router;