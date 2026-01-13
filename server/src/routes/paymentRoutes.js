const express = require('express');
const { protect, requireRoles } = require('../middleware/userAuth');
const { getPendingPayments, confirmPayment } = require('../controllers/paymentController');

const router = express.Router();

// All payment routes require receptionist role (or maybe admin)
// For now, strictly receptionist as requested
router.use(protect, requireRoles('receptionist'));

router.get('/pending', getPendingPayments);
router.post('/confirm', confirmPayment);

module.exports = router;
