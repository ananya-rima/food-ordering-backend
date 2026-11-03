const Joi = require('joi');
const { objectId } = require('./common');

exports.addItem = Joi.object({
  foodId: objectId.required(),
  quantity: Joi.number().integer().min(1).max(50).default(1),
});


exports.updateItem = Joi.object({
  action: Joi.string().valid('increase', 'decrease'),
  quantity: Joi.number().integer().min(0).max(50),
}).xor('action', 'quantity');

exports.foodIdParam = Joi.object({ foodId: objectId.required() });
