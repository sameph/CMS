const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorName: { type: String },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['scheduled', 'waiting', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
    type: { type: String, enum: ['consultation', 'follow-up', 'emergency'], required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
