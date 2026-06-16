const { fail } = require("../utils/apiResponse");

exports.notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

exports.errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 && process.env.NODE_ENV === "production" ? "Server error" : err.message;
  if (process.env.NODE_ENV !== "production") console.error(err);
  return fail(res, message, status);
};
