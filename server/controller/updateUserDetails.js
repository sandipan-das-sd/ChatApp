const getUserDetailsFromToken = require("../helpers/getUserDeatilsFromToken");
const UserModel = require("../db/models/UserModel");

async function updateUserDetails(request, response) {
    try {
        const token = request.headers.authorization.split(' ')[1] || "";
        const user = await getUserDetailsFromToken(token);

        if (!user || user.logout) {
            return response.status(401).json({
                message: user ? user.message : "Invalid token",
                logout: true,
                success: false,
            });
        }

        const { name, profile_pic, email, password } = request.body;

        if (!name && !profile_pic && !email && !password) {
            return response.status(400).json({
                message: "At least one of the fields (name, profile_pic, email, password) is required for update",
                success: false,
            });
        }

        const updateUserFields = {};
        const updatedFields = [];

        if (name) {
            updateUserFields.name = name;
            updatedFields.push('name');
        }
        if (profile_pic) {
            updateUserFields.profile_pic = profile_pic;
            updatedFields.push('profile picture');
        }
        if (email) {
            updateUserFields.email = email;
            updatedFields.push('email');
        }
        if (password) {
            updateUserFields.password = password;
            updatedFields.push('password');
        }

        await UserModel.updateOne(
            { _id: user._id },
            { $set: updateUserFields } // Use $set operator to update only specified fields
        );

        const userInformation = await UserModel.findById(user._id).select('-password');
        const message = `User ${updatedFields.join(', ')} updated successfully`;

        return response.json({
            message: message,
            data: userInformation,
            success: true
        });
    } catch (error) {
        console.log("Error in update user controller", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
        });
    }
}

module.exports = updateUserDetails;
