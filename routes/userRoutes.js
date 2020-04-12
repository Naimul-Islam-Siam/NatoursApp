const express = require('express');
const userController = require('./../controllers/userController'); // route handlers
const { getAllUsers, getIndividualUser, createUser, updateUser, deleteUser } = userController;


const router = express.Router(); // router middleware; express.Router() is a middleware

router
   .route('/')
   .get(getAllUsers)
   .post(createUser);


router
   .route('/:id')
   .get(getIndividualUser)
   .patch(updateUser)
   .delete(deleteUser);




module.exports = router;
