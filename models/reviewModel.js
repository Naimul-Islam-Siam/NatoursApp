const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
   review: {
      type: String,
      required: [true, `Review cannot be empty.`]
   },
   rating: {
      type: Number,
      min: 1,
      max: 5
   },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
   },
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
   }
}, {
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
});


// prevent duplicate reviews from the same user on the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // combination of tour & user is gotta be unique


reviewSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'user',
      select: 'name photo'
   });

   // didn't populate tour to avoid populate chain which can cause performance issues

   next();
});


// calculates the number of ratings and average rating of a particular tour
// used statics to use aggregate so that `this` points to the model while using `this.aggregate`
reviewSchema.statics.calcAverageRatings = async function (tourId) {
   const stats = await this.aggregate([
      {
         $match: { tour: tourId }
      },
      {
         $group: {
            _id: '$tour',
            numRatings: { $sum: 1 },
            avgRating: { $avg: '$rating' }
         }
      }
   ]);

   // update the tour with new stats and save
   if (stats.length > 0) {
      // only if the tour has any review at the first place
      await Tour.findByIdAndUpdate(tourId, {
         ratingsAverage: stats[0].avgRating,
         ratingsQuantity: stats[0].numRatings
      });
   } else {
      await Tour.findByIdAndUpdate(tourId, {
         ratingsAverage: 4.5, // default
         ratingsQuantity: 0
      });
   }
};


reviewSchema.post('save', function () {
   // `this` points to the current document(current tour)\
   // `this.constructor` points to current Model (We can't use Review.calcAverageRatings here, as `Review` is created after this middleware)

   this.constructor.calcAverageRatings(this.tour); // this.tour will provide the tour id
});


// following 2 are for findByIdAndUpdate and findByIdAndDelete (can't use document middleware)
// Query Middlewares
reviewSchema.pre(/^findOneAnd/, async function (next) {
   // `this.review` instead of `const review` to pass the data from pre to post
   this.review = await this.findOne(); // retrieve current doc from DB, as document middlewares can't be use 
   next();
});


reviewSchema.post(/^findOneAnd/, async function () {
   await this.review.constructor.calcAverageRatings(this.review.tour); // this.tour will provide the tour id
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;