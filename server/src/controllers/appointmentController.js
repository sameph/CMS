const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// GET /api/appointments
// Query: date (ISO), status, doctorId
async function listAppointments(req, res) {
  try {
    const { date, status, doctorId } = req.query || {};
    const filter = {};
    if (date === 'today' || !date) {
      filter.date = { $gte: startOfDay(), $lte: endOfDay() };
    } else if (date) {
      const d = new Date(date);
      filter.date = { $gte: startOfDay(d), $lte: endOfDay(d) };
    }
    if (status) filter.status = status;
    if (doctorId && mongoose.isValidObjectId(doctorId)) filter.doctorId = doctorId;

    const items = await Appointment.find(filter).sort({ time: 1 }).lean();
    return res.json({ items });
  } catch (err) {
    console.error('listAppointments error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/appointments
async function createAppointment(req, res) {
  try {
    const body = req.body || {};
    const required = ['patientId', 'patientName', 'date', 'time', 'type'];
    for (const k of required) {
      if (!body[k]) return res.status(400).json({ message: `${k} is required` });
    }
    const doc = await Appointment.create({
      patientId: body.patientId,
      patientName: body.patientName,
      doctorId: body.doctorId,
      doctorName: body.doctorName,
      date: new Date(body.date),
      time: body.time,
      status: body.status || 'scheduled',
      type: body.type,
      notes: body.notes,
    });
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createAppointment error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /api/appointments/:id/check-in
async function checkIn(req, res) {
  try {
    const { id } = req.params;
    const doc = await Appointment.findByIdAndUpdate(id, { status: 'waiting' }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('checkIn error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /api/appointments/:id/status
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    const doc = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('updateStatus error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/appointments/waiting?doctorId=...
async function listWaiting(req, res) {
  try {
    const { doctorId } = req.query || {};
    const filter = {
      status: 'waiting',
      date: { $gte: startOfDay(), $lte: endOfDay() },
    };
    if (doctorId && mongoose.isValidObjectId(doctorId)) filter.doctorId = doctorId;
    const items = await Appointment.find(filter).sort({ createdAt: 1 }).lean();
    return res.json({ items });
  } catch (err) {
    console.error('listWaiting error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/appointments/next?doctorId=...
// Sets the earliest waiting appointment for the doctor to in-progress and returns it
async function callNext(req, res) {
  try {
    const { doctorId } = req.query || {};
    const filter = {
      status: 'waiting',
      date: { $gte: startOfDay(), $lte: endOfDay() },
    };
    if (doctorId && mongoose.isValidObjectId(doctorId)) filter.doctorId = doctorId;

    const next = await Appointment.findOneAndUpdate(filter, { status: 'in-progress' }, { sort: { createdAt: 1 }, new: true });
    if (!next) return res.status(404).json({ message: 'No waiting patients' });
    return res.json(next);
  } catch (err) {
    console.error('callNext error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  listAppointments,
  createAppointment,
  checkIn,
  updateStatus,
  listWaiting,
  callNext,
};
