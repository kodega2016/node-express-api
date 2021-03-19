const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const errorHandler = require("./middleware/error");
const fileupload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const sendMail = require("./utils/sendmail");

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

app.get("/test", async (req, res) => {
  try {
    const loc = await sendEmail({
      to: "khadga@gmail.com",
      subject: "Forgot password",
      message: "Reset password",
    });
    res.send(loc);
  } catch (e) {
    res.send(e);
  }
});

const auth = require("./routes/auth");
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

const geocoder = require("./utils/geocoder");
const sendEmail = require("./utils/sendmail");
app.use("/api/v1/auth", auth);
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
