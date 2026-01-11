const express = require('express');
const { list, create, getOne, updateStatus } = require('../controllers/prescriptionController');

const router = express.Router();

router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id/status', updateStatus);

module.exports = router;
