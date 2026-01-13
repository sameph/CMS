const express = require('express');
const { list, create, getOne, updateStatus } = require('../controllers/prescriptionController');

const { protect } = require('../middleware/userAuth');
const router = express.Router();

router.use(protect);

router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id/status', updateStatus);

module.exports = router;
