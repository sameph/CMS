const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    temperature: String,
    pulse: String,
    bloodPressure: String,
    respiratoryRate: String,
    spo2: String,
    weight: String,
  },
  { _id: false }
);

const consultationSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    createdBy: { type: String }, // user id or name
    vitals: vitalsSchema,
    examination: { type: String },
    diagnosis: { type: String },
    plan: { type: String },
    medicationsText: { type: String },
    labsText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
