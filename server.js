const dotenv = require('dotenv');
const app = require('./app'); // must be after dotenv config
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' }); // configure dotenv file

const DB = process.env.DATABASE.replace(
   '<password>',
   process.env.DATABASE_PASSWORD
);

// connect mongoose
mongoose.connect(DB, {
   // these are like this for all projects
   useNewUrlParser: true,
   useCreateIndex: true,
   useFindAndModify: false
}).then(() => {
   console.log("DB connection successful")
});


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

// instance of document <row>
const testTour = new Tour({
   name: "The Park Camper",
   price: 297
});


// save the document in tours collection in the database
testTour.save().then(doc => {
   console.log(doc);
}).catch(err => {
   console.log(`ERROR 💥: ${err}`);
});


// Server initialization
const port = process.env.PORT || 9090;

app.listen(port, () => {
   console.log(`Listening to port ${port}`);
});