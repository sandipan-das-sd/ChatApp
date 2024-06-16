const { Timestamp } = require("mongodb")
const moongose=require("mongoose")
const userSchema= new moongose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true // To allow users without Google ID
    },
    name:{
        type:String,
        required:[true,"provide name"]
    },
    email:{
        type:String,
        required:[true,"provide email"],
        unique:true
    },
    password:{
        type:String,
        
        required:[true,"provide password"]
    },
    profile_pic:{
        type:String,
        default:""
    },
    lastSeen: {
        type: Date,
        default: null
      }
},{
    timestamps:true
})
const UserModel=moongose.model("User",userSchema)
module.exports=UserModel