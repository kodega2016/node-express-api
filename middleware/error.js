const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  error.name = err.name;

  if (error.name === "CastError") {
    const message = `Resource with ${err.value} id not found.`;
    error = new ErrorResponse(message, 500);
  }

  if (error.code === 11000) {
    const message = `Duplicate value entered.`;
    error = new ErrorResponse(message, 500);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 500);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    msg: error.message || "Server Error",
    data: null,
  });
};

module.exports = errorHandler;
