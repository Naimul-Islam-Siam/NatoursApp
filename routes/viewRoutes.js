const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const { getOverview, getTour, getLoginForm } = viewController;


router
   .get('/', getOverview);

router
   .get('/tour/:slug', getTour);

router
   .get('/login', getLoginForm);

module.exports = router;
