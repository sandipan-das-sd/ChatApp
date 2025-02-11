


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
// // app.use(cors({
// //     origin: function (origin, callback) {
// //         const allowedOrigins = [process.env.FRONTEND_URL, 'https://chat-app-psi-three-33.vercel.app'];
// //         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
// //             callback(null, true);
// //         } else {
// //             callback(new Error('Not allowed by CORS'));
// //             console.log("Not allowed by cors")
// //         }
// //     },
// //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific methods
// //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow specific headers
// //     credentials: true,
// // }));
// // app.options('*', cors()); // Allow preflight requests for all routes

// app.use(cors({
//     // origin: true, // Allow all origins
//     origin: [
//         'https://chat-app-client-black.vercel.app',
//         'http://localhost:3000'
//       ],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific methods
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow specific headers
//     credentials: true, // Allow credentials (cookies, authorization headers, etc.)
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

// // Auth routes


// // Connect to the database and start the server
// connectDB().then(() => {
//     server.listen(PORT, () => {
//         console.log("Server Running at " + PORT);
//     });
// }).catch(err => {
//     console.error("Failed to connect to the database", err);
// });
// server/index.js
const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const connectDB = require("./db/Connection");
const router = require("./routes/index");
const cookieParser = require('cookie-parser');
const { createServer } = require('http');

dotenv.config();
const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: [
    'https://chat-app-client-black.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Server running successfully!"
  });
});

app.use('/api', router);

const PORT = process.env.PORT || 8080;

// Start server only after DB connection
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server Running at ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to the database", err);
  });

module.exports = { app, server };