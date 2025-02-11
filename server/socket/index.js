


// const express = require("express");
// const { Server } = require('socket.io');
// const http = require('http');
// const dotenv = require('dotenv');
// const getUserDetailsfromToken = require('../helpers/getUserDeatilsFromToken');
// const UserModel = require("../db/models/UserModel");
// const { ConversationModel, MessageModel } = require("../db/models/ConversationModel");
// const getConverSation=require('../helpers/getConversation')
// dotenv.config();

// const app = express();

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     credentials: true
//   }
// });

// // Online users
// const onlineUsers = new Set();

// io.on('connection', async (socket) => {
//   console.log("Connected user", socket.id);
//   const token = socket.handshake.auth.token;

//   if (!token) {
//     console.log("No token provided. Disconnecting socket", socket.id);
//     socket.disconnect(true);
//     return;
//   }

//   try {
//     const user = await getUserDetailsfromToken(token);

//     if (!user) {
//       console.log("Invalid user token. Disconnecting socket", socket.id);
//       socket.disconnect(true);
//       return;
//     }

//     // Create a room
//     socket.join(user?._id.toString());
//     onlineUsers.add(user?._id.toString());

//     // Send online user to client side
//     io.emit("Online User", Array.from(onlineUsers));

//     socket.on('message-page', async (userId) => {
//       console.log('userId', userId);
//       const userDetails = await UserModel.findById(userId).select("-password");
//       if (userDetails) {
//         const payload = {
//           _id: userDetails._id,
//           name: userDetails.name,
//           email: userDetails.email,
//           profile_pic: userDetails.profile_pic,
//           online: onlineUsers.has(userId)
//         };
//         socket.emit('message-user', payload);
//         console.log(payload);

//         // Get previous messages
//         const getConversationMessage = await ConversationModel.findOne({
//           "$or": [
//             { sender: user._id, receiver: userId },
//             { sender: userId, receiver: user._id }
//           ]
//         }).populate('messages').sort({ updatedAt: -1 });

//         socket.emit('message', getConversationMessage ? getConversationMessage.messages : []);
//       } else {
//         console.log('User not found:', userId);
//       }
//     });

//     // New message
//     socket.on('new message', async (data) => {
//       let conversation = await ConversationModel.findOne({
//         "$or": [
//           { sender: data?.sender, receiver: data?.receiver },
//           { sender: data?.receiver, receiver: data?.sender }
//         ]
//       });
//       console.log("Conversation", conversation);

//       if (!conversation) {
//         const createConversation = await ConversationModel({
//           sender: data?.sender,
//           receiver: data?.receiver
//         });
//         conversation = await createConversation.save();
//       }
//       const message = await MessageModel({
//         text: data.text,
//         imageUrl: data.imageUrl,
//         videoUrl: data.videoUrl,
//         audioUrl: data.audioUrl,
//         msgByUserId: data?.msgByUserId
//       });
//       const saveMessage = await message.save();

//       await ConversationModel.updateOne({ _id: conversation._id }, {
//         "$push": { messages: saveMessage._id }
//       });

//       const getConversationMessage = await ConversationModel.findOne({
//         "$or": [
//           { sender: data?.sender, receiver: data?.receiver },
//           { sender: data?.receiver, receiver: data?.sender }
//         ]
//       }).populate('messages').sort({ updatedAt: -1 });

//       io.to(data?.sender).emit('message', getConversationMessage?.messages|| []);
//       io.to(data?.receiver).emit('message', getConversationMessage?.messages || []);

//       //send conversation
//       const conversationSender= await getConverSation(data?.sender)

//       const conversationReceiver= await getConverSation(data?.receiver)

//       io.to(data?.sender).emit('conversation',conversationSender );
//       io.to(data?.receiver).emit('conversation',conversationReceiver );

//     });
//     //sidebar
//     socket.on('sidebar', async (currentUserId) => {
//       console.log("Current User", currentUserId)
//       const conversation= await getConverSation(currentUserId)
//       socket.emit('conversation', conversation)


//     })

