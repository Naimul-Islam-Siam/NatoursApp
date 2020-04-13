const fs = require('fs');

//============================
// Read file-database
//============================

// 'tours-simple.json' is working as a database
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


// param middleware
// check if id in url exists, will affect the whole tourRouter
exports.checkID = (req, res, next, value) => {
   const id = req.params.id * 1;
   // if id doesn't exit
   if (id >= tours.length) {
      // must be returned
      return res.status(404).json({
         status: 'fail',
         message: `ID doesn't exist`
      });
   }
   next();
};


// check if name and price are present while creating new tour
// will affect tourRouter POST request
exports.checkBody = (req, res, next) => {
   if (!req.body.name || !req.body.price) {
      return res.status(400).json({
         status: "fail",
         message: "Missing name or price"
      });
   }
   next();
}


//============================
// Route handler functions
//============================

exports.getAllTours = (req, res) => {
   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
         tours
      }
   });
};


exports.getIndividualTour = (req, res) => {
   const id = req.params.id * 1; // converts string to number
   const tour = tours.find(el => el.id === id);

   res.status(200).json({
      status: 'success',
      data: {
         tour
      }
   });
};


exports.createTour = (req, res) => {
   const newId = tours[tours.length - 1].id + 1; // create new id
   const newTour = Object.assign({ id: newId }, req.body); // new tour object

   tours.push(newTour); // add with the existing ones

   // update database
   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
      res.status(201).json({
         status: 'success',
         data: {
            tour: newTour
         }
      });
   });
};


exports.updateTour = (req, res) => {
   res.status(200).json({
      status: 'success',
      data: {
         tour: `<Updated Tour>`
      }
   });
};


exports.deleteTour = (req, res) => {
   // status code for delete is 204
   res.status(204).json({
      status: 'success',
      data: null
   });
};