const express = require('express');
const userController = require('./../controllers/userController'); // route handlers
const authController = require('./../controllers/authController');
const { getAllUsers, getIndividualUser, createUser, updateUser, deleteUser, updateMe } = userController;
const { signup, login, protect, forgotPassword, resetPassword, updatePassword } = authController;

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
   .patch('/updatePassword', protect, updatePassword);

router
   .patch('/updateMe', protect, updateMe);



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