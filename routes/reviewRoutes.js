const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const { createReview, getAllReviews } = reviewController;
const { protect, restrictTo } = authController;

const router = express.Router({ mergeParams: true }); // to get access to `:tourId` param from tourRoutes

// POST  /tours/:tourId/reviews
// GET  /tours/:tourId/reviews

// when thes url appears, first it will be redirected to tourRoutes then from there it'll be redirected to reviewRoutes
// mergeParams help with that

router
   .route('/')
   .get(getAllReviews)
   .post(protect, restrictTo('user'), createReview);

module.exports = router;