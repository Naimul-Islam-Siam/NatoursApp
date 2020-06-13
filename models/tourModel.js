const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

// schema
const tourSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: [true, 'Tour name already exist'],
      maxlength: [40, 'A tour name can have maximum 40 characters'], // validator
      minlength: [10, 'A tour name must contain at least 10 characters'], // validator
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
      required: [true, 'A tour must have difficulty mentioned'],
      enum: {
         values: ['easy', 'medium', 'difficult'],
         message: 'Difficulty is either: easy, medium or difficult'
      }
   },
   // the actual rating
   ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating can not be less than 1'], // validator
      max: [5, 'Rating can not be more than 5'], // validator
      set: value => Math.round(value * 10) / 10 // 4.666 -> 4.7
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
      type: Number,
      // discount can't be more than regular price
      validate: {
         validator: function (value) {
            return value < this.price; // works only when a new document is created, so won't work while making a update req
         },
         message: 'Discount must be less than the regular price'
      }
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
   },
   startLocation: {
      // GeoJSON
      type: {
         type: String,
         default: 'Point',
         enum: ['Point']
      },
      coordinates: [Number], // array of numbers [longitude, latitude]
      address: String,
      description: String
   },
   locations: [
      {
         type: {
            type: String,
            default: 'Point',
            enum: ['Point']
         },
         coordinates: [Number],
         address: String,
         description: String,
         day: Number // the day in which people will go to tour
      }
   ],
   guides: [
      {
         type: mongoose.Schema.ObjectId,
         ref: 'User'
      }
   ]
}, {
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
}); // otherwise virtual properties will be ignored


tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual properties: we don't need to store durationWeeks in database as duration is already stored
// virtual property will make the duration converted to weeks after retrieving from the database
tourSchema.virtual('durationWeeks').get(function () {
   return this.duration / 7;
}); // must use normal function instead of arrow func. as 'this' will be pointing to schema


// virtual populate
// 'reviews' is the new virtual field in which reviews will be outputed in tour
tourSchema.virtual('reviews', {
   ref: 'Review', // the model that will be refered
   foreignField: 'tour', // foreignField is the field that's in the ref model, where the reference to current model is stored
   localField: '_id' // the field of current model that's stored in the ref model
});


// document middleware, manipulate the documents that are currently being saved
// runs before .save() and .create()
// doesn't run for update, insertMany
tourSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});


// // extract guides from users using id and add in tours
// tourSchema.pre('save', async function (next) {
//    const guidesPromises = this.guides.map(async id => User.findById(id)); // will return promises
//    this.guides = await Promise.all(guidesPromises);

//    next();
// });


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


// will populate all queries starting with 'find'
tourSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt' // will hide these 2
   });

   next();
});


// Aggregation Middleware
// for aggregation pipeline
tourSchema.pre('aggregate', function (next) {
   this.pipeline().unshift({
      $match: { secretTour: { $ne: true } }
   });
   next();
});


// model
const Tour = mongoose.model('Tour', tourSchema); // model name starts with capital letter

module.exports = Tour;