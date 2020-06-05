const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' }); // configure dotenv file

const DB = process.env.DATABASE.replace(
   '<password>',
   process.env.DATABASE_PASSWORD
);

// connect mongoose
mongoose.connect(DB, {
   // these are like this for all projects
   useUnifiedTopology: true,
   useNewUrlParser: true,
   useCreateIndex: true,
   useFindAndModify: false
}).then(() => {
   console.log("DB connection successful")
});

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// import data to DB
const importData = async () => {
   try {
      await Tour.create(tours);
      await User.create(users);
      await Review.create(reviews);

      console.log("Data successfully loaded");
   } catch (error) {
      console.log(error);
   }
   process.exit(); // it's an aggressive approach, but not a problem here
};

// delete all data from the DB
const deleteData = async () => {
   try {
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();

      console.log("Data successfully deleted");
   } catch (error) {
      console.log(error);
   }
   process.exit();
};

// command line commands
if (process.argv[2] === '--import') {
   importData(); // node dev-data/data/import-dev-data.js --import
} else if (process.argv[2] === '--delete') {
   deleteData(); // node dev-data/data/import-dev-data.js --delete
}