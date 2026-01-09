const express = require('express');
const { protect, requireRoles } = require('../middleware/userAuth');
const {
  getCatalog,
  createRequest,
  listRequests,
  getRequest,
  updateRequest,
} = require('../controllers/labRequestController');

const router = express.Router();

// All lab request routes require authentication
router.use(protect);

// Catalog for UI
router.get('/catalog', getCatalog);

// OPD creates requests
router.post('/', requireRoles('opd'), createRequest);

// OPD sees own, Lab sees all
router.get('/', requireRoles('opd', 'laboratory'), listRequests);
router.get('/:id', requireRoles('opd', 'laboratory'), getRequest);

// Laboratory updates results/status
router.patch('/:id', requireRoles('laboratory'), updateRequest);

module.exports = router;
