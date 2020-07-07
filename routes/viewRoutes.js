const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const { getOverview, getTour, getLoginForm, getSignupForm, getAccount, getMyTours, verifyAccount, updateUserData } = viewController;
const { isLoggedIn, protect } = authController;
const { createBookingCheckout } = bookingController;

router
   .get('/', createBookingCheckout, isLoggedIn, getOverview);

router
   .get('/tour/:slug', isLoggedIn, getTour);

router
   .get('/login', isLoggedIn, getLoginForm);

router
   .get('/signup', isLoggedIn, getSignupForm);

router
   .get('/verify', isLoggedIn, verifyAccount);

router
   .get('/me', protect, getAccount);

router
   .get('/my-tours', protect, getMyTours);

// router
//    .post('/submit-user-data', protect, updateUserData)

module.exports = router;
