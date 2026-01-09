const express = require('express');
const { protect, requireRoles } = require('../middleware/userAuth');
const {
  listPatients,
  createPatient,
  getPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');

const router = express.Router();

router.use(protect);

// Receptionist full CRUD; OPD/Lab read-only as needed
router.get('/', requireRoles('receptionist', 'opd', 'laboratory'), listPatients);
router.get('/:id', requireRoles('receptionist', 'opd', 'laboratory'), getPatient);
router.post('/', requireRoles('receptionist'), createPatient);
router.patch('/:id', requireRoles('receptionist'), updatePatient);
router.delete('/:id', requireRoles('receptionist'), deletePatient);

module.exports = router;
