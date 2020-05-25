const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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