const express = require('express');
const { protect, requireRoles } = require('../middleware/userAuth');
const {
  getCatalog,
  createRequest,
  listRequests,
  getRequest,
} = require('../controllers/labRequestController');

const router = express.Router();

// OPD-only lab request routes
router.use(protect, requireRoles('opd'));

// Catalog for building the OPD request form UI
router.get('/catalog', getCatalog);

// Create a new lab request (scoped to the logged-in OPD user)
router.post('/', createRequest);

// List OPD user's own requests
router.get('/', listRequests);

// Get a single OPD user's request (access control enforced in controller)
router.get('/:id', getRequest);

module.exports = router;
