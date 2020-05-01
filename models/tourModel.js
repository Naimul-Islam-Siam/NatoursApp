const mongoose = require('mongoose');

// schema
const tourSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: [true, 'Tour name already exist'],
      trim: true
   },
   duration: {
      type: Number,
      required: [true, 'A tour must have duration']
   },
   maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
   },
   difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty mentioned']
   },
   // the actual rating
   ratingsAverage: {
      type: Number,
      default: 4.5
   },
   // how many people gave rating
   ratingsQuantity: {
      type: Number,
      default: 0
   },
   price: {
      type: Number,
      required: [true, 'A tour must have a price'] // validator
   },
   priceDiscount: {
      type: Number
   },
   summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
   },
   description: {
      type: String,
      trim: true
   },
   imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
   },
   images: [String],
   // when is the post created
   createdAt: {
      type: Date,
      default: Date.now()
   },
   // when will the tour start
   startDates: [Date]
});

// model
const Tour = mongoose.model('Tour', tourSchema); // model name starts with capital letter

module.exports = Tour;