const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


const signToken = (id) => {
   return jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
   });
};


// signup
exports.signup = catchAsync(async (req, res, next) => {
   // const newUser = await User.create(req.body) can cause serious security issues as anyone set the role: admin
   const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
   });

   const token = signToken(newUser._id); // _id comes from mongoose

   res.status(201).json({
      status: 'success',
      token,
      data: {
         user: newUser
      }
   });
});


// login
exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body; // get input

   // (1) Check if email and password is provided in input
   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
   }

   // (2) Check if that user exists(email id) and if the password is correct
   const user = await User.findOne({ email: email }).select('+password');
   // '+password': password is hidden from console for security in the userModel using select: false
   // but we need to know password from database to login. as it's hidden, we need to use '+password'



   // equivalent is passed as argument; const isCorrectPass = await user.correctPassword(password, user.password) // input pass, encrypted pass from database
   // if user doesn't exist at the first place, await part won't run at all
   // but if we passed arguent as isCorrectPass instead of not storing in variable, it would be dependent on user. but what if user doesn't exist! that's why directly pass as argument instead of stroing in var and pass as arg
   if (!user || !await user.correctPassword(password, user.password)) {
      return next(new AppError('Incorrect email or password', 401));
   }



   // (3) if everything is ok send token to client and provide access to client
   const token = signToken(user._id);

   res.status(200).json({
      status: 'success',
      message: 'Succesfully logged in',
      token
   });
});