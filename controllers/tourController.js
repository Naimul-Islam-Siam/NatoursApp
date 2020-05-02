const Tour = require('../models/tourModel');

// param middleware
// check if id in url exists, will affect the whole tourRouter
// exports.checkID = (req, res, next, value) => {
//    const id = req.params.id * 1;
//    // if id doesn't exit
//    if (id >= tours.length) {
//       // must be returned
//       return res.status(404).json({
//          status: 'fail',
//          message: `ID doesn't exist`
//       });
//    }
//    next();
// };


// check if name and price are present while creating new tour
// will affect tourRouter POST request
// exports.checkBody = (req, res, next) => {
//    if (!req.body.name || !req.body.price) {
//       return res.status(400).json({
//          status: "fail",
//          message: "Missing name or price"
//       });
//    }
//    next();
// }


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
      // --------- 1A) Basic Filtering ---------
      const queryObj = { ...req.query }; // hard copy of req.query object instead of reference
      const excludedFields = ['page', 'sort', 'limit', 'fields']; // this query fields will be ignored
      excludedFields.forEach(el => delete queryObj[el]);


      // --------- 1B) Advanced Filtering ---------
      // for greater than, less than queries

      // { duration: { 'gte': '5' }, difficulty: 'easy' } the one we get
      // { duration: { '$gte': '5' }, difficulty: 'easy' } the one we need for mongodb

      let queryStr = JSON.stringify(queryObj); // convert json to string

      // turn gte into $gte
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // \b for exact match, g for multiple

      const queryJson = JSON.parse(queryStr);

      // didn't await here for further chaining like sorting, limiting
      let query = Tour.find(queryJson); // if nothing is passed in find method, it returns all the results



      // --------- 2) Sorting ---------
      if (req.query.sort) {
         // mongodb works like this -> sort(price rating) for multiple sorting criterias
         // but we get response like this -> sort=price,rating
         // so we need to split
         const sortBy = req.query.sort.split(',').join(' ');
         query = query.sort(sortBy);
      } else {
         query = query.sort('-createdAt'); // by default sort by time created at. '-' sign for desc order
      }



      // --------- 3) Limiting Fields (Projection) ---------
      // only show selected data
      if (req.query.fields) {
         // mongodb works like this -> select(price rating) for multiple sorting criterias
         // but we get response like this -> fields=price,rating
         // so we need to split
         const fields = req.query.fields.split(',').join(' ');
         query = query.select(fields);
      } else {
         query = query.select('-__v'); // '-' sign excludes __v
      }



      // --------- 4) Pagination ---------
      const page = req.query.page * 1 || 1; // convert string to number, by default current page is 1st page
      const limit = req.query.limit * 1 || 100; // by default 100
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);

      // if requested page number is more than available page numbers
      if (req.query.page) {
         const numberOfTours = await Tour.countDocuments();
         if (skip >= numberOfTours) throw new Error(`This page doesn't exist`);
      }



      // --------- execute the query ---------
      const tours = await query;

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
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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