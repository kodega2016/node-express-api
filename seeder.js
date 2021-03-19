const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDb = require("./config/db");

dotenv.config({
  path: "./config/config.env",
});

connectDb();

const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const Review = require("./models/Review");
const User = require("./models/User");

const importData = async (req, res) => {
  console.log("Importing data...");

  const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`));

  await User.create(users);

  const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`)
  );
  await Bootcamp.create(bootcamps);

  const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`)
  );

  await Course.create(courses);

  const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`)
  );

  await Review.create(reviews);

  process.exit();
};
const clearData = async (req, res) => {
  console.log("Clearing data...");
  await User.deleteMany();
  await Bootcamp.deleteMany();
  await Course.deleteMany();
  await Review.deleteMany();
  process.exit();
};

if (process.argv[2] === "i") {
  importData();
} else if (process.argv[2] === "d") {
  clearData();
}
