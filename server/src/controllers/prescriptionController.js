const Prescription = require('../models/Prescription');

function buildFilter(query){
  const f = {};
  if (query.q) f.$or = [{ patientName: { $regex: String(query.q), $options: 'i' } }];
  if (query.status) f.status = query.status;
  if (query.patientId) f.patientId = query.patientId;
  return f;
}

async function list(req, res){
  try{
    const filter = buildFilter(req.query||{});
    if (req.user.role === 'injection') {
      filter.paymentStatus = 'paid';
    }
    const items = await Prescription.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  }catch(err){
    console.error('rx.list error', err); return res.status(500).json({ message: 'Server error' });
  }
}

async function create(req, res){
  try{
    const body = req.body||{};
    if(!body.patientId || !body.patientName || !Array.isArray(body.medications) || body.medications.length===0){
      return res.status(400).json({ message: 'patientId, patientName and medications are required' });
    }
    const doc = await Prescription.create(body);
    return res.status(201).json(doc);
  }catch(err){
    console.error('rx.create error', err); return res.status(500).json({ message: 'Server error' });
  }
}

async function getOne(req, res){
  try{
    const doc = await Prescription.findById(req.params.id);
    if(!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }catch(err){ console.error('rx.get error', err); return res.status(500).json({ message: 'Server error' }); }
}

async function updateStatus(req, res){
  try{
    const { status } = req.body||{};
    if(!status) return res.status(400).json({ message: 'status is required' });
    const doc = await Prescription.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if(!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }catch(err){ console.error('rx.status error', err); return res.status(500).json({ message: 'Server error' }); }
}

module.exports = { list, create, getOne, updateStatus };
