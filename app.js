const fs = require('fs');
const express = require('express');
const app = express();
const port = 8080;

app.use(express.json()); //otherwise post request won't work

//server initialization
app.listen(port, () => {
   console.log(`Listening to port ${port}`);
});


//'tours-simple.json' is working as a database
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));



//get all tours
app.get('/api/v1/tours', (req, res) => {
   res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
         tours
      }
   });
});



//get individual tour
app.get('/api/v1/tours/:id', (req, res) => {
   const id = req.params.id * 1; //converts string to number
   const tour = tours.find(el => el.id === id);

   if (!tour) {
      return res.status(404).json({
         status: 'fail',
         message: "ID doesn't exit"
      });
   }

   res.status(200).json({
      status: 'success',
      data: {
         tour
      }
   });
});



//create new tours
app.post('/api/v1/tours', (req, res) => {
   const newId = tours[tours.length - 1].id + 1; //create new id
   const newTour = Object.assign({ id: newId }, req.body); //new tour object

   tours.push(newTour); //add with the exiting ones

   //update database
   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
      res.status(201).json({
         status: 'success',
         data: {
            tour: newTour
         }
      });
   });
});