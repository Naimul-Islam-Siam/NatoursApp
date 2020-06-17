const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const { getOverview, getTour } = viewController;


router.get('/', getOverview);

router.get('/tour', getTour);

module.exports = router;
