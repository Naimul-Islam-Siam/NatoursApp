const express = require('express');
const morgan = require('morgan');
const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


//============================
// Middlewares
//============================

// --- middlewares used for all routes ---

app.use(express.json()); // otherwise post request won't work

app.use(express.static(`${__dirname}/public`)); // serve static files; public folder is for static files

// custom middleware
app.use((req, res, next) => {
   req.requestTime = new Date().toISOString();
   next(); // this is a must, otherwise won't work
});

// third party middleware
if (process.env.NODE_ENV === "development") {
   app.use(morgan('dev'));
}

//============================
// Routes
//============================

// tours
app.use('/api/v1/tours', tourRouter); // route mounting; middleware used for only tourRouter
// users
app.use('/api/v1/users', userRouter); // route mounting; middleware used for only userRouter



module.exports = app;