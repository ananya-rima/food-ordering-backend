const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

exports.signAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });

exports.signRefreshToken = (user) =>
  jwt.sign({ id: user._id }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires });

exports.verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
exports.verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);


exports.hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
