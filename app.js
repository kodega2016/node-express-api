const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const errorHandler = require("./middleware/error");

//Load env variables
dotenv.config({
  path: "./config/config.env",
});

const app = express();

//Express body parser
app.use(express.json());

connectDb();
app.get("/", (req, res) => {
  res.send("It is working...");
});

app.get("/test", async (req, res) => {
  try {
    const loc = await geocoder.geocode("45 Upper College Rd Kingston RI 02881");
    res.send(loc);
  } catch (e) {
    res.send(e);
  }
});

const bootcamps = require("./routes/bootcamps");
const geocoder = require("./utils/geocoder");
app.use("/api/v1/bootcamps", bootcamps);

app.use(errorHandler);

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || "development";

const server = app.listen(port, () => {
  console.log(`Server is running in ${env} mode in ${port} port.`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
