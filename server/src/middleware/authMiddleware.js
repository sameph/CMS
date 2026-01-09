const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.js');

async function protect(req, res, next) { 
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const secret = process.env.JWT_SECRET || 'devsecret';
    const decoded = jwt.verify(token, secret);
    const admin = await Admin.findById(decoded.id).lean();
    if (!admin || !admin.active) return res.status(401).json({ message: 'Not authorized' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
} 

function requireSuperAdmin(req, res, next) {
  if (req.admin?.role === 'superadmin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

module.exports = { protect, requireSuperAdmin };
