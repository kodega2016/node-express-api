const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    let conn = await mongoose.connect(process.env.MONGO_URI_PROD, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(`Database connection is made ${conn.connection.name}`);
  } catch (e) {
    console.log("Failed to connect to DB");
    console.log(e);
    throw e;
  }
};

module.exports = connectDb;
