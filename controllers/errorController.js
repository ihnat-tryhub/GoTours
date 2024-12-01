const AppError = require('./../utils/appError');

// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = (err) => {
//   const value = err.errmsg.match();
//   const message = `Duplicate field value: x. Please use another value`;
//   return new AppError(message, 404);
// };
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.log('ERROR 💥 ', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; // Исправлено на statusCode
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //let error = { ...err };
    // if (err.name === 'CastError') error = handleCastErrorDB(error);

    // if (err.code === 11000) error = handleCastErrorDB(error);
    // if (err.code === 11000) error = handleCastErrorDB(error);

    sendErrorProd(err, res);
  }
};

// Глобальная ошибка для существующего маршрута