//     socket.on('seen', async (msgByUserId) => {
//       try {
//         // Find the conversation between the current user and msgByUserId
//         let conversation = await ConversationModel.findOne({
//           "$or": [
//             { sender: user?._id, receiver: msgByUserId },
//             { sender: msgByUserId, receiver: user?._id }
//           ]
//         });

//         if (conversation) {
//           const conversationMessageIds = conversation.messages || [];

//           // Update the messages in the conversation to mark them as seen
//           await MessageModel.updateMany(
//             { _id: { "$in": conversationMessageIds }, msgByUserId: msgByUserId },
//             { "$set": { seen: true } }
//           );

//           // Get the updated conversation for both users
//           const conversationReceiver = await getConversation(msgByUserId);
//           const conversationSender = await getConversation(user?._id.toString());

//           // Emit the updated conversations to both users
//           io.to(user?._id.toString()).emit('conversation', conversationSender);
//           io.to(msgByUserId).emit('conversation', conversationReceiver);
//         } else {
//           console.log("Conversation not found between users", user?._id, "and", msgByUserId);
//         }
//       } catch (error) {
//         console.error("Error in 'seen' event handler:", error);
//       }
//     });


//     // Handle disconnect
//     socket.on("disconnect", () => {
//       console.log("Disconnected user", socket.id);
//       onlineUsers.delete(user._id.toString());
//       io.emit("Online User", Array.from(onlineUsers));
//     });

//   } catch (error) {
//     console.error("Error during connection handling:", error);
//     socket.disconnect(true);
//   }
// });

// module.exports = { app, server };

const express = require("express");
const { Server } = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');
const getUserDetailsfromToken = require('../helpers/getUserDeatilsFromToken');
const UserModel = require("../db/models/UserModel");
const { ConversationModel, MessageModel } = require("../db/models/ConversationModel");
const getConversation = require('../helpers/getConversation');
dotenv.config();

const app = express();

const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: function (origin, callback) {
//       const allowedOrigins = [process.env.FRONTEND_URL, 'https://chat-app-psi-three-33.vercel.app'];
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     methods: ['GET', 'POST'], // Allow specific methods
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow specific headers
//     credentials: true,
//   }
// });

const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins
    methods: ['GET', 'POST'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow specific headers
    credentials: true, // Allow credentials (cookies, etc.)
  }
});

// Online users
const onlineUsers = new Set();

