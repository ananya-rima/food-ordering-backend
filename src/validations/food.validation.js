const Joi = require('joi');
const { objectId, pagination } = require('./common');

exports.create = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).allow(''),
  price: Joi.number().min(0).required(),
  image: Joi.string().trim().uri(),
  isVeg: Joi.boolean().required(),
  isAvailable: Joi.boolean(),
  category: objectId.required(),
});

exports.update = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500).allow(''),
  price: Joi.number().min(0),
  image: Joi.string().trim().uri(),
  isVeg: Joi.boolean(),
  isAvailable: Joi.boolean(),
  category: objectId,
}).min(1);

exports.availability = Joi.object({
  isAvailable: Joi.boolean().required(),
});

exports.listQuery = Joi.object({
  search: Joi.string().trim().max(100), 
  restaurantName: Joi.string().trim().max(100),
  restaurant: objectId,
  category: objectId,
  isVeg: Joi.boolean(),
  isAvailable: Joi.boolean(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  sort: Joi.string().valid('newest', 'price_asc', 'price_desc', 'name').default('newest'),
  ...pagination,
});

exports.myListQuery = Joi.object({
  search: Joi.string().trim().max(100),
  ...pagination,
});
