const mongoose = require('mongoose');
const validator = require('validator');
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
   passwordChangedAt: Date
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
userSchema.methods.correctPassword = async function (inputPass, encryptedPass) {
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


const User = mongoose.model('User', userSchema);

module.exports = User;