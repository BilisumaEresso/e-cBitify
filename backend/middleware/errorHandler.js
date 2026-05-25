
const errorHandler = (error, req, res, next) => {
  // res.statusCode is set by express (e.g. res.status(404)); fall back to 400
  const code = res.statusCode && res.statusCode !== 200 ? res.statusCode : 400;
  res.status(code).json({
    code,
    status: false,
    message: error.message,
    // never expose stack traces outside development
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorHandler;
