const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    bloodType: { type: String },
    allergies: [{ type: String }],
    registrationDate: { type: Date, default: Date.now },
    lastVisit: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