io.on('connection', async (socket) => {
  console.log("Connected user", socket.id);
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log("No token provided. Disconnecting socket", socket.id);
    socket.disconnect(true);
    return;
  }

  try {
    const user = await getUserDetailsfromToken(token);

    if (!user) {
      console.log("Invalid user token. Disconnecting socket", socket.id);
      socket.disconnect(true);
      return;
    }
    // Update last seen timestamp
    await UserModel.findByIdAndUpdate(user._id, { lastSeen: new Date() });
    const updatedUser = await UserModel.findById(user._id);
    console.log("User last seen updated:", updatedUser.lastSeen);
    // Create a room
    socket.join(user?._id.toString());
    onlineUsers.add(user?._id.toString());

    // Send online user to client side
    io.emit("Online User", Array.from(onlineUsers));

    socket.on('message-page', async (userId) => {
      console.log('userId', userId);
      const userDetails = await UserModel.findById(userId).select("-password");
      if (userDetails) {
        const payload = {
          _id: userDetails._id,
          name: userDetails.name,
          email: userDetails.email,
          profile_pic: userDetails.profile_pic,
          online: onlineUsers.has(userId),
          lastSeen: userDetails.lastSeen
        };
        socket.emit('message-user', payload);
        console.log(payload);
        console.log("Emitted user data with lastSeen:", payload.lastSeen);

        // Get previous messages
        const getConversationMessage = await ConversationModel.findOne({
          "$or": [
            { sender: user._id, receiver: userId },
            { sender: userId, receiver: user._id }
          ]
        }).populate('messages').sort({ updatedAt: -1 });

        socket.emit('message', getConversationMessage ? getConversationMessage.messages : []);
      } else {
        console.log('User not found:', userId);
      }
    });

    // New message
    socket.on('new message', async (data) => {
      // Update last seen timestamp
      await UserModel.findByIdAndUpdate(data?.msgByUserId, { lastSeen: new Date() });
      let conversation = await ConversationModel.findOne({
        "$or": [
          { sender: data?.sender, receiver: data?.receiver },
          { sender: data?.receiver, receiver: data?.sender }
        ]
      });
      console.log("Conversation", conversation);

      if (!conversation) {
        const createConversation = await ConversationModel({
          sender: data?.sender,
          receiver: data?.receiver
        });
        conversation = await createConversation.save();
      }
      const message = await MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        audioUrl: data.audioUrl,
        fileUrl:data.fileUrl,
        fileType:data.fileType,
        fileName:data.fileName,
        msgByUserId: data?.msgByUserId
      });
      console.log(message.fileType)
      const saveMessage = await message.save();

      await ConversationModel.updateOne({ _id: conversation._id }, {
        "$push": { messages: saveMessage._id }
      });

      const getConversationMessage = await ConversationModel.findOne({
        "$or": [
          { sender: data?.sender, receiver: data?.receiver },
          { sender: data?.receiver, receiver: data?.sender }
        ]
      }).populate('messages').sort({ updatedAt: -1 });

      io.to(data?.sender).emit('message', getConversationMessage?.messages || []);
      io.to(data?.receiver).emit('message', getConversationMessage?.messages || []);

      // Send updated conversation
      const conversationSender = await getConversation(data?.sender);
      const conversationReceiver = await getConversation(data?.receiver);

      io.to(data?.sender).emit('conversation', conversationSender);
      io.to(data?.receiver).emit('conversation', conversationReceiver);
    });

    // Sidebar
    socket.on('sidebar', async (currentUserId) => {
      console.log("Current User", currentUserId);
      const conversation = await getConversation(currentUserId);
      socket.emit('conversation', conversation);
    });

    // Seen logic
    socket.on('seen', async (msgByUserId) => {
      try {
        // Find the conversation between the current user and msgByUserId
        let conversation = await ConversationModel.findOne({
          "$or": [
            { sender: user?._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: user?._id }
          ]
        });

        if (conversation) {
          const conversationMessageIds = conversation.messages || [];

          // Update the messages in the conversation to mark them as seen
          await MessageModel.updateMany(
            { _id: { "$in": conversationMessageIds }, msgByUserId: msgByUserId },
            { "$set": { seen: true } }
          );

          // Get the updated conversation for both users
          const conversationReceiver = await getConversation(msgByUserId);
          const conversationSender = await getConversation(user?._id.toString());

          // Emit the updated conversations to both users
          io.to(user?._id.toString()).emit('conversation', conversationSender);
          io.to(msgByUserId).emit('conversation', conversationReceiver);
        } else {
          console.log("Conversation not found between users", user?._id, "and", msgByUserId);
        }
      } catch (error) {
        console.error("Error in 'seen' event handler:", error);
      }
    });

    // Handle disconnect
    // Handle disconnect
    // Handle disconnect
    socket.on("disconnect", async () => {
      try {
        console.log("Disconnected user", socket.id);
        onlineUsers.delete(user._id.toString());
        io.emit("Online User", Array.from(onlineUsers));

        // Update lastSeen in the database
        await UserModel.findByIdAndUpdate(user._id, { lastSeen: new Date() });

        // Fetch updated user details
        const updatedUser = await UserModel.findById(user._id);
        console.log("User last seen updated:", updatedUser.lastSeen);

        // Emit updated user data with correct lastSeen timestamp
        const payload = {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profile_pic: updatedUser.profile_pic,
          online: false, // Since the user is now disconnected
          lastSeen: updatedUser.lastSeen
        };
        socket.emit('message-user', payload);
        console.log("Emitted user data with lastSeen:", payload.lastSeen);

        // Emit online user list
        io.emit("Online User", Array.from(onlineUsers));

      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    });



  } catch (error) {
    console.error("Error during connection handling:", error);
    socket.disconnect(true);
  }
});

module.exports = { app, server };

