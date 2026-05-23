// Admin Role Check Middleware (must be used after authMiddleware)
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
};

module.exports = adminMiddleware;
