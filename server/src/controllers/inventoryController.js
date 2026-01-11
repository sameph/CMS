const InventoryItem = require('../models/InventoryItem');

function buildFilter(query) {
  const filter = {};
  if (query.location) filter.location = query.location;
  if (query.q) filter.$or = [
    { name: { $regex: String(query.q), $options: 'i' } },
    { category: { $regex: String(query.q), $options: 'i' } },
  ];
  return filter;
}

async function listInventory(req, res) {
  try {
    const filter = buildFilter(req.query || {});
    const items = await InventoryItem.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (err) {
    console.error('listInventory error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function createInventoryItem(req, res) {
  try {
    const body = req.body || {};
    const required = ['name', 'location'];
    for (const k of required) if (!body[k]) return res.status(400).json({ message: `${k} is required` });
    const doc = await InventoryItem.create(body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createInventoryItem error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateInventoryItem(req, res) {
  try {
    const updates = req.body || {};
    const doc = await InventoryItem.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('updateInventoryItem error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Transfer quantity between locations. If destination item doesn't exist, create it.
// body: { itemId: string, quantity: number, to: 'central'|'opd' }
async function transferStock(req, res) {
  try {
    const { itemId, quantity, to } = req.body || {};
    const qty = Number(quantity || 0);
    if (!itemId || !qty || qty <= 0 || !to) return res.status(400).json({ message: 'itemId, quantity and to are required' });

    const source = await InventoryItem.findById(itemId);
    if (!source) return res.status(404).json({ message: 'Source not found' });

    const from = source.location;
    if (from === to) return res.status(400).json({ message: 'Source and destination are the same' });
    if (source.quantity < qty) return res.status(400).json({ message: 'Insufficient stock' });

    // Deduct from source
    source.quantity -= qty;
    await source.save();

    // Find/create destination by name+unit+category
    let dest = await InventoryItem.findOne({ name: source.name, unit: source.unit, category: source.category, location: to });
    if (!dest) {
      dest = await InventoryItem.create({
        name: source.name,
        category: source.category,
        unit: source.unit,
        price: source.price,
        expiryDate: source.expiryDate,
        reorderLevel: source.reorderLevel,
        location: to,
        quantity: 0,
      });
    }
    dest.quantity += qty;
    await dest.save();

    return res.json({ message: 'Transferred', from, to, quantity: qty, source, destination: dest });
  } catch (err) {
    console.error('transferStock error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listInventory, createInventoryItem, updateInventoryItem, transferStock };
