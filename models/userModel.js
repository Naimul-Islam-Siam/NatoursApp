const mongoose = require('mongoose');
const validator = require('validator');

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
      required: [true, 'Type your password again for cofirming']
   }
});


const User = mongoose.model('User', userSchema);

module.exports = User;