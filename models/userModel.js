const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'You need to have a username']
   },
   email: {
      type: String,
      required: [true, 'You need to provide a email id'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email id']
   },
   photo: {
      type: String
   },
   role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
   },
   password: {
      type: String,
      required: [true, 'A password is required'],
      minlength: 8,
      select: false // don't show password
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Type your password again for cofirming'],
      validate: {
         // works only for create() and save()
         validator: function (el) {
            return el === this.password;
         },
         message: `Passwords are not the same`
      }
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   passwordResetExpires: Date,
   validated: {
      type: Boolean,
      default: false,
      select: false
   },
   active: {
      type: Boolean,
      default: true,
      select: false
   }
});


userSchema.pre('save', async function (next) {
   // only encrypt if the password is newly created or updated
   // don't encrypt it else, for example if email or username is updated
   if (!this.isModified('password')) return next();

   // encrypt
   // the number denotes how CPU intensive the program will be. The more the number the stronger the encryption will be but that will take lot more time
   this.password = await bcrypt.hash(this.password, 12);

   // after the validation passwordConfirm is not required in the database
   this.passwordConfirm = undefined;

   next();
});


// verify while logging in if inputed password is same as the password stored in DB
userSchema.methods.isCorrectPassword = async function (inputPass, encryptedPass) {
   return await bcrypt.compare(inputPass, encryptedPass);
};


// check if password is changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
   // if passwordChangedAt exists which means password is changed after token was issued
   if (this.passwordChangedAt) {
      const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); // convert date to seconds

      return JWTTimeStamp < changedTimeStamp; // if changedTimeStamp is greater than JWTTimeStamp(when token was issued), then return true(password is changed after token was issued)
   }

   // by default password is not changed
   return false;
};


// forgot password token
userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // store the token in encrypted form in DB

   this.passwordResetExpires = Date.now() + 5 * 60 * 1000; // expires in 5 min

   return resetToken; // send plain text token to the user via email, not the encrypted one for security. Otherwise there's no need to encrypt at all.
};


// update passwordChangedAt
userSchema.pre('save', function (next) {
   // if password is not modified or the document is new, don't do anything just move to next middleware
   if (!this.isModified('password') || this.isNew) {
      return next();
   }

   // minus 1s because sometimes the JWT token is received earlier than setting the passwordChangedAt, in that case it will cause problem
   this.passwordChangedAt = Date.now() - 1000;

   next();
});


// hide the documents that are not active
// apply to all the queries that start with 'find'
userSchema.pre(/^find/, function (next) {
   // this points to current query
   this.find({ active: { $ne: false } });

   next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;