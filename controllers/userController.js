const multer = require('multer');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');

const multerStorage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'public/img/users');
   },
   filename: (req, file, cb) => {
      //filename will be: user-userid-currenttimestamp.extension
      const extension = req.file.mimetype.split('/')[1];

      cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
   }
});

const multerFilter = (req, file, cb) => {
   if (req.file.mimetype.startsWith('image')) {
      cb(null, true);
   } else {
      cb(new AppError(`Please upload only images.`, 400), false);
   }
};

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
});


exports.uploadUserPhoto = upload.single('photo');


const filterObj = (obj, ...allowedFields) => {
   const newObj = {};

   Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) {
         newObj[el] = obj[el];
      }
   });

   return newObj;
};


exports.getMe = (req, res, next) => {
   req.params.id = req.user.id;

   next();
};


exports.updateMe = catchAsync(async (req, res, next) => {
   // 1) create error if user tries to update password
   if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError(`This route is not for updating passwords!! Please use /updatePassword for that.`, 400));
   }

   // 2) filter out unwanted field names that are not allowed to be updated
   const filteredBody = filterObj(req.body, 'name', 'email');

   // 3) Check if the newly provided data is already the existing one
   const user = await User.findById(req.user.id);

   // if both name and email are unchanged, then trigger this
   // otherwise even if user wants to change just his name, it will trigger
   if (user.name === req.body.name && user.email === req.body.email) {
      return next(new AppError(`This is already your current data.`));
   }

   // 4) if not the above, update user document

   // works only for logged in user. so we can get req.user.id in that way
   // we didn't use save() cause that will ask for other fields like password
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


exports.deactivateMe = catchAsync(async (req, res, next) => {
   await User.findByIdAndUpdate(req.user.id, { active: false });

   res.status(204).json({
      status: 'success',
      data: null
   });
});


//============================
// Route handler functions
//============================

exports.getAllUsers = handlerFactory.getAll(User);

exports.getIndividualUser = handlerFactory.getOne(User);


exports.createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't defined. Please use /signup instead.`
   });
};


exports.updateUser = handlerFactory.updateOne(User); // DO NOT update password using this

exports.deleteUser = handlerFactory.deleteOne(User);