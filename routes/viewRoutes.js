const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const { getOverview, getTour, getLoginForm, getAccount, updateUserData } = viewController;
const { isLoggedIn, protect } = authController;


router
   .get('/', isLoggedIn, getOverview);

router
   .get('/tour/:slug', isLoggedIn, getTour);

router
   .get('/login', isLoggedIn, getLoginForm);

router
   .get('/me', protect, getAccount);

// router
//    .post('/submit-user-data', protect, updateUserData)

module.exports = router;
