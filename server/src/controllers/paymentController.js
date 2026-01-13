const LabRequest = require('../models/LabRequest');
const Prescription = require('../models/Prescription');

// Get all pending payments (both lab requests and prescriptions)
async function getPendingPayments(req, res) {
  try {
    const [labRequests, prescriptions] = await Promise.all([
      LabRequest.find({ paymentStatus: 'pending' })
        .populate('requestedBy', 'name')
        .sort({ createdAt: -1 })
        .lean(),
      Prescription.find({ paymentStatus: 'pending' })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const payments = [
      ...labRequests.map(item => ({
        id: item._id,
        type: 'laboratory',
        patientName: item.patientName,
        amount: item.price || 0,
        date: item.createdAt,
        details: 'Lab Request',
        refId: item._id, // Adding refId to easily track back if needed
      })),
      ...prescriptions.map(item => ({
        id: item._id,
        type: 'medication',
        patientName: item.patientName,
        amount: item.price || 0,
        date: item.createdAt,
        details: 'Prescription',
        refId: item._id,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json(payments);
  } catch (err) {
    console.error('getPendingPayments error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Confirm payment
async function confirmPayment(req, res) {
  try {
    const { id, type } = req.body;
    
    if (!id || !type) {
      return res.status(400).json({ message: 'Missing id or type' });
    }

    if (type === 'laboratory') {
      const doc = await LabRequest.findById(id);
      if (!doc) return res.status(404).json({ message: 'Lab request not found' });
      doc.paymentStatus = 'paid';
      await doc.save();
      return res.json({ message: 'Payment confirmed', doc });
    } else if (type === 'medication') {
      const doc = await Prescription.findById(id);
      if (!doc) return res.status(404).json({ message: 'Prescription not found' });
      doc.paymentStatus = 'paid';
      await doc.save();
      return res.json({ message: 'Payment confirmed', doc });
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
  } catch (err) {
    console.error('confirmPayment error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getPendingPayments,
  confirmPayment,
};
