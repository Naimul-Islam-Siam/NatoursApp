const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

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

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// import data to DB
const importData = async () => {
   try {
      await Tour.create(tours);
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