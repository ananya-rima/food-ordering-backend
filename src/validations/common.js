const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

exports.objectId = objectId;
exports.idParam = Joi.object({ id: objectId.required() });
exports.pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};
