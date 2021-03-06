const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const bookingController = require('./controllers/bookingController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');


app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//============================
// Middlewares
//============================

// --- middlewares used for all routes ---

// middlewares are added in the middleware stack in order

// set security HTTP headers
app.use(helmet());

// cors implement
app.use(cors()); // this way only works for simple requests(get, post req)

app.options('*', cors()); // implement cors for complex requests on every route

// limit number of requests
const limiter = rateLimit({
   max: 100,
   windows: 60 * 60 * 1000, // 1 hour
   message: 'Too many requests from this IP. Try again in an hour'
});
app.use('/api', limiter);


// stripe webhooks
app.post(
   '/webhook-checkout',
   express.raw({ type: 'application/json' }),
   bookingController.webhookCheckout
);


// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // otherwise post request won't work
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // deals with form data (updating user data)
app.use(cookieParser());

// data sanitization against NOSQL injection
app.use(mongoSanitize());

// data sanitization against XSS attacks
app.use(xss()); //against malicious html and js

// prevent parameter pollution
app.use(hpp({
   whitelist: ['duration', 'price', 'ratingsAverage', 'ratingsQuantity', 'difficulty', 'maxGroupSize']
}));

// serve static files; public folder is for static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));


app.use(compression());


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
// reviews
app.use('/api/v1/reviews', reviewRouter);
// bookings
app.use('/api/v1/bookings', bookingRouter);
// views
app.use('/', viewRouter);

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