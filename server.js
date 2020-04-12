const app = require('./app');
const port = 8080;

// Server initialization
app.listen(port, () => {
   console.log(`Listening to port ${port}`);
});