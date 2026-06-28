const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  const value = err.keyValue ? Object.values(err.keyValue)[0] : 'value';
  return new AppError(`${field} "${value}" is already in use. Please use another value.`, 400);
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors || {})
    .map((error) => error.message)
    .filter(Boolean);

  return new AppError(messages.length ? messages.join('. ') : 'Validation error.', 422);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

const technicalErrorPatterns = [
  /openssl/i,
  /ssl routines/i,
  /tls_validate_record_header/i,
  /wrong version number/i,
  /mongodb/i,
  /mongoose/i,
  /node_modules/i,
  /typeerror/i,
  /referenceerror/i,
  /syntaxerror/i,
];

const isTechnicalError = (err) => {
  const message = err.message || '';
  return technicalErrorPatterns.some((pattern) => pattern.test(message));
};

const getPublicMessage = (err) => {
  if (err.isOperational && !isTechnicalError(err)) return err.message;
  return 'The server could not finish this request. Please try again in a moment.';
};

const sendApiError = (err, req, res) => {
  if (!err.isOperational) {
    console.error('API error:', err);
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: getPublicMessage(err),
  });
};

const sendRenderedError = (err, req, res) => {
  if (!err.isOperational) {
    console.error('Page error:', err);
  }

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: getPublicMessage(err),
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err, message: err.message, stack: err.stack };

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (req.originalUrl.startsWith('/api')) {
    return sendApiError(error, req, res);
  }

  return sendRenderedError(error, req, res);
};
