const AppError = require('./../utils/appError');

const handleErrorDB = (error) => {
   const message = `Invalid ${error.path}: ${error.value}`;
   return new AppError(message, 400); // 400 = bad request
};


const handleDuplicateFieldDB = (error) => {
   const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
   const message = `Field value: ${value} already exists. Please try another.`;

   return new AppError(message, 400);
};


const sendErrorDev = (err, res) => {
   res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
   });
};


const sendErrorProd = (err, res) => {
   // operational errors: send message to client
   if (err.isOperational) {
      res.status(err.statusCode).json({
         status: err.status,
         message: err.message
      });
   } else {
      // programming error, third pirty error: don't leak details of errors to client
      console.error('ERROR 💥', err);

      res.status(500).json({
         status: 'error',
         message: 'Something went very wrong'
      });
   }
};


// GLOBAL Error Handling Middleware
module.exports = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500; // 500 = internal server error
   err.status = err.status || 'error'; // status = fail/error

   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, res);
   } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err }; // hard copy of err it's not good practice to directly manipulate the argument

      // for invalid id
      if (error.name === 'CastError') {
         error = handleErrorDB(error);
      }

      // for duplicate fields. For example a tour name that already exists is used again in future for another tour
      if (error.code === 11000) {
         error = handleDuplicateFieldDB(error);
      }

      sendErrorProd(error, res);
   }

   next();
};