const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// must be after dotenv config
const app = require('./app');

// Server initialization
const port = process.env.PORT || 9090;

app.listen(port, () => {
   console.log(`Listening to port ${port}`);
});