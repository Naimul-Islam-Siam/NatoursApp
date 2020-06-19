const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
   // 1) Get all tour data from collection
   const tours = await Tour.find();

   // 2) Build template

   // 3) Render template with the tour data
   res.status(200).render('overview', {
      title: "All Tours",
      tours
   });
});


exports.getTour = catchAsync(async (req, res, next) => {
   // 1) Get the data of the requested tour (including guides and reviews)
   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
   });

   // 2) Build template

   // 3) Render template with the data
   res.status(200).render('tour', {
      title: tour.name,
      tour
   });
});


exports.getLoginForm = catchAsync(async (req, res, next) => {
   res.status(200).render('login', {
      title: 'Login to your account'
   });
});