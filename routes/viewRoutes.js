const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const { getOverview, getTour, getLoginForm } = viewController;
const { isLoggedIn } = authController;

router.use(isLoggedIn);

router
   .get('/', getOverview);

router
   .get('/tour/:slug', getTour);

router
   .get('/login', getLoginForm);

module.exports = router;
