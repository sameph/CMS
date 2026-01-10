const express = require('express');
const { protect, requireRoles } = require('../middleware/userAuth');
const {
  listAppointments,
  createAppointment,
  checkIn,
  updateStatus,
  listWaiting,
  callNext,
} = require('../controllers/appointmentController');

const router = express.Router();

router.use(protect);

// Receptionist can create and view; OPD can view and manage waiting/in-progress
router.get('/', requireRoles('receptionist', 'opd'), listAppointments);
router.post('/', requireRoles('receptionist'), createAppointment);
router.get('/waiting', requireRoles('opd'), listWaiting);
router.post('/next', requireRoles('opd'), callNext);
router.patch('/:id/check-in', requireRoles('receptionist'), checkIn);
router.patch('/:id/status', requireRoles('receptionist', 'opd'), updateStatus);

module.exports = router;
