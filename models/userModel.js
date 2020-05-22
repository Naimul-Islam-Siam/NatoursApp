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
      minlength: 8
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


const User = mongoose.model('User', userSchema);

module.exports = User;