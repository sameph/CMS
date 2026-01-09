const mongoose = require('mongoose');

module.exports = async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true,
  });
  console.log('MongoDB connected');
}
