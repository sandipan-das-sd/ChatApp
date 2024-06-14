

// // const express = require("express");
// // const { Server } = require('socket.io');
// // const http = require('http');
// // const dotenv = require('dotenv');
// // const getUserDetailsfromToken = require('../helpers/getUserDeatilsFromToken');
// // const UserModel = require("../db/models/UserModel");
// // const { profile } = require("console");
// // const{ConversationModel,MessageModel}=require("../db/models/ConversationModel")

// // dotenv.config();

// // const app = express();

// // const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: {
// //     origin: process.env.FRONTEND_URL,
// //     credentials: true
// //   }
// // });

// // // Online users

// // // Set to track online users by their user IDs
// // const onlineUser = new Set();

// // io.on('connection', async (socket) => {
// //   console.log("Connected user", socket.id);
// //   const token = socket.handshake.auth.token;

// //   // Current user details
// //   const user = await getUserDetailsfromToken(token);

// //   if (!user) {
// //     console.log("Invalid user token. Disconnecting socket", socket.id);
// //     socket.disconnect(true);
// //     return;
// //   }

// //   // Create a room
// //   // Join the socket to a room named by the user's ID
// //   socket.join(user._id.toString());
// //    // Add the user's ID to the set of online users
// //   onlineUser.add(user._id.toString());

// //   // Send online user to client side
// //    // Emit the updated list of online users to all connected clients
// //   io.emit("Online User", Array.from(onlineUser));

// //   socket.on('message-page', async (userId) => {
// //     console.log('userId', userId);
// //     const userDetails = await UserModel.findById(userId).select("-password");
// //     if (userDetails) {
// //       const payload = {
// //         _id: userDetails._id,
// //         name: userDetails.name,
// //         email: userDetails.email,
// //         profile_pic: userDetails.profile_pic,
// //         online: onlineUser.has(userId)
// //       };
// //       socket.emit('message-user', payload);
// //       console.log(payload);
// //     } else {
// //       console.log('User not found:', userId);
// //     }
// //   });


  
// //   // New message
// //   socket.on('new message', async(data) => {

// //     //Check Coversation is available both user
// //     let conversation= await ConversationModel.findOne({
// //       "$or":[
// //         {sender:data?.sender,receiver:data?.receiver},
// //         {sender:data?.receiver,receiver:data?.sender}
// //       ]
// //     })
// //     console.log("Convrsation",conversation)
// //     //if conversation is not available
// //     if(!conversation)
// //       {
// //         const createConversation =await ConversationModel({
// //           sender:data?.sender,
// //           receiver:data?.receiver
// //         })
// //         conversation=await createConversation.save()
// //       }
// //       const message=await MessageModel({
        
// //         text: data.text,
// //         imageUrl: data.imageUrl,
// //         videoUrl: data.videoUrl,
// //         audioUrl: data.audioUrl,
// //         msgByUserId:data?.msgByUserId
// //       })
// //       const saveMessage=await message.save()
// //     // console.log('new message', data);
// //     // console.log("Convrsation",conversation)
// //     // console.log("Sender Id:-",data.sender)
// //     // console.log("receiver Id :-",data.receiver)
  

// //     const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
// //       "$push" : { messages : saveMessage?._id }
// //   })
// //     const getConversationMessage=await ConversationModel.findOne({
// //       "$or":[
// //         {sender:data?.sender,receiver:data?.receiver},
// //         {sender:data?.receiver,receiver:data?.sender}
// //       ]
// //     }).populate('messages').sort({updateAt:-1})
// //     io.to(data?.sender).emit('message', getConversationMessage.messages)
// //     io.to(data?.receiver).emit('message', getConversationMessage.messages)
// //   });

// //   // Handle disconnect
// //   socket.on("disconnect", () => {
// //     console.log("Disconnected user", socket.id);
// //     // Remove the user's ID from the set of online users
// //     onlineUser.delete(user._id.toString());
// //     // Emit the updated list of online users to all connected clients
// //     io.emit("Online User", Array.from(onlineUser));
// //   });
// // });

// // module.exports = { app, server };

// const express = require("express");
// const { Server } = require('socket.io');
// const http = require('http');
// const dotenv = require('dotenv');
// const getUserDetailsfromToken = require('../helpers/getUserDeatilsFromToken');
// const UserModel = require("../db/models/UserModel");
// const { profile } = require("console");
// const{ConversationModel,MessageModel}=require("../db/models/ConversationModel")

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

// // Set to track online users by their user IDs
// const onlineUser = new Set();

// io.on('connection', async (socket) => {
//   console.log("Connected user", socket.id);
//   const token = socket.handshake.auth.token;

//   // Current user details
//   const user = await getUserDetailsfromToken(token);

