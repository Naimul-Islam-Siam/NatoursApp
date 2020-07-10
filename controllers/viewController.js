const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

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

   if (!tour) {
      return next(new AppError(`There's no tour with that name.`));
   }

   // 2) Build template

   // 3) Render template with the data
   res.status(200).render('tour', {
      title: tour.name,
      tour
   });
});


exports.getLoginForm = catchAsync(async (req, res, next) => {
   // if a logged in user is already there
   if (res.locals.user) {
      res.writeHead(302, {
         'Location': '/'
      });
      res.end();

      return next();
   }

   res.status(200).render('login', {
      title: 'Login to your account'
   });
});


exports.getSignupForm = catchAsync(async (req, res, next) => {
   // if a logged in user is already there
   if (res.locals.user) {
      res.writeHead(302, {
         'Location': '/'
      });
      res.end();

      return next();
   }

   res.status(200).render('signup', {
      title: 'Create a new account'
   });
});


exports.verifyAccount = catchAsync(async (req, res, next) => {
   // if a logged in user is already there
   if (res.locals.user) {
      res.writeHead(302, {
         'Location': '/'
      });
      res.end();

      return next();
   }

   res.status(200).render('verify', {
      title: 'Verify your account'
   });
});


exports.getAccount = (req, res) => {
   res.status(200).render('account', {
      title: `${res.locals.user.name}'s Account`
   });
};


exports.getMyTours = catchAsync(async (req, res, next) => {
   // 1) Find all the bookings of the user
   const bookings = await Booking.find({ user: req.user.id });

   // 2) Find tours with the id
   const tourIds = bookings.map(el => el.tour);

   const tours = await Tour.find({ _id: { $in: tourIds } });

   res.status(200).render('overview', {
      title: 'My Tours',
      tours
   });
});


exports.forgotPassword = catchAsync(async (req, res, next) => {
   // if a logged in user is already there
   if (res.locals.user) {
      res.writeHead(302, {
         'Location': '/'
      });
      res.end();

      return next();
   }

   res.status(200).render('forgotPass', {
      title: 'Forgot Password'
   });
});


exports.resetPassword = catchAsync(async (req, res, next) => {
   // if a logged in user is already there
   if (res.locals.user) {
      res.writeHead(302, {
         'Location': '/'
      });
      res.end();

      return next();
   }

   res.status(200).render('resetPass', {
      title: 'Reset Password'
   });
});


exports.checkBooking = catchAsync(async (req, res, next) => {
   const user = res.locals.user;
   const tour = await Tour.findOne({ slug: req.params.slug });

   if (!user) {
      return next();
   }

   const booking = await Booking.find({ user: user._id, tour: tour.id });

   booking.length > 0 ? res.locals.booking = true : res.locals.booking = false;

   next();
});


// exports.updateUserData = catchAsync(async (req, res, next) => {
//    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//       name: req.body.name,
//       email: req.body.email
//    }, {
//       new: true,
//       runValidators: true
//    });

//    res.status(200).render('account', {
//       title: `${res.locals.user.name}'s Account`,
//       user: updatedUser
//    });
// });