// Catch undefined routes and return a 404 error
const notFoundHandler = (req, res, next) => {
    res.status(404).json({ message: "Route not found" });
  };
  
  // Generic error handler for unexpected errors (500)
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
  
  module.exports = { notFoundHandler, errorHandler };
  









