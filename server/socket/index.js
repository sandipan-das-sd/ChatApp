const express = require("express");
const { Server } = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');
const getUserDetailsfromToken = require('../helpers/getUserDeatilsFromToken');
const UserModel = require("../db/models/UserModel");
const { profile } = require("console");

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Online users
const onlineUser = new Set();

io.on('connection', async (socket) => {
  console.log("Connected user", socket.id);
  const token = socket.handshake.auth.token;
  // console.log("Token", token);

  // Current user details
  const user = await getUserDetailsfromToken(token);

  // Create a room
  socket.join(user?._id);
  onlineUser.add(user?._id.toString());

  // Send online user to client side
  io.emit("Online User", Array.from(onlineUser));
  socket.on('message-page', async (userId) => {
    console.log('userId', userId)
    const userDetails = await UserModel.findById(userId).select("-password")
    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: onlineUser.has(userId)
    }
    socket.emit('message-user', payload)
    console.log(payload)
  })
  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Disconnected user", socket.id);
    onlineUser.delete(user?._id);
    io.emit("Online User", Array.from(onlineUser));
  });
});

module.exports = { app, server };
