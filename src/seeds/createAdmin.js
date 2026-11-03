
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(env.mongoUri);
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const name = process.env.ADMIN_NAME || 'Super Admin';

    if (await User.findOne({ email })) {
      console.log(`Admin already exists: ${email}`);
    } else {
      await User.create({ name, email, password, role: 'admin' });
      console.log(`Admin created: ${email}`);
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
