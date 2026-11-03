const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, 
    name: { type: String, required: [true, 'Restaurant name is required'], trim: true, maxlength: 100, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    address: { type: String, required: [true, 'Address is required'], trim: true, maxlength: 250 },
    phone: { type: String, trim: true },
    image: { type: String, trim: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
