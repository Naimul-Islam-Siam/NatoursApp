const express = require('express');
const userController = require('./../controllers/userController'); // route handlers
const authController = require('./../controllers/authController');
const { getMe, getAllUsers, getIndividualUser, createUser, updateUser, deleteUser, updateMe, deactivateMe } = userController;
const { signup, accountConfirm, login, logout, protect, restrictTo, forgotPassword, resetPassword, updatePassword } = authController;

const router = express.Router(); // router middleware; express.Router() is a middleware


router
   .post('/signup', signup);

router
   .post('/accountConfirm/:token', accountConfirm);

router
   .post('/login', login);

router
   .get('/logout', logout);

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
   .get(protect, restrictTo('admin'), getAllUsers)
   .post(protect, restrictTo('admin'), createUser);


router
   .route('/:id')
   .get(protect, restrictTo('admin'), getIndividualUser)
   .patch(protect, restrictTo('admin'), updateUser)
   .delete(protect, restrictTo('admin'), deleteUser);




module.exports = router;