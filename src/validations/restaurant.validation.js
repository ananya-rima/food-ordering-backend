const Joi = require('joi');
const { pagination } = require('./common');

const phone = Joi.string().trim().pattern(/^[0-9+\-\s]{7,15}$/).messages({ 'string.pattern.base': 'phone is invalid' });

exports.create = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).allow(''),
  address: Joi.string().trim().min(5).max(250).required(),
  phone,
  image: Joi.string().trim().uri(),
});

exports.update = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500).allow(''),
  address: Joi.string().trim().min(5).max(250),
  phone,
  image: Joi.string().trim().uri(),
}).min(1);

exports.status = Joi.object({
  status: Joi.string().valid('open', 'closed').required(),
});

exports.listQuery = Joi.object({
  search: Joi.string().trim().max(100),
  status: Joi.string().valid('open', 'closed'),
  ...pagination,
});
