const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    items: [
      {
        _id: false,
        food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
        name: { type: String, required: true }, 
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true, trim: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    notes: { type: String, trim: true, maxlength: 250 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    statusHistory: [
      {
        _id: false,
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
