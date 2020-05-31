const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


const filterObj = (obj, ...allowedFields) => {
   const newObj = {};

   Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) {
         newObj[el] = obj[el];
      }
   });

   return newObj;
};


exports.updateMe = catchAsync(async (req, res, next) => {
   // 1) create error if user tries to update password
   if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError(`This route is not for updating passwords!! Please use /updatePassword for that.`, 400));
   }

   // 2) filter out unwanted field names that are not allowed to be updated
   const filteredBody = filterObj(req.body, 'name', 'email');

   // 3) if not the above, update user document
   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
   });

   res.status(200).json({
      status: 'success',
      data: {
         user: updatedUser
      }
   });
});



//============================
// Route handler functions
//============================

exports.getAllUsers = catchAsync(async (req, res, next) => {
   const users = await User.find();

   res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
         users
      }
   });
});


exports.getIndividualUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};


exports.createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};


exports.updateUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};


exports.deleteUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};