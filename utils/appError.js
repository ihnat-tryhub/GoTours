class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    if (statusCode) {
      console.log(`status code is here - ${statusCode}`);
    }
    this.statusCode = statusCode || 500;
    console.log(this.statusCode);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
// Глобальная ошибка ?
