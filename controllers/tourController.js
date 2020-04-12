const fs = require('fs');

//============================
// Read file-database
//============================

// 'tours-simple.json' is working as a database
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));



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

   // if id doesn't exist
   if (!tour) {
      return res.status(404).json({
         status: 'fail',
         message: `ID doesn't exit`
      });
   }

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

   tours.push(newTour); // add with the exiting ones

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
   const id = req.params.id * 1;

   // if id doesn't exist
   if (id >= tours.length) {
      return res.status(404).json({
         status: 'fail',
         message: `ID doesn't exist`
      });
   }

   res.status(200).json({
      status: 'success',
      data: {
         tour: `<Updated Tour>`
      }
   });
};


exports.deleteTour = (req, res) => {
   const id = req.params.id * 1;

   // if id doesn't exit
   if (id >= tours.length) {
      return res.status(404).json({
         status: 'fail',
         message: `ID doesn't exist`
      });
   }

   // status code for delete is 204
   res.status(204).json({
      status: 'success',
      data: null
   });
};
