class AppError extends Error {
   constructor(message, statusCode) {
      super(message); // built in Error class accepts only message argument
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // if status code is anything of 400 series(404), then status is 'fail' otherwise(500) 'error'
      this.isOperational = true;

      Error.captureStackTrace(this, this.constructor);
   };
};

module.exports = AppError;