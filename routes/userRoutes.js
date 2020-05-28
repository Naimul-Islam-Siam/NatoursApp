const express = require('express');
const userController = require('./../controllers/userController'); // route handlers
const authController = require('./../controllers/authController');
const { getAllUsers, getIndividualUser, createUser, updateUser, deleteUser } = userController;
const { signup, login, forgotPassword, resetPassword } = authController;

const router = express.Router(); // router middleware; express.Router() is a middleware


router
   .post('/signup', signup);

router
   .post('/login', login);

router
   .post('/forgotPassword', forgotPassword);

router
   .patch('/resetPassword/:token', resetPassword);


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