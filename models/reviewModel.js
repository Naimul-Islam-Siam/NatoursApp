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
   await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].numRatings
   });
};


reviewSchema.post('save', function () {
   // `this` points to the current document(current tour)\
   // `this.constructor` points to current Model (We can't use Review.calcAverageRatings here, as `Review` is created after this middleware)

   this.constructor.calcAverageRatings(this.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;