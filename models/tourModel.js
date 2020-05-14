const mongoose = require('mongoose');
const slugify = require('slugify');

// schema
const tourSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: [true, 'Tour name already exist'],
      trim: true
   },
   slug: {
      type: String
   },
   duration: {
      type: Number, // in days
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
      default: Date.now(),
      select: false
   },
   // when will the tour start
   startDates: [Date],
   secretTour: {
      type: Boolean,
      default: false
   }
}, {
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
}); // otherwise virtual properties will be ignored


// virtual properties: we don't need to store durationWeeks in database as duration is already stored
// virtual property will make the duration converted to weeks after retrieving from the database
tourSchema.virtual('durationWeeks').get(function () {
   return this.duration / 7;
}); // must use normal function instead of arrow func. as 'this' will be pointing to schema


// document middleware, manipulate the documents that are currently being saved
// runs before .save() and .create()
// doesn't run for update, insertMany
tourSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});


// Query middleware
tourSchema.pre(/^find/, function (next) {
   // any string starting with find will trigger this middleware function
   // without regular expression we would've to mention one for find, one for findOne and so on...
   // we need it cause normally this function affects getAllTours but doesn't affect getIndividulTour 
   this.find({ secretTour: { $ne: true } });

   this.start = Date.now();

   next();
});


tourSchema.post(/^find/, function (docs, next) {
   console.log(`Query took ${Date.now() - this.start} milliseconds`);
   next();
});


// model
const Tour = mongoose.model('Tour', tourSchema); // model name starts with capital letter

module.exports = Tour;