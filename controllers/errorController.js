const AppError = require('./../utils/appError');

const handleErrorDB = (error) => {
   const message = `Invalid ${error.path}: ${error.value}`;
   return new AppError(message, 400); // 400 = bad request
};


const handleDuplicateFieldDB = (error) => {
   const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // extract string in between quotes " "
   const message = `Field value: ${value} already exists. Please try another.`;

   return new AppError(message, 400);
};


const handleValidationErrorDB = (error) => {
   const err = Object.values(error.errors).map(el => el.message);
   const message = `Invalid input: ${err.join('. ')}`;

   return new AppError(message, 400);
};


const handleJWTError = () => {
   return new AppError(`Invalid token. Please log in again.`, 401);
};


const handleJWTExpiredError = () => {
   return new AppError(`Token has expired. Please log in again.`, 401);
};


const sendErrorDev = (err, req, res) => {
   // A) API
   if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
         status: err.status,
         error: err,
         message: err.message,
         stack: err.stack
      });
   } else {
      // B) Rendered Website
      console.error('ERROR 💥', err);
      return res.status(err.statusCode).render('error', {
         title: 'Something went wrong!',
         msg: err.message
      });
   }
};


const sendErrorProd = (err, req, res) => {
   // A) API
   if (req.originalUrl.startsWith('/api')) {
      // operational errors: send message to client
      if (err.isOperational) {
         return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
         });
      } else {
         // programming error, third pirty error: don't leak details of errors to client
         console.error('ERROR 💥', err);

         return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
         });
      }
   } else {
      // B) Rendered Website
      // operational errors: send message to client
      if (err.isOperational) {
         return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
         });
      } else {
         // programming error, third pirty error: don't leak details of errors to client
         console.error('ERROR 💥', err);

         return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: 'Please try again later'
         });
      }
   }
};


// GLOBAL Error Handling Middleware
module.exports = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500; // 500 = internal server error
   err.status = err.status || 'error'; // status = fail/error

   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res);
   } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err }; // hard copy of err it's not good practice to directly manipulate the argument
      error.message = err.message; // otherwise doesn't work

      // for invalid id
      if (error.name === 'CastError') {
         error = handleErrorDB(error);
      }

      // for duplicate fields. For example a tour name that already exists is used again in future for another tour
      if (error.code === 11000) {
         error = handleDuplicateFieldDB(error);
      }

      // validation errors
      if (error.name === 'ValidationError') {
         error = handleValidationErrorDB(error);
      }

      // invalid token error
      if (error.name === 'JsonWebTokenError') {
         error = handleJWTError();
      }

      // token expired error
      if (error.name === 'TokenExpiredError') {
         error = handleJWTExpiredError();
      }

      sendErrorProd(error, req, res);
   }

   next();
};