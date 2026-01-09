const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    patientName: { type: String, required: true },
    testType: { type: String, required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    result: { type: String },
    resultDate: { type: Date },
    fee: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
