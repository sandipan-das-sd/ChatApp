const moongose=require("mongoose")

const messageSchema=new moongose.Schema({
    text:{
        type:String,
        default:""
    },
    imageUrl:{
        type:String,
        default:""
    },
    videoUrl:{
        type:String,
        default:""
    },
    audioUrl:{
         type:String,
        default:""
    },
    seen:{
        type:Boolean,
        default:false
    }
},{
  timestamps :true 
})
const conversationSchema=new moongose.Schema({

    sender:{
        type:moongose.Schema.ObjectId, //User ID of sender
        required:true,
        //for user information i can use 'ref' keyword from user table i want to know the information of user
        ref:"User"
    },

    receiver:{
        type:moongose.Schema.ObjectId, //User ID of receiver
        required:true,
        ref:"User"
    },
    messages:[
        {
            type:moongose.Schema.ObjectId,
            ref:"Message"
        }
    ]
},{
    timestamps:true
})
const MessageModel= moongose.model("Message",messageSchema)
const ConversationModel=moongose.model("Conversation",conversationSchema)
module.exports={
    MessageModel,
    ConversationModel
}