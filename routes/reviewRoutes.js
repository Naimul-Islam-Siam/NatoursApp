const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const { protect, restrictTo } = authController;
const { setTourAndUserIds, getIndividualReview, createReview, getAllReviews, updateReview, deleteReview } = reviewController;

const router = express.Router({ mergeParams: true }); // to get access to `:tourId` param from tourRoutes

// POST  /tours/:tourId/reviews
// GET  /tours/:tourId/reviews

// when these url appears, first it will be redirected to tourRoutes then from there it'll be redirected to reviewRoutes
// mergeParams help with that

router
   .route('/')
   .get(getAllReviews)
   .post(protect, restrictTo('user'), setTourAndUserIds, createReview);

router
   .route('/:id')
   .get(getIndividualReview)
   .patch(updateReview)
   .delete(deleteReview);


module.exports = router;