const mongoose = require("mongoose");

module.exports = async function connectDB() {
  mongoose.set("strictQuery", true);
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/scientific_trend_tracker";
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};
