const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Food name is required'], trim: true, maxlength: 100, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    image: { type: String, trim: true },
    isVeg: { type: Boolean, required: [true, 'isVeg is required'] },
    isAvailable: { type: Boolean, default: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
