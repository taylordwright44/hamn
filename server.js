const HyperExpress = require('hyper-express');
const dotenv = require('dotenv');
const colors = require('colors'); //this is being used, it just doesn't show up. Anything with a color such as .red after it is colors
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });
// Connect to Database
connectDB();
//routes
const posts = require('./routes/posts');
const comments = require('./routes/comments');
const auth = require('./routes/auth');

const PORT = process.env.PORT || 5000;
const app = new HyperExpress.Server();

// Mounting the routers
app.use('/api/posts', posts);
app.use('/api/comments', comments);
app.use('/api/auth', auth);

//this will be hit by anything that doesn't match the mounted routes.
app.any('*', (req, res) => {
    res.status(404).json({ error: 'Route does not exist.' });
});

const server = app.listen(PORT, () =>
    console.log(`Listening in ${process.env.NODE_ENV.yellow.bold} mode on port ${PORT.yellow.bold}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message.red.bold}`);
    // Close server and exit process. For a bad database mainly. (I need to change this, it's server.close in express, dunno about hyper express)
    // server.close(() => process.exit(1));
});