/**
 * Centralized Application Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[FitHub Server Error]:', {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File upload failed: File exceeds the maximum 5MB size limit.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Handle file validation errors
  if (err.message && (err.message.includes('Invalid file') || err.message.includes('Only JPG, PNG'))) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Handle SQLite constraint errors (e.g. unique constraint)
  if (err.code && err.code.startsWith('SQLITE_CONSTRAINT')) {
    if (err.message.includes('members.phone') || err.message.includes('UNIQUE constraint failed: members.phone')) {
      return res.status(409).json({
        success: false,
        message: 'A gym member with this phone number is already registered.'
      });
    }
    if (err.message.includes('users.username')) {
      return res.status(409).json({
        success: false,
        message: 'Username or login identifier is already in use.'
      });
    }
    return res.status(409).json({
      success: false,
      message: 'Database constraint violation. Duplicate entry detected.'
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'An internal server error occurred. Please try again.'
  });
}
