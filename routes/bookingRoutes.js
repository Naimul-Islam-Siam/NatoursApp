const express = require('express');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const { protect } = authController;
const { getCheckoutSession } = bookingController;

const router = express.Router();

router
   .get('/checkout-session/:tourId', protect, getCheckoutSession);

module.exports = router;