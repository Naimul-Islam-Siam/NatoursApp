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


//============================
// Route handler functions
//============================

exports.getAllTours = async (req, res) => {
   try {
      // --------- 1) Basic Filtering ---------
      const queryObj = { ...req.query }; // hard copy of req.query object instead of reference
      const excludedFields = ['page', 'sort', 'limit', 'fields']; // this query fields will be ignored
      excludedFields.forEach(el => delete queryObj[el]);


      // --------- 2) Advanced Filtering ---------
      // for greater than, less than queries

      // { duration: { 'gte': '5' }, difficulty: 'easy' } the one we get
      // { duration: { '$gte': '5' }, difficulty: 'easy' } the one we need for mongodb

      let queryStr = JSON.stringify(queryObj); // convert json to string

      // turn gte into $gte
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // \b for exact match, g for multiple

      const queryJson = JSON.parse(queryStr);

      // didn't await here for further chaining like sorting, limiting
      const query = Tour.find(queryJson); // if nothing is passed in find method, it returns all the results



      // --------- 3) execute the query ---------
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