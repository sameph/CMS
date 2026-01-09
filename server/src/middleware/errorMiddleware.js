function notFound(req, res, next) { 
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars 
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  const response = {
    message: err.message || 'Server Error',
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.json(response);
}

module.exports = { notFound, errorHandler };
