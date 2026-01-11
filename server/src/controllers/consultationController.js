const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');

function buildFilter(query) {
  const filter = {};
  if (query.patientId) filter.patientId = query.patientId;
  if (query.q) filter.$or = [
    { patientName: { $regex: String(query.q), $options: 'i' } },
    { diagnosis: { $regex: String(query.q), $options: 'i' } },
  ];
  return filter;
}

async function listConsultations(req, res) {
  try {
    const filter = buildFilter(req.query || {});
    const items = await Consultation.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (err) {
    console.error('listConsultations error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function createConsultation(req, res) {
  try {
    const body = req.body || {};
    const required = ['patientId', 'patientName'];
    for (const k of required) if (!body[k]) return res.status(400).json({ message: `${k} is required` });

    // Ensure patient exists if ID looks like Mongo ObjectId
    try {
      if (String(body.patientId).match(/^[0-9a-fA-F]{24}$/)) {
        const pat = await Patient.findById(body.patientId);
        if (!pat) return res.status(400).json({ message: 'Patient not found' });
      }
    } catch (_) {}

    const doc = await Consultation.create(body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createConsultation error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listConsultations, createConsultation };
