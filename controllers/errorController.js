const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  if (err.message && typeof err.message === 'string') {
    const match = err.message.match(/(["'])(\\?.)*?\1/);
    if (match) {
      const value = match[0];
      console.log(value);
      return value;
    }
  }
  const message = `Duplicate field value: x. Please use another value`;
  return new AppError(message, 404);
};

const handleValidationErrorDB = () => {
  const message = 'Validation error.';
  return new AppError(message, 422);
};

//
const hadndleJWTError = () => {
  const message = 'Invalid token. Please log in again!';
  return new AppError(message, 401);
};
const handleJWTExpiredError = () => {
  const message = ' Your token has expired. Please log in again.';
  return new AppError(message, 401);
};
//

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered website
  // if its an operational error, send msg to client
  if (err.isOperational) {
    console.log('error - ', err);
    return res.status(err.statusCode).render('error', {
      title: 'Smthng went wrong!',
      msg: err.message,
    });
  }

  // unknown error: dont talk to much
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong, uknown error',
    msg: err.message,
    // msg:'Please try again later'
  });
};

const sendErrorProd = (err, req, res) => {
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

  let error = { ...err, message: err.message, stack: err.stack };

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB();

  if (error.name === 'JsonWebTokenError') error = hadndleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorDev(error, req, res);
  // if (process.env.NODE_ENV === 'development') {
  //   sendErrorDev(err, res);
  //   let error = { ...err };

  //   if (error.name === 'CastError') error = handleCastErrorDB(error);
  //   if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  //   if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  //   if (error.name === 'JsonWebTokenError') error = hadndleJWTError(error);
  // } else if (process.env.NODE_ENV === 'production') {
  //   sendErrorProd(err, res);
  // }
};

// Глобальная ошибка для существующего маршрута
