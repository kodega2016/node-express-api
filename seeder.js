const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDb = require("./config/db");

dotenv.config({
  path: "./config/config.env",
});

const Bootcamp = require("./models/Bootcamp");

connectDb();

const importData = async (req, res) => {
  console.log("Importing data...");
  const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`)
  );
  await Bootcamp.create(bootcamps);
  process.exit();
};
const clearData = async (req, res) => {
  console.log("Clearing data...");
  await Bootcamp.deleteMany();
  process.exit();
};

if (process.argv[2] === "i") {
  importData();
} else if (process.argv[2] === "d") {
  clearData();
}
