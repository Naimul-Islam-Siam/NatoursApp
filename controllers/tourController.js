const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      cb(null, true);
   } else {
      cb(new AppError(`Please upload only images.`, 400), false);
   }
};

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
});


exports.uploadTourImages = upload.fields([
   { name: 'imageCover', maxCount: 1 },
   { name: 'images', maxCount: 3 }
]);


exports.resizeTourImages = catchAsync(async (req, res, next) => {
   if (!req.files.imageCover || !req.files.images) return next();

   // 1) imageCover
   const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

   await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFileName}`);

   req.body.imageCover = imageCoverFileName;

   // 2) images
   req.body.images = [];

   // important to await this, otherwise next() will be called before this completes
   // so images[] will be empty
   await Promise.all(
      req.files.images.map(async (file, i) => {
         const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

         await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${fileName}`);

         req.body.images.push(fileName);
      })
   );

   next();
});

// custom middleware
// will auto prefill the followings to form a query and then call the next 
exports.aliasTopTours = (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage,price';
   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
   next();
};



//============================
// Route handler functions
//============================

exports.getAllTours = handlerFactory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//    // --------- execute the query ---------
//    const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//    const tours = await features.query;

//    res.status(200).json({
//       status: 'success',
//       requestedAt: req.requestTime,
//       results: tours.length,
//       data: {
//          tours
//       }
//    });
// });


exports.getIndividualTour = handlerFactory.getOne(Tour, { path: 'reviews' });
// exports.getIndividualTour = catchAsync(async (req, res, next) => {
//    // Tour.findById = Tour.findOne({ _id: req.params.id})
//    const tour = await Tour.findById(req.params.id).populate('reviews');

//    // 404
//    if (!tour) {
//       const error = new AppError(`Couldn't find any tour with that ID`, 404);
//       return next(error);
//    }

//    res.status(200).json({
//       status: 'success',
//       data: {
//          tour
//       }
//    });
// });


exports.createTour = handlerFactory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//    // const newTour = new Tour(req.body)
//    // newTour.save(); //save to database

//    const newTour = await Tour.create(req.body); // same as upper referene

//    res.status(201).json({
//       status: 'success',
//       data: {
//          tour: newTour
//       }
//    });
// });


exports.updateTour = handlerFactory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true // otherwise will not accept validators defined in tourSchema
//    });
//    // runValidators enforce model schema, so price can't be anything other than number, otherwise it'll cause an error

//    // 404
//    if (!tour) {
//       const error = new AppError(`Couldn't find any tour with that ID`, 404);
//       return next(error);
//    }

//    res.status(200).json({
//       status: 'success',
//       data: {
//          tour // same as, tour: tour
//       }
//    });
// });


exports.deleteTour = handlerFactory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//    const tour = await Tour.findByIdAndDelete(req.params.id, req.body);

//    // 404
//    if (!tour) {
//       const error = new AppError(`Couldn't find any tour with that ID`, 404);
//       return next(error);
//    }

//    // status code for delete is 204
//    res.status(204).json({
//       status: 'success',
//       data: null
//    });
// });


//============================
// Aggregation Pipeline
//============================

exports.getTourStats = catchAsync(async (req, res, next) => {
   const stats = await Tour.aggregate([
      {
         $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
         $group: {
            _id: { $toUpper: '$difficulty' }, // will group by difficulty
            numTours: { $sum: 1 }, // total number of tours, 1 will be added each time a document goes through this pipeline
            numRatings: { $sum: '$ratingsQuantity' }, // number of ratings casted
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
         }
      },
      {
         $sort: { avgPrice: 1 } // the old document names no longer exists in the pipleline. The new names must be use
      }
   ]);

   res.status(200).json({
      status: 'success',
      data: {
         stats
      }
   });
});


exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   const year = req.params.year * 1;

   const plan = await Tour.aggregate([
      {
         $unwind: '$startDates' // separates arrays
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`)
            }
         }
      },
      {
         $group: {
            _id: { $month: '$startDates' }, // group by month
            numTourStarts: { $sum: 1 }, // number of tour that starts on that month
            tours: { $push: '$name' } // name of the tours of that month will be pushed in an array
         }
      },
      {
         $addFields: { month: '$_id' }, // will add a new field named month
      },
      {
         $project: { _id: 0 } // _id won't be showed because of setting it to 0
      },
      {
         $sort: { numTourStarts: -1 } // sort in descending order by the number of tours in a month
      }
   ]);

   res.status(200).json({
      status: 'success',
      data: {
         plan
      }
   });
});


// /tour-within/:distance/center/:latlng/unit/:unit
// /tour-within/300/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
   const { distance, latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');
   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

   if (!lat || !lng) {
      next(new AppError(`Please provide latitude and longitude in the form lat,lng`, 400));
   }

   const tours = await Tour.find({
      startLocation: {
         $geoWithin: {
            $centerSphere: [
               [lng, lat], radius
            ]
         }
      }
   });

   res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
         data: tours
      }
   });
});


// calculate the distances of start locations of all the tours from a particular place
// /distances/:latlng/unit/:unit
exports.getDistances = catchAsync(async (req, res, next) => {
   const { latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');

   const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

   if (!lat || !lng) {
      next(new AppError(`Please provide latitude and longitude in the form lat,lng`, 400));
   }

   const distances = await Tour.aggregate([
      {
         $geoNear: {
            // from where distances will be calculated
            near: {
               type: 'Point',
               coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier // converts to mi or km
         }
      },
      {
         $project: {
            // only show these fields
            name: 1,
            distance: 1
         }
      }
   ]);

   res.status(200).json({
      status: 'success',
      data: {
         data: distances
      }
   });
});