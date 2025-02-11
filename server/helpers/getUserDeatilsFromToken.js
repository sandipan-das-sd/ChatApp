// const jwt = require('jsonwebtoken');
// const UserModel = require('../db/models/UserModel');

// const getUserDetailsfromToken = async (token) => {
//     if (!token) {
//         return {
//             message: "session out",
//             logout: true,
//         };
//     }

//     try {
//         const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
//         const user = await UserModel.findById(decode.id).select('-password');
//         if (!user) {
//             return {
//                 message: "User not found",
//                 logout: true,
//             };
//         }
//         return user;
//     } catch (error) {
//         return {
//             message: "Invalid token",
//             logout: true,
//         };
//     }
// };

// module.exports = getUserDetailsfromToken;
const jwt = require('jsonwebtoken');
const UserModel = require('../db/models/UserModel');

const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return {
            message: "No authentication token provided",
            logout: true,
        };
    }

    try {
        // Verify token
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
            return {
                message: "Token has expired",
                logout: true,
            };
        }

        // Find user and exclude password
        const user = await UserModel.findById(decoded.id)
            .select('-password')
            .lean();

        if (!user) {
            return {
                message: "User not found",
                logout: true,
            };
        }

        // Update last seen
        await UserModel.findByIdAndUpdate(decoded.id, {
            lastSeen: new Date()
        });

        return {
            ...user,
            iat: decoded.iat,
            exp: decoded.exp
        };

    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return {
                message: "Invalid token format",
                logout: true,
            };
        }
        
        if (error.name === 'TokenExpiredError') {
            return {
                message: "Token has expired",
                logout: true,
            };
        }

        return {
            message: "Token verification failed",
            logout: true,
        };
    }
};

module.exports = getUserDetailsFromToken;