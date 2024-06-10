const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const dbURL = process.env.MONGO_DB_URL;
        if (!dbURL) {
            throw new Error("MONGO_DB_URL is not defined in the environment variables.");
        }

        await mongoose.connect(dbURL, {
            
           
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error.message);
    }
}

module.exports = connectDB;
