const express = require('express');
const { listInventory, createInventoryItem, updateInventoryItem, transferStock, deleteInventoryItem } = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', listInventory);
router.post('/', createInventoryItem);
router.patch('/:id', updateInventoryItem);
router.post('/transfer', transferStock);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
