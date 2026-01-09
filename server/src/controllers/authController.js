const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

function signAccessToken(user) {
  const secret = process.env.JWT_SECRET || 'devsecret';
  // Shorter access token lifetime; use refresh for long sessions
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '15m' });
}

function signRefreshToken() {
  // Use random token string; will be hashed before saving
  return crypto.randomBytes(48).toString('hex');
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.active === false) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role !== role) return res.status(403).json({ message: 'Role mismatch' });

    const accessToken = signAccessToken(user);
    const refreshTokenPlain = signRefreshToken();
    const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return res.json({
      accessToken,
      token: accessToken,
      refreshToken: refreshTokenPlain,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/refresh
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    // Find by id inside token? We are storing only hash, so we must include user id from client or header.
    // To keep simple and secure, client should send userId with refresh; verify against stored hash.
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const user = await User.findById(userId);
    if (!user || !user.refreshTokenHash) return res.status(401).json({ message: 'Invalid refresh' });

    const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!match) return res.status(401).json({ message: 'Invalid refresh' });

    const accessToken = signAccessToken(user);
    return res.json({ accessToken, token: accessToken });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokenHash = undefined;
      await user.save();
    }
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  const u = req.user;
  return res.json({
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
  });
}

module.exports = { login, refresh, logout, me };
