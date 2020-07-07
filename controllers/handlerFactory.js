const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');


exports.createOne = Model => catchAsync(async (req, res, next) => {
   // const newTour = new Tour(req.body)
   // newTour.save(); //save to database

   const doc = await Model.create(req.body); // same as upper referene

   res.status(201).json({
      status: 'success',
      data: {
         data: doc
      }
   });
});


exports.updateOne = Model => catchAsync(async (req, res, next) => {
   const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true // otherwise will not accept validators defined in tourSchema
   });
   // runValidators enforce model schema, so price can't be anything other than number, otherwise it'll cause an error

   // 404
   if (!doc) {
      const error = new AppError(`Couldn't find any document with that ID`, 404);
      return next(error);
   }

   // authorization
   if (doc.user._id !== req.user._id) {
      return next(new AppError(`You don't have permission to perform this action.`, 403));
   }

   res.status(200).json({
      status: 'success',
      data: {
         data: doc
      }
   });
});


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
   const doc = await Model.findByIdAndDelete(req.params.id, req.body);

   // 404
   if (!doc) {
      const error = new AppError(`Couldn't find any document with that ID`, 404);
      return next(error);
   }

   // authorization
   if (doc.user._id !== req.user._id) {
      return next(new AppError(`You don't have permission to perform this action.`, 403));
   }

   // status code for delete is 204
   res.status(204).json({
      status: 'success',
      data: null
   });
});


exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
   // Tour.findById = Tour.findOne({ _id: req.params.id})
   let query = Model.findById(req.params.id);

   if (populateOptions) {
      query = query.populate(populateOptions);
   }
   const doc = await query;

   // 404
   if (!doc) {
      const error = new AppError(`Couldn't find any document with that ID`, 404);
      return next(error);
   }

   res.status(200).json({
      status: 'success',
      data: {
         data: doc
      }
   });
});


exports.getAll = Model => catchAsync(async (req, res, next) => {
   // hacks for GET nested routes in getAllReviews
   let filter = {};

   if (req.params.tourId) {
      filter = { tour: req.params.tourId };
   }

   // if filter is empty, will give all the reviews of all the tour
   // if filter has tour value, then all the reviews of that particular tour will be given


   // --------- execute the query ---------
   const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

   const docs = await features.query;

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
         data: docs
      }
   });
});