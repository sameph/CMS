const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    quantity: Number,
    instructions: String,
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorId: { type: String },
    doctorName: { type: String },
    date: { type: Date, default: Date.now },
    medications: [medicationSchema],
    status: { type: String, enum: ['pending', 'dispensed', 'partially-dispensed'], default: 'pending', index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
