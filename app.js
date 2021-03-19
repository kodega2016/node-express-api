const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const errorHandler = require("./middleware/error");
const fileupload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

//Load env variables
dotenv.config({
  path: "./config/config.env",
});

const app = express();

//Express body parser
app.use(express.json());

app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

connectDb();
app.get("/", (req, res) => {
  res.send("It is working...");
});

//Sanitize data
app.use(mongoSanitize());
//Set security header
app.use(helmet());
//Xss-clean
app.use(xss());
//set rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
//Set hpp
app.use(hpp());
//Set cors
app.use(cors());

const auth = require("./routes/auth");
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const users = require("./routes/users");

app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
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
