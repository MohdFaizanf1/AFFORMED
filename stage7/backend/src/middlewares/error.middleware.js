const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on the server",
  });
};

module.exports = errorHandler;
