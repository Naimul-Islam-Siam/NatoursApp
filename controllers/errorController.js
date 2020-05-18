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
      sendErrorProd(err, res);
   }

   next();
};