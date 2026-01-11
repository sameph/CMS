const express = require('express');
const { listConsultations, createConsultation } = require('../controllers/consultationController');

const router = express.Router();

router.get('/', listConsultations);
router.post('/', createConsultation);

module.exports = router;
