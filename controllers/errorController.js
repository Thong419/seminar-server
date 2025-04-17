import AppError from "../utils/AppError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(404, message);
};

const handleDuplicateErrorDB = (err) => {
  const dupField = Object.getOwnPropertyNames(err.keyPattern).join(" ");
  const message = `Duplicate field: ${dupField}`;
  return new AppError(404, message);
};
const handleValidateErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((field) => field.message)
    .join("; ");
  // const message = dupField.map((field) => err[field].message);
  const message = `Invalid input data: ${errors}`;

  return new AppError(404, message);
};

const handleJWTError = () =>
  new AppError(401, "Invalid token! Please log in again");

const handleExpiredJWTError = () =>
  new AppError(401, "Token Expired! Please log in again");

const sendErrorDev = function (err, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    return res.status(500).json({
      status: "Error",
      message: "Some thing wrong happen",
    });
  }
};
const sendErrorProd = function (err, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    //API
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error("Error happened: ", err);

    return res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

const GlobalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === "ValidationError") error = handleValidateErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleExpiredJWTError();
    sendErrorProd(error, req, res);
  }
};

export default GlobalErrorHandler;
