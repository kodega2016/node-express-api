const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("It is working...");
});

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
