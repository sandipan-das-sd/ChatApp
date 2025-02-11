// const UserModel=require("../db/models/UserModel")
// const bcryptjs=require("bcryptjs")
// const jwt=require("jsonwebtoken")
// async function checkPassword(req,res){
//     try {
//         const {password,userId}=req.body //client side means req.body
//         const user= await UserModel.findById(userId)
//         const verfyPassword=await bcryptjs.compare(password,user.password)
//         if(!verfyPassword)
//             {
//                 return res.status(400).json({
//                     message:"Please check password",
//                     error:true
//                 })
//             }
//             const tokenData={
//                 id:user._id,
//                 email:user.email
//             }
//             const token=await jwt.sign(tokenData,process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
//             const cokkieOption={
//                 http:true,
//                 secure:true
//             }
//         return res.cookie('token',token,cokkieOption).status(200).json({
//             message:"Login succesfully",
//             token:token,
//             data:user,
//             success:true
//         })
//     } catch (error) {
//         return res.status(500).json({
//             message:error.message||error,
//             error:true
//         })
//     }
// }
// module.exports=checkPassword

const UserModel = require("../db/models/UserModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function checkPassword(req, res) {
    try {
        // Input validation
        const { password, userId } = req.body;
        if (!password || !userId) {
            return res.status(400).json({
                message: "Missing required fields",
                error: true
            });
        }

        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true
            });
        }

        // Verify password
        const verifyPassword = await bcryptjs.compare(password, user.password);
        if (!verifyPassword) {
            return res.status(401).json({
                message: "Invalid password",
                error: true
            });
        }

        // Generate token
        const tokenData = {
            id: user._id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        });

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        };

        // Update last login
        await UserModel.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            lastSeen: new Date()
        });

        // Send response
        return res
            .cookie('token', token, cookieOptions)
            .status(200)
            .json({
                message: "Login successful",
                token: token,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profile_pic: user.profile_pic,
                    lastSeen: user.lastSeen
                },
                success: true
            });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true
        });
    }
}

module.exports = checkPassword;