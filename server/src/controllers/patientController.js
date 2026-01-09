const Patient = require('../models/Patient');

// Build a filter from query params
function buildFilter(query) {
  const filter = {};
  const { q, gender } = query || {};
  if (q && String(q).trim()) {
    const term = String(q).trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { phone: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { address: { $regex: term, $options: 'i' } },
    ];
  }
  if (gender) filter.gender = gender;
  return filter;
}

async function listPatients(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);
    const [items, total] = await Promise.all([
      Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Patient.countDocuments(filter),
    ]);

    return res.json({ items, page, limit, total });
  } catch (err) {
    console.error('listPatients error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function createPatient(req, res) {
  try {
    const body = req.body || {};
    const required = ['name', 'dateOfBirth', 'gender', 'phone', 'address'];
    for (const k of required) {
      if (!body[k]) return res.status(400).json({ message: `${k} is required` });
    }

    const doc = await Patient.create(body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createPatient error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getPatient(req, res) {
  try {
    const doc = await Patient.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getPatient error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updatePatient(req, res) {
  try {
    const updates = req.body || {};
    const doc = await Patient.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('updatePatient error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deletePatient(req, res) {
  try {
    const doc = await Patient.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deletePatient error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  listPatients,
  createPatient,
  getPatient,
  updatePatient,
  deletePatient,
};
