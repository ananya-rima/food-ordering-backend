const Joi = require('joi');
const { objectId, pagination } = require('./common');

exports.usersQuery = Joi.object({
  role: Joi.string().valid('admin', 'owner', 'user'),
  isBlocked: Joi.boolean(),
  search: Joi.string().trim().max(100),
  ...pagination,
});

exports.restaurantsQuery = Joi.object({
  search: Joi.string().trim().max(100),
  status: Joi.string().valid('open', 'closed'),
  ...pagination,
});

exports.ordersQuery = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
  restaurant: objectId,
  user: objectId,
  ...pagination,
});
