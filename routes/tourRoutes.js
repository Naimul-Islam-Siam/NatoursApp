const express = require('express');
const tourController = require('./../controllers/tourController'); // route handlers
const authController = require('./../controllers/authController');
const { getAllTours, getIndividualTour, createTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan, getToursWithin } = tourController;
const { protect, restrictTo } = authController;
const reviewRouter = require('./reviewRoutes');

const router = express.Router(); // router middleware; express.Router() is a middleware

// param middleware
// router.param('id', checkID);

router
   .route('/top-5-cheap')
   .get(aliasTopTours, getAllTours); // aliasTopTours will first auto prefill the query and then call getAllTours


router
   .route('/tour-stats')
   .get(getTourStats);


router
   .route('/monthly-plan/:year')
   .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);


router
   .route('/tour-within/:distance/center/:latlng/unit/:unit')
   .get(getToursWithin);


router
   .route('/')
   .get(getAllTours)
   .post(protect, restrictTo('admin', 'lead-guide'), createTour);


router
   .route('/:id')
   .get(getIndividualTour)
   .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
   .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);


// POST  /tours/:tourId/reviews
// GET  /tours/:tourId/reviews

router.use('/:tourId/reviews', reviewRouter); // if any url of this formation appears, use reviewRouter instead


module.exports = router;