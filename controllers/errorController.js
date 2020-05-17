// GLOBAL Error Handling Middleware
module.exports = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500; // 500 = internal server error
   err.status = err.status || 'error'; // status = fail/error

   res.status(err.statusCode).json({
      status: err.status,
      message: err.message
   });

   next();
};