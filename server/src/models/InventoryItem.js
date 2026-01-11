const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
    price: { type: Number, default: 0 },
    expiryDate: { type: Date },
    reorderLevel: { type: Number, default: 0 },
    location: { type: String, enum: ['central', 'opd'], default: 'central', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
