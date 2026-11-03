const Joi = require('joi');

exports.create = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().max(200).allow(''),
});

exports.update = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  description: Joi.string().trim().max(200).allow(''),
}).min(1);
