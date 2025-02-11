

// const express = require("express");
// const { Server } = require('socket.io');
// const http = require('http');
// const dotenv = require('dotenv');
// const getUserDetailsfromToken = require('../helpers/getUserDeatilsFromToken');
// const UserModel = require("../db/models/UserModel");
// const { ConversationModel, MessageModel } = require("../db/models/ConversationModel");
// const getConversation = require('../helpers/getConversation');
// dotenv.config();

// const app = express();

// const server = http.createServer(app);


// // const io = new Server(server, {
// //   cors: {
// //     // origin: "https://chat-app-client-black.vercel.app", // Allow all origins
// //     origin: [
// //       "https://chat-app-client-black.vercel.app",
// //       "http://localhost:3000" // Add your local development URL
// //     ],
// //     methods: ['GET', 'POST','PUT','PATCH','DELETE','OPTIONS'], // Allow specific methods
// //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow specific headers
// //     credentials: true, // Allow credentials (cookies, etc.)
  
// //     transports: ['websocket', 'polling'],
// //     pingTimeout: 60000,
// //     pingInterval: 25000
// //   }
// // });

// const io = new Server(server, {
//   cors: {
//     origin: [
//       "https://chat-app-client-black.vercel.app",
//       "http://localhost:3000"
//     ],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: [
//       'Content-Type', 
//       'Authorization', 
//       'X-Requested-With'
//     ],
//     credentials: true
//   },
//   transports: ['websocket', 'polling'],
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   connectionStateRecovery: {
//     maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
//     skipMiddlewares: true,
//   },
//   allowEIO3: true, // Enable compatibility with Socket.IO v3 clients
//   maxHttpBufferSize: 1e6, // 1MB
//   path: '/socket.io/', // Explicitly set the default path
//   serveClient: false // Don't serve client files
// });

// // Add error handling
// io.engine.on("connection_error", (err) => {
//   console.log('Connection error:', err.req);	    // the request object
//   console.log('Error message:', err.code);     // the error code
//   console.log('Error message:', err.message);  // the error message
//   console.log('Error context:', err.context);  // some additional error context
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
//     // Update last seen timestamp
//     await UserModel.findByIdAndUpdate(user._id, { lastSeen: new Date() });
//     const updatedUser = await UserModel.findById(user._id);
//     console.log("User last seen updated:", updatedUser.lastSeen);
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
//           online: onlineUsers.has(userId),
//           lastSeen: userDetails.lastSeen
//         };
//         socket.emit('message-user', payload);
//         console.log(payload);
//         console.log("Emitted user data with lastSeen:", payload.lastSeen);

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
//       // Update last seen timestamp
//       await UserModel.findByIdAndUpdate(data?.msgByUserId, { lastSeen: new Date() });
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
//         fileUrl:data.fileUrl,
//         fileType:data.fileType,
//         fileName:data.fileName,
//         msgByUserId: data?.msgByUserId
//       });
//       console.log(message.fileType)
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

//       io.to(data?.sender).emit('message', getConversationMessage?.messages || []);
//       io.to(data?.receiver).emit('message', getConversationMessage?.messages || []);

//       // Send updated conversation
//       const conversationSender = await getConversation(data?.sender);
//       const conversationReceiver = await getConversation(data?.receiver);

//       io.to(data?.sender).emit('conversation', conversationSender);
//       io.to(data?.receiver).emit('conversation', conversationReceiver);
//     });

//     // Sidebar
//     socket.on('sidebar', async (currentUserId) => {
//       console.log("Current User", currentUserId);
//       const conversation = await getConversation(currentUserId);
//       socket.emit('conversation', conversation);
//     });

//     // Seen logic
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
//     // Handle disconnect
//     // Handle disconnect
//     socket.on("disconnect", async () => {
//       try {
//         console.log("Disconnected user", socket.id);
//         onlineUsers.delete(user._id.toString());
//         io.emit("Online User", Array.from(onlineUsers));

//         // Update lastSeen in the database
//         await UserModel.findByIdAndUpdate(user._id, { lastSeen: new Date() });

//         // Fetch updated user details
//         const updatedUser = await UserModel.findById(user._id);
//         console.log("User last seen updated:", updatedUser.lastSeen);

//         // Emit updated user data with correct lastSeen timestamp
//         const payload = {
//           _id: updatedUser._id,
//           name: updatedUser.name,
//           email: updatedUser.email,
//           profile_pic: updatedUser.profile_pic,
//           online: false, // Since the user is now disconnected
//           lastSeen: updatedUser.lastSeen
//         };
//         socket.emit('message-user', payload);
//         console.log("Emitted user data with lastSeen:", payload.lastSeen);

//         // Emit online user list
//         io.emit("Online User", Array.from(onlineUsers));

//       } catch (error) {
//         console.error("Error during disconnect:", error);
//       }
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

// Initialize Socket.IO with configuration
const io = new Server(server, {
  cors: {
    origin: [
      "https://chat-app-client-black.vercel.app",
      "http://localhost:3000"
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With'
    ],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  allowEIO3: true,
  maxHttpBufferSize: 1e6,
  path: '/socket.io/',
  serveClient: false
});

// Add global error handling
io.engine.on("connection_error", (err) => {
  console.log('Connection error:', err.req);
  console.log('Error message:', err.code);
  console.log('Error message:', err.message);
  console.log('Error context:', err.context);
});

// Track online users
const onlineUsers = new Set();

// Main connection handler
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

    // Update user status and create room
    await UserModel.findByIdAndUpdate(user._id, { lastSeen: new Date() });
    const updatedUser = await UserModel.findById(user._id);
    console.log("User last seen updated:", updatedUser.lastSeen);
    
    socket.join(user._id.toString());
    onlineUsers.add(user._id.toString());
    io.emit("Online User", Array.from(onlineUsers));

    // Message page handler
    socket.on('message-page', async (userId) => {
      try {
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
          console.log("Emitted user data with lastSeen:", payload.lastSeen);

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
      } catch (error) {
        console.error('Error in message-page handler:', error);
      }
    });

    // // New message handler
    // socket.on('new message', async (data) => {
    //   try {
    //     await UserModel.findByIdAndUpdate(data?.msgByUserId, { lastSeen: new Date() });
    //     let conversation = await ConversationModel.findOne({
    //       "$or": [
    //         { sender: data?.sender, receiver: data?.receiver },
    //         { sender: data?.receiver, receiver: data?.sender }
    //       ]
    //     });

    //     if (!conversation) {
    //       const createConversation = await ConversationModel({
    //         sender: data?.sender,
    //         receiver: data?.receiver
    //       });
    //       conversation = await createConversation.save();
    //     }

    //     const message = await MessageModel({
    //       text: data.text,
    //       imageUrl: data.imageUrl,
    //       videoUrl: data.videoUrl,
    //       audioUrl: data.audioUrl,
    //       fileUrl: data.fileUrl,
    //       fileType: data.fileType,
    //       fileName: data.fileName,
    //       msgByUserId: data?.msgByUserId
    //     });

    //     const saveMessage = await message.save();
    //     await ConversationModel.updateOne(
    //       { _id: conversation._id },
    //       { "$push": { messages: saveMessage._id } }
    //     );

    //     const getConversationMessage = await ConversationModel.findOne({
    //       "$or": [
    //         { sender: data?.sender, receiver: data?.receiver },
    //         { sender: data?.receiver, receiver: data?.sender }
    //       ]
    //     }).populate('messages').sort({ updatedAt: -1 });

    //     io.to(data?.sender).emit('message', getConversationMessage?.messages || []);
    //     io.to(data?.receiver).emit('message', getConversationMessage?.messages || []);

    //     const [conversationSender, conversationReceiver] = await Promise.all([
    //       getConversation(data?.sender),
    //       getConversation(data?.receiver)
    //     ]);

    //     io.to(data?.sender).emit('conversation', conversationSender);
    //     io.to(data?.receiver).emit('conversation', conversationReceiver);
    //   } catch (error) {
    //     console.error('Error in new message handler:', error);
    //   }
    // });
// Add this to your 'new message' socket handler for debugging
socket.on('new message', async (data) => {
  try {
    console.log('Received new message data:', data);
    
    // 1. Check if required fields are present
    if (!data?.sender || !data?.receiver || !data?.msgByUserId) {
      console.error('Missing required fields:', { 
        sender: data?.sender, 
        receiver: data?.receiver, 
        msgByUserId: data?.msgByUserId 
      });
      return;
    }

    // 2. Find or create conversation with detailed logging
    let conversation = await ConversationModel.findOne({
      "$or": [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender }
      ]
    });
    
    console.log('Existing conversation:', conversation);

    if (!conversation) {
      console.log('Creating new conversation...');
      const createConversation = new ConversationModel({
        sender: data.sender,
        receiver: data.receiver
      });
      conversation = await createConversation.save();
      console.log('New conversation created:', conversation);
    }

    // 3. Create and save message with validation
    const messageData = {
      text: data.text || '',
      imageUrl: data.imageUrl || '',
      videoUrl: data.videoUrl || '',
      audioUrl: data.audioUrl || '',
      fileUrl: data.fileUrl || '',
      fileType: data.fileType || '',
      fileName: data.fileName || '',
      msgByUserId: data.msgByUserId,
      delivered: false,
      seen: false
    };

    console.log('Creating new message with data:', messageData);
    
    const message = new MessageModel(messageData);
    const savedMessage = await message.save();
    console.log('Message saved successfully:', savedMessage);

    // 4. Update conversation with new message
    const updateResult = await ConversationModel.updateOne(
      { _id: conversation._id },
      { 
        "$push": { messages: savedMessage._id },
        "$set": { updatedAt: new Date() }
      }
    );
    console.log('Conversation update result:', updateResult);

    // 5. Fetch updated conversation messages
    const updatedConversation = await ConversationModel.findOne({
      "_id": conversation._id
    }).populate('messages');
    
    console.log('Emitting updated messages to rooms:', {
      sender: data.sender,
      receiver: data.receiver
    });

    // 6. Emit messages to both users
    io.to(data.sender).emit('message', updatedConversation.messages);
    io.to(data.receiver).emit('message', updatedConversation.messages);

  } catch (error) {
    console.error('Error in new message handler:', error);
  }
});
    // Sidebar handler
    socket.on('sidebar', async (currentUserId) => {
      try {
        console.log("Current User", currentUserId);
        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
      } catch (error) {
        console.error('Error in sidebar handler:', error);
      }
    });

    // Seen message handler
    socket.on('seen', async (msgByUserId) => {
      try {
        let conversation = await ConversationModel.findOne({
          "$or": [
            { sender: user?._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: user?._id }
          ]
        });

        if (conversation) {
          const conversationMessageIds = conversation.messages || [];
          await MessageModel.updateMany(
            { _id: { "$in": conversationMessageIds }, msgByUserId: msgByUserId },
            { "$set": { seen: true } }
          );

          const [conversationReceiver, conversationSender] = await Promise.all([
            getConversation(msgByUserId),
            getConversation(user?._id.toString())
          ]);

          io.to(user?._id.toString()).emit('conversation', conversationSender);
          io.to(msgByUserId).emit('conversation', conversationReceiver);
        } else {
          console.log("Conversation not found between users", user?._id, "and", msgByUserId);
        }
      } catch (error) {
        console.error("Error in 'seen' event handler:", error);
      }
    });

    // Disconnect handler
    socket.on("disconnect", async () => {
      try {
        console.log("Disconnected user", socket.id);
        onlineUsers.delete(user._id.toString());
        
        await UserModel.findByIdAndUpdate(user._id, { lastSeen: new Date() });
        const updatedUser = await UserModel.findById(user._id);
        console.log("User last seen updated:", updatedUser.lastSeen);

        const payload = {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profile_pic: updatedUser.profile_pic,
          online: false,
          lastSeen: updatedUser.lastSeen
        };
        socket.emit('message-user', payload);
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