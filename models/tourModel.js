const mongoose = require('mongoose');

// schema
const tourSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: [true, 'Tour name already exist']
   },
   rating: {
      type: Number,
      default: 4.5,

   },
   price: {
      type: Number,
      required: [true, 'A tour must have a price'] // validator
   }
});

// model
const Tour = mongoose.model('Tour', tourSchema); // model name starts with capital letter

module.exports = Tour;