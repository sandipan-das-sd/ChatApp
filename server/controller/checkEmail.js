// const UserModel = require("../db/models/UserModel")

// async function checkEmail(request,response){
//     try {
//         const { email } = request.body

//         const checkEmail = await UserModel.findOne({email}).select("-password")

//         if(!checkEmail){
//             return response.status(400).json({
//                 message : "User not exit",
//                 error : true
//             })
//         }

//         return response.status(200).json({
//             message : "Email verified",
//             success : true,
//             data : checkEmail
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true
//         })
//     }
// }

// module.exports = checkEmail


const UserModel = require("../db/models/UserModel");

async function checkEmail(request, response) {
    try {
        const { email } = request.body;

        // Check if the user exists in the database
        const user = await UserModel.findOne({ email }).select("-password");

        if (!user) {
            return response.status(400).json({
                message: "User does not exist",
                error: true
            });
        }

        // If the user is found, check if they have signed in with Google
        if (user.googleId) {
            // User has signed in with Google, handle accordingly
            return response.status(200).json({
                message: "User signed in with Google",
                success: true,
                data: user
            });
        }

        // If the user has not signed in with Google, continue with regular email/password flow
        return response.status(200).json({
            message: "Email verified",
            success: true,
            data: user
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = checkEmail;
