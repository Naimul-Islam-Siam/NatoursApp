const express = require('express');
const tourController = require('./../controllers/tourController'); // route handlers
const authController = require('./../controllers/authController');
const { getAllTours, getIndividualTour, createTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan } = tourController;
const { protect } = authController;


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
   .get(getMonthlyPlan);


router
   .route('/')
   .get(protect, getAllTours)
   .post(createTour);


router
   .route('/:id')
   .get(getIndividualTour)
   .patch(updateTour)
   .delete(deleteTour);



module.exports = router;