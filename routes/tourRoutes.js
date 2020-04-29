const express = require('express');
const tourController = require('./../controllers/tourController'); // route handlers
const { getAllTours, getIndividualTour, createTour, updateTour, deleteTour } = tourController;


const router = express.Router(); // router middleware; express.Router() is a middleware

// param middleware
// router.param('id', checkID);

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