const mongoose = require('mongoose');
const env = require('./env');

module.exports = async () => {
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
};
