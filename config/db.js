const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    let conn = await mongoose.connect(
      process.env.NODE_ENV === "development"
        ? process.env.MONGO_URI_DEV
        : process.env.MONGO_URI_PROD,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`Database connection is made ${conn.connection.name}`);
  } catch (e) {
    console.log("Failed to connect to DB");
    throw e;
  }
};

module.exports = connectDb;
