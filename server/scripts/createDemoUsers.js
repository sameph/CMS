const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '..', '.env') });

const connectDB = require('../src/config/db');
const User = require('../src/models/User');

async function run() {
  try {
    await connectDB(process.env.MONGO_URI);

    const users = [
      { name: 'Sarah Johnson', email: 'receptionist@clinic.com', role: 'receptionist', password: 'password' },
      { name: 'Dr. Michael Chen', email: 'doctor@clinic.com', role: 'opd', password: 'password' },
      { name: 'Emma Williams', email: 'lab@clinic.com', role: 'laboratory', password: 'password' },
      { name: 'James Brown', email: 'injection@clinic.com', role: 'injection', password: 'password' },
    ];

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      const passwordHash = await bcrypt.hash(u.password, 10);
      if (existing) {
        existing.name = u.name;
        existing.role = u.role;
        existing.passwordHash = passwordHash;
        existing.active = true;
        await existing.save();
        console.log('Updated', u.email);
      } else {
        await User.create({
          name: u.name,
          email: u.email,
          role: u.role,
          passwordHash,
          active: true,
        });
        console.log('Created', u.email);
      }
    }

    console.log('Done');
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
