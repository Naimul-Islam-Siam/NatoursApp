const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const { getOverview, getTour, getLoginForm, getSignupForm, getAccount, getMyTours, verifyAccount, forgotPassword, resetPassword, checkBooking, alerts } = viewController;
const { isLoggedIn, protect } = authController;
// const { createBookingCheckout } = bookingController;

router.use(alerts);

router
   .get('/', isLoggedIn, getOverview);

router
   .get('/tour/:slug', isLoggedIn, checkBooking, getTour);

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

router
   .get('/forgot-password', isLoggedIn, forgotPassword);

router
   .get('/reset-password', isLoggedIn, resetPassword);

router
   .get('/sendgrid', viewController.getSendGrid);

// router
//    .post('/submit-user-data', protect, updateUserData)

module.exports = router;
