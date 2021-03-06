const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // configure dotenv file

// uncaught exceptions.
process.on('uncaughtException', err => {
   console.log('Uncaught Exception 💥💥💥. Shutting down...');
   console.log(err.name, err.message);

   process.exit(1); // 1 stands for uncalled exception; will shut the app down
});


const app = require('./app'); // must be after dotenv config
const mongoose = require('mongoose');

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


// Server initialization
const port = process.env.PORT || 9090;

const server = app.listen(port, () => {
   console.log(`Listening to port ${port}`);
});


// Global promise rejection handler
// errors that happen outside express. For example database in inaccessible or crashed
// handle unhandled promise rejection
process.on('unhandledRejection', err => {
   console.log('Unhandled Rejection 💥💥💥. Shutting down...');
   console.log(err.name, err.message);

   // server.close gives the server time to finish all requests that are pending or being handled
   // otherwise porcess.exit would trigger immediately and shut the app instantly which is not good
   server.close(() => {
      process.exit(1); // 1 stands for uncalled exception; will shut the app down
   });
});


// heroku sends SIGTERM signal every 24h which causes abrupt shut down 
// to shut down gracefully, we use server.close()
process.on('SIGTERM', () => {
   console.log('👋 SIGTERM Received. Shutting down gracefully.');
   server.close(() => {
      console.log('💥 Process Terminated!');
   });
});