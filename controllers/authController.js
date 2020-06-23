const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');


const signToken = (id) => {
   return jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
   });
};

const createAndSendToken = (user, statusCode, res) => {
   const token = signToken(user._id); // _id comes from mongoose

   const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true
   }

   if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true; // production must be in https protocol
   }

   res.cookie('jwt', token, cookieOptions);

   // hide password from output
   user.password = undefined;
   user.validated = undefined;

   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user
      }
   });
};


// signup
exports.signup = catchAsync(async (req, res, next) => {
   // const newUser = await User.create(req.body) can cause serious security issues as anyone set the role: admin
   const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt
   });

   const signupToken = signToken(newUser._id);

   const signupURL = `${req.protocol}://${req.get('host')}/api/v1/users/accountConfirm/${signupToken}`;

   const message = `Submit a post request with ${signupURL} to activate your account.`;

   // send the activation link to email
   try {
      await sendEmail({
         email: newUser.email,
         subject: `Follow the instructions to validate your account.`,
         message
      });

      res.status(200).json({
         status: 'success',
         message: `Token sent to email!`
      });
   } catch (error) {
      return next(new AppError(`There was an error sending email. Please try again later!`, 500));
   }
});


// check validation of account through activation url sent to email
exports.accountConfirm = catchAsync(async (req, res, next) => {
   const { token } = req.params;

   // verification of token (check if the token sent is not manipulated by any malicious attacks)
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

   // check if the user to whom token was issued, still exists (what if user deleted his account after getting the token)
   const user = await User.findById(decoded.id).select('+validated');

   if (!user) {
      return next(new AppError('The user belonging to this token does not exist.', 401));
   }
   if (user.validated) {
      return next(new AppError('This account has already been validated', 400));
   }

   user.validated = true;

   await user.save({ validateBeforeSave: false });

   createAndSendToken(user, 200, res);
});


// login
exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body; // get input

   // (1) Check if email and password is provided in input
   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
   }

   // (2) Check if that user exists(email id) and if the password is correct
   const user = await User.findOne({ email: email }).select('+password').select('+validated');
   // '+password': password is hidden from console for security in the userModel using select: false
   // but we need to know password from database to login. as it's hidden, we need to use '+password'



   // equivalent is passed as argument; const isCorrectPass = await user.isCorrectPassword(password, user.password) // input pass, encrypted pass from database
   // if user doesn't exist at the first place, await part won't run at all
   // but if we passed arguent as isCorrectPass instead of not storing in variable, it would be dependent on user. but what if user doesn't exist! that's why directly pass as argument instead of stroing in var and pass as arg
   // isCorrectPassword method is obtained as document instant through userModel
   if (!user || !await user.isCorrectPassword(password, user.password)) {
      return next(new AppError('Incorrect email or password', 401));
   }


   // if account is not verified and user tries to login
   if (!user.validated) {
      user.validated = false; // for safety turn it to false again

      const signupToken = signToken(user._id);

      const signupURL = `${req.protocol}://${req.get('host')}/api/v1/users/accountConfirm/${signupToken}`;

      const message = `Submit a post request with ${signupURL} to activate your account.`;

      // send the activation link to email
      try {
         await sendEmail({
            email: user.email,
            subject: `Follow the instructions to validate your account.`,
            message
         });

         // res.status(200).json({
         //    status: 'success',
         //    message: `Token sent to email!`
         // });
      } catch (error) {
         return next(new AppError(`There was an error sending email. Please try again later!`, 500));
      }

      return next(new AppError('Your account is not validated yet. Check your email and validate the account.', 401));
   }



   // (3) if everything is ok send token to client and provide access to client
   createAndSendToken(user, 200, res);
});


