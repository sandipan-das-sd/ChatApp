const UserModel=require("../db/models/UserModel")
const bcryptjs=require("bcryptjs")
const jwt=require("jsonwebtoken")
async function checkPassword(req,res){
    try {
        const {password,userId}=req.body //client side means req.body
        const user= await UserModel.findById(userId)
        const verfyPassword=await bcryptjs.compare(password,user.password)
        if(!verfyPassword)
            {
                return res.status(400).json({
                    message:"Please check password",
                    error:true
                })
            }
            const tokenData={
                id:user._id,
                email:user.email
            }
            const token=await jwt.sign(tokenData,process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
            const cokkieOption={
                http:true,
                secure:true
            }
        return res.cookie('token',token,cokkieOption).status(200).json({
            message:"Login succesfully",
            token:token,
            data:user,
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message||error,
            error:true
        })
    }
}
module.exports=checkPassword