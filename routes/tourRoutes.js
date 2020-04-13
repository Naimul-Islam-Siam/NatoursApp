const express = require('express');
const tourController = require('./../controllers/tourController'); // route handlers
const { getAllTours, getIndividualTour, createTour, updateTour, deleteTour, checkID, checkBody } = tourController;


const router = express.Router(); // router middleware; express.Router() is a middleware

// param middleware
router.param('id', checkID);

router
   .route('/')
   .get(getAllTours)
   .post(checkBody, createTour);


router
   .route('/:id')
   .get(getIndividualTour)
   .patch(updateTour)
   .delete(deleteTour);




module.exports = router;