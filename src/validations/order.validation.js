const Joi = require('joi');
const { pagination } = require('./common');

exports.create = Joi.object({
  deliveryAddress: Joi.string().trim().min(5).max(250).required(),
  paymentMethod: Joi.string().valid('COD', 'ONLINE').default('COD'),
  notes: Joi.string().trim().max(250).allow(''),
});

exports.updateStatus = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
    .required(),
});

exports.listQuery = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
  ...pagination,
});
