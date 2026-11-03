const Joi = require('joi');

exports.register = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(64).required(),
  role: Joi.string().valid('user', 'owner').default('user'), 
});

exports.login = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

exports.refresh = Joi.object({
  refreshToken: Joi.string().required(),
});
