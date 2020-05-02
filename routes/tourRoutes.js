const express = require('express');
const tourController = require('./../controllers/tourController'); // route handlers
const { getAllTours, getIndividualTour, createTour, updateTour, deleteTour, aliasTopTours } = tourController;


const router = express.Router(); // router middleware; express.Router() is a middleware

// param middleware
// router.param('id', checkID);

router
   .route('/top-5-cheap')
   .get(aliasTopTours, getAllTours); // aliasTopTours will first auto prefill the query and then call getAllTours


router
   .route('/')
   .get(getAllTours)
   .post(createTour);


router
   .route('/:id')
   .get(getIndividualTour)
   .patch(updateTour)
   .delete(deleteTour);



module.exports = router;