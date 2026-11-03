const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');


const adminSecret = (req, res, next) => {
  const provided = req.headers['x-admin-secret'];
  if (!provided) throw new ApiError(403, 'Admin secret key is required (x-admin-secret header)');
  const a = Buffer.from(String(provided));
  const b = Buffer.from(env.adminSecretKey);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new ApiError(403, 'Invalid admin secret key');
  }
  next();
};


const adminSecretIfAdmin = (req, res, next) =>
  req.user && req.user.role === 'admin' ? adminSecret(req, res, next) : next();

module.exports = adminSecret;
module.exports.adminSecretIfAdmin = adminSecretIfAdmin;
