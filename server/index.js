// const express = require("express");
// const cors = require('cors');
// const dotenv = require("dotenv");
// const connectDB = require("./db/Connection");
// const router = require("./routes/index");
// const cookieParser = require('cookie-parser');
// const { app, server } = require('./socket/index'); // Import the app and server from socket/index

// // Load environment variables
// dotenv.config();

// const PORT = process.env.PORT || 8080;

// // Middleware
// app.use(cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
  
// }));
// app.options('*', cors()); // Allow preflight requests for all routes

// app.use(express.json()); // To parse incoming JSON requests
// app.use(cookieParser());

// // Root route
// app.get("/", (req, res) => {
//     res.json({
//         message: "Hey, Congratulations!!! Server is running successfully!!"
//     });
// });

// // API endpoints
// app.use('/api', router);

// // Connect to the database and start the server
// connectDB().then(() => {
//     server.listen(PORT, () => {
//         console.log("Server Running at " + PORT);
//     });
// }).catch(err => {
//     console.error("Failed to connect to the database", err);
// });


const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const connectDB = require("./db/Connection");
const router = require("./routes/index");
const cookieParser = require('cookie-parser');
const { app, server } = require('./socket/index'); // Import the app and server from socket/index
const passport = require('./config/passport-setup'); // Correctly import the passport setup
const session = require('express-session');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.options('*', cors()); // Allow preflight requests for all routes

app.use(express.json()); // To parse incoming JSON requests
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: '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',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "Hey, Congratulations!!! Server is running successfully!!"
    });
});

// API endpoints
app.use('/api', router);

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Connect to the database and start the server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server Running at " + PORT);
    });
}).catch(err => {
    console.error("Failed to connect to the database", err);
});