//   if (!user) {
//     console.log("Invalid user token. Disconnecting socket", socket.id);
//     socket.disconnect(true);
//     return;
//   }

//   // Create a room
//   // Join the socket to a room named by the user's ID
//   socket.join(user._id.toString());
//    // Add the user's ID to the set of online users
//   onlineUser.add(user._id.toString());

//   // Send online user to client side
//    // Emit the updated list of online users to all connected clients
//   io.emit("Online User", Array.from(onlineUser));

//   socket.on('message-page', async (userId) => {
//     console.log('userId', userId);
//     const userDetails = await UserModel.findById(userId).select("-password");
//     if (userDetails) {
//       const payload = {
//         _id: userDetails._id,
//         name: userDetails.name,
//         email: userDetails.email,
//         profile_pic: userDetails.profile_pic,
//         online: onlineUser.has(userId)
//       };
//       socket.emit('message-user', payload);
//       console.log(payload);
//     } else {
//       console.log('User not found:', userId);
//     }
//   });


  
//   // New message
//   socket.on('new message', async(data) => {

//     //Check Coversation is available both user
//     let conversation= await ConversationModel.findOne({
//       "$or":[
//         {sender:data?.sender,receiver:data?.receiver},
//         {sender:data?.receiver,receiver:data?.sender}
//       ]
//     })
//     console.log("Convrsation",conversation)
//     //if conversation is not available
//     if(!conversation)
//       {
//         const createConversation =await ConversationModel({
//           sender:data?.sender,
//           receiver:data?.receiver
//         })
//         conversation=await createConversation.save()
//       }
//       const message=await MessageModel({
        
//         text: data.text,
//         imageUrl: data.imageUrl,
//         videoUrl: data.videoUrl,
//         audioUrl: data.audioUrl,
//         msgByUserId:data?.msgByUserId
//       })
//       const saveMessage=await message.save()
//     // console.log('new message', data);
//     // console.log("Convrsation",conversation)
//     // console.log("Sender Id:-",data.sender)
//     // console.log("receiver Id :-",data.receiver)
//     // const updateConversation=await ConversationModel.updateOne({
      
//     //   _id:conversation?._id,
//     //   "$push":{messages:saveMessage?._id}
//     // })

//     const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
//       "$push" : { messages : saveMessage?._id }
//   })
//     const getConversationMessage=await ConversationModel.findOne({
//       "$or":[
//         {sender:data?.sender,receiver:data?.receiver},
//         {sender:data?.receiver,receiver:data?.sender}
//       ]
//     }).populate('messages').sort({updateAt:-1})
//     io.to(data?.sender).emit('message', getConversationMessage.messages)
//     io.to(data?.receiver).emit('message', getConversationMessage.messages)
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     console.log("Disconnected user", socket.id);
//     // Remove the user's ID from the set of online users
//     onlineUser.delete(user._id.toString());
//     // Emit the updated list of online users to all connected clients
//     io.emit("Online User", Array.from(onlineUser));
//   });
// });

// module.exports = { app, server };


const express = require("express");
const { Server } = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');
const getUserDetailsfromToken = require('../helpers/getUserDeatilsFromToken');
const UserModel = require("../db/models/UserModel");
const { ConversationModel, MessageModel } = require("../db/models/ConversationModel");

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
          online: onlineUsers.has(userId)
        };
        socket.emit('message-user', payload);
        console.log(payload);

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
        msgByUserId: data?.msgByUserId
      });
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

      io.to(data?.sender).emit('message', getConversationMessage.messages);
      io.to(data?.receiver).emit('message', getConversationMessage.messages);
    });
    //sidebar
    socket.on('sidebar',async(currentUserId)=>{
      console.log("Current User",currentUserId)
      if(currentUserId)
        {
          const currentUserConversation=await ConversationModel.find({
            "$or":[
              {sender:currentUserId},
              {receiver:currentUserId}
            ]
          }).sort({updatedAt:-1}).populate('messages').populate('sender').populate('receiver')
          console.log( currentUserConversation)
          const conversation=currentUserConversation.map((conv)=>{
            const countUnseenMsg=conv.messages.reduce((preve,curr)=>preve+(curr.seen?0:1),0)
          
            return {
            _id:conv._id,
            sender:conv?.sender,
            receiver:conv?.receiver,
            unseenMsg:countUnseenMsg,
            lastMsg:conv.messages[conv?.messages?.length-1]
            }
          })
          socket.emit('conversation',conversation)
        }
    
    })
    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Disconnected user", socket.id);
      onlineUsers.delete(user._id.toString());
      io.emit("Online User", Array.from(onlineUsers));
    });

  } catch (error) {
    console.error("Error during connection handling:", error);
    socket.disconnect(true);
  }
});

module.exports = { app, server };
