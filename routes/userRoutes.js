const express = require('express');
const userController = require('./../controllers/userController'); // route handlers
const authController = require('./../controllers/authController');
const { getMe, getAllUsers, getIndividualUser, createUser, updateUser, deleteUser, updateMe, deactivateMe } = userController;
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
   .get('/me', protect, getMe, getIndividualUser);

router
   .patch('/updateMe', protect, updateMe);

router
   .delete('/deactivateMe', protect, deactivateMe);



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