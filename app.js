const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


//============================
// Middlewares
//============================

// --- middlewares used for all routes ---

// middlewares are added in the middleware stack in order

const limiter = rateLimit({
   max: 100,
   windows: 60 * 60 * 1000, // 1 hour
   message: 'Too many requests from this IP. Try again in an hour'
});
app.use('/api', limiter);


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


// unhandled routes - faulty req strcuture/mis-spelled
// this middleware will be triggered only if the middlewares mentioned above aren't triggered
app.all('*', (req, res, next) => {
   // res.status(404).json({
   //    status: 'fail',
   //    message: `Can't find ${req.originalUrl} on this server`
   // });
   // next();

   // same as above
   const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);

   next(err); // using global error handling 
}); // all stands for all the http methods (get, post, patch, delete)
// as their is no specific url, * will handle all the urls that are not handled


// GLOBAL Error Handling Middleware
app.use(globalErrorHandler);


module.exports = app;