// protect route middleware
exports.protect = catchAsync(async (req, res, next) => {
   let token;

   // 1) getting token and check if it's there
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
   } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
   }

   if (!token) {
      return next(new AppError(`You're not logged in. Please login to get access`, 401));
   }

   // 2) verification of token (check if the token sent is not manipulated by any malicious attacks)
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

   // 3) check if the user to whom token was issued, still exists (what if user deleted his account after getting the token)
   const currentUser = await User.findById(decoded.id);

   if (!currentUser) {
      return next(new AppError(`The user belonging to this token no longer exists.`, 401));
   }

   // 4) check if user changed password after the token was issued (what if user changed his password after guessing a security threat)

   if (currentUser.changedPasswordAfter(decoded.iat)) {
      // changedPasswordAfter is got as document instant from userModel, decoded.iat = the time at when token was issued
      return next(new AppError(`Password was changed recently. Please login with the latest password.`, 401));
   }

   // if everything is ok, grant access to protected route
   req.user = currentUser;
   next();
});


// authorization and role permissions
exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      // authorized roles are 'admin' and 'lead-guide'
      if (!roles.includes(req.user.role)) {
         // req.body.role will have role of the person stored
         // roles = admin, lead-guide. So if req.user.role is not any of the roles, send error
         return next(new AppError(`You don't have permission to perform this action.`, 403)); // 403 = forbidden
      }

      next();
   };
};


exports.forgotPassword = catchAsync(async (req, res, next) => {
   // 1) Get user based on POSTed email
   const user = await User.findOne({ email: req.body.email });

   if (!user) {
      return next(new AppError('There is no user with this email address', 404));
   }

   // 2) Generate a random reset token
   const resetToken = user.createPasswordResetToken();
   await user.save({ validateBeforeSave: false }); // turn off validators before save()


   // 3) Send token to the user via email
   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

   const message = `Forgot your password? Submit a patch a request to ${resetURL} with your new password.\nPlease ignore if you didn't forget your password.`;

   try {
      await sendEmail({
         email: user.email,
         subject: `Your password reset token (valid for 5 min).`,
         message
      });

      res.status(200).json({
         status: 'success',
         message: `Token sent to email!`
      });
   } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError(`There was an error sending email. Please try again later!`, 500));
   }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
   // ==========================
   // 1) Get user based on token 
   // ==========================

   //hash the plain token received through email 
   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

   // find the user whose token (in DB) mathces with the hashedToken and check if token expired
   const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
   });



   // ==================================================================
   // 2) If token hasn't expired and there is user, set the new password
   // ==================================================================

   if (!user) {
      return next(new AppError(`Token is invalid or has expired.`, 400));
   }

   // set new password now
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;

   // nullify the password reset token
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;

   // save to database
   await user.save();


   // ===========================
   // 3) Update changedPasswordAt
   // ===========================

   // happens in userModel userSchema (update passwordChangedAt)


   // ===============================
   // 4) log the user in and send JWT
   // ===============================

   createAndSendToken(user, 200, res);
});


// normal password change/update
exports.updatePassword = catchAsync(async (req, res, next) => {
   // 1) get the user from db
   const user = await User.findById(req.user.id).select('+password');

   // 2) ask for the current password and check if it's correct
   if (!(await user.isCorrectPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError(`Wrong current password.`, 401));
   }

   // 3) if password is the same, update password
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   await user.save(); // findByIdAndUpdate won't work, so we must do it this way

   // 4) login and send JWT
   createAndSendToken(user, 200, res);
});


// only for render
exports.isLoggedIn = catchAsync(async (req, res, next) => {
   // 1) getting token and check if it's there
   if (req.cookies.jwt) {
      // 2) verification of token (check if the token sent is not manipulated by any malicious attacks)
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 3) check if the user to whom token was issued, still exists (what if user deleted his account after getting the token)
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
         return next();
      }

      // 4) check if user changed password after the token was issued (what if user changed his password after guessing a security threat)

      if (currentUser.changedPasswordAfter(decoded.iat)) {
         // changedPasswordAfter is got as document instant from userModel, decoded.iat = the time at when token was issued
         return next();
      }

      // if everything is ok, there is a logged in user
      res.locals.user = currentUser; // will pass `user` to pug template
      return next();
   }
   next();
});