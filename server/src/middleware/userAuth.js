const jwt = require('jsonwebtoken');
const User = require('../models/User');

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (roles.length === 0 || roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const secret = process.env.JWT_SECRET || 'devsecret';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).lean();
    if (!user || user.active === false) return res.status(401).json({ message: 'Not authorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { protect, requireRoles };
