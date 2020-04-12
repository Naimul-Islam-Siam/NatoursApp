const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 8080;


//============================
// (1) Server initialization
//============================

app.listen(port, () => {
   console.log(`Listening to port ${port}`);
});



//============================
// (2) Middlewares
//============================

app.use(express.json()); // otherwise post request won't work

// custom middleware
app.use((req, res, next) => {
   req.requestTime = new Date().toISOString();
   next(); // this is a must, otherwise won't work
});

// third party middleware
app.use(morgan('dev'));



//============================
// (3) Read file-database
//============================

// 'tours-simple.json' is working as a database
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));



//============================
// (4) Route handler functions
//============================

const getAllTours = (req, res) => {
   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
         tours
      }
   });
};


const getIndividualTour = (req, res) => {
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


const createTour = (req, res) => {
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


const updateTour = (req, res) => {
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


const deleteTour = (req, res) => {
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


const getAllUsers = (req, res) => {
   res.status(500).json({
      // 500 = internal server error
      status: 'error',
      message: `This route isn't created yet`
   });
};


const getIndividualUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};


const createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};


const updateUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};


const deleteUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: `This route isn't created yet`
   });
};



//============================
// (5) Routes
//============================

// tours
app
   .route('/api/v1/tours')
   .get(getAllTours)
   .post(createTour);


app
   .route('/api/v1/tours/:id')
   .get(getIndividualTour)
   .patch(updateTour)
   .delete(deleteTour);


// users
app
   .route('/api/v1/users')
   .get(getAllUsers)
   .post(createUser);


app
   .route('/api/v1/users/:id')
   .get(getIndividualUser)
   .patch(updateUser)
   .delete(deleteUser);