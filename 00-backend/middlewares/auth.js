const jwt = require('jsonwebtoken');
exports.checkToken = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      return res.status(401).json({ message: 'Not Authorized, token missing' });
    }
    const token = bearerToken.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

exports.isRoleAllowed = rolesArray => {
  return (req, res, next) => {
    if (req.user && rolesArray.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'You are not allowed' });
  };
};
