export function errorHandler(err, req, res, next) {
  console.error("❌ Global Error Handler caught:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error. Please try again later.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}
