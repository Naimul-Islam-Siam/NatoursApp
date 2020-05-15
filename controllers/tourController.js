const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');


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

exports.getAllTours = async (req, res) => {
   try {
      // --------- execute the query ---------
      const features = new APIFeatures(Tour.find(), req.query)
         .filter()
         .sort()
         .limitFields()
         .paginate();

      const tours = await features.query;

      res.status(200).json({
         status: 'success',
         requestedAt: req.requestTime,
         results: tours.length,
         data: {
            tours
         }
      });
   } catch (error) {
      res.status(404).json({
         status: "fail",
         message: error
      });
   }
};


exports.getIndividualTour = async (req, res) => {
   try {
      const tour = await Tour.findById(req.params.id); // Tour.findById = Tour.findOne({ _id: req.params.id})

      res.status(200).json({
         status: 'success',
         data: {
            tour
         }
      });
   } catch (error) {
      res.status(404).json({
         status: "fail",
         message: error
      });
   }
};


exports.createTour = async (req, res) => {
   try {
      // const newTour = new Tour(req.body)
      // newTour.save(); //save to database

      const newTour = await Tour.create(req.body); // same as upper referene

      res.status(201).json({
         status: 'success',
         data: {
            tour: newTour
         }
      });
   } catch (error) {
      res.status(400).json({
         status: "fail",
         message: error
      });
   }
};


exports.updateTour = async (req, res) => {
   try {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true // otherwise will not accept validators defined in tourSchema
      });
      // runValidators enforce model schema, so price can't be anything other than number, otherwise it'll cause an error

      res.status(200).json({
         status: 'success',
         data: {
            tour // same as, tour: tour
         }
      });
   } catch (error) {
      res.status(400).json({
         status: "fail",
         message: error
      });
   }
};


exports.deleteTour = async (req, res) => {
   try {
      await Tour.findByIdAndDelete(req.params.id, req.body);

      // status code for delete is 204
      res.status(204).json({
         status: 'success',
         data: null
      });
   } catch (error) {
      res.status(400).json({
         status: "fail",
         message: error
      });
   }
};


//============================
// Aggregation Pipeline
//============================

exports.getTourStats = async (req, res) => {
   try {
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

   } catch (error) {
      res.status(400).json({
         status: "fail",
         message: error
      });
   }
};


exports.getMonthlyPlan = async (req, res) => {
   try {
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

   } catch (error) {
      res.status(400).json({
         status: "fail",
         message: error
      });
   }
};