const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // configure dotenv file
const app = require('./app'); // must be after dotenv config
const mongoose = require('mongoose');


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


// Server initialization
const port = process.env.PORT || 9090;

app.listen(port, () => {
   console.log(`Listening to port ${port}`);
});