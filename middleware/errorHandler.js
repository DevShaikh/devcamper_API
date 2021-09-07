const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  console.log(error);

  error.message = err.message;
  error.name = err.name;

  // Log to console for dev
  // console.log(error);

  // Mongoose ObjectID Error
  if (error.name == "CastError") {
    const message = `Resource not found!`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate Error
  if (error.code == 11000) {
    const duplicateResource = `Duplicate field value entered`;
    error = new ErrorResponse(duplicateResource, 404);
  }

  // Mongoose Empty Fields Error
  if (error.name == "ValidationError") {
    const message = Object.values(error.errors).map((curr) => curr.message);
    error = new ErrorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

module.exports = errorHandler;
