const mongoose = require('mongoose');

const ROLES = ['receptionist', 'opd', 'laboratory', 'injection'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    active: { type: Boolean, default: true },
    avatar: { type: String },
    // Store a hash of the refresh token for security
    refreshTokenHash: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
