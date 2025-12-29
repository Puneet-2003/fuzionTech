const errorHandler = (error, req, res, next) => {
  console.error(error);


  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors
    });
  }


  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({ 
      error: `${field} already exists` 
    });
  }

 
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error'
  });
};

module.exports = errorHandler;
