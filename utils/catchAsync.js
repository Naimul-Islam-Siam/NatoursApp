module.exports = fn => {
   // returns a function that executes fn function
   // otherwise fn will be executed always even if the particular req is not sent
   // for example: createTour function will be executed even if a request to createTour is not sent
   return (req, res, next) => {
      fn(req, res, next).catch(err => next(err));
   };
};