const express = require('express');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const { protect, restrictTo } = authController;
const { getCheckoutSession, getAllBookings, getIndividualBooking, createBooking, updateBooking, deleteBooking } = bookingController;

const router = express.Router();


router
   .use(protect);

router
   .get('/checkout-session/:tourId', protect, getCheckoutSession);

router
   .use(restrictTo('admin', 'lead-guide'));

router
   .route('/')
   .get(getAllBookings)
   .post(createBooking)

router
   .route('/:id')
   .get(getIndividualBooking)
   .patch(updateBooking)
   .delete(deleteBooking);


module.exports = router;