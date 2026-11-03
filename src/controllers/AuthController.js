const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/token');

class AuthController {
 
  static async _issueTokens(user) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await User.updateOne({ _id: user._id }, { refreshToken: hashToken(refreshToken) });
    return { accessToken, refreshToken };
  }

  static async register(req, res) {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered');

    const user = await User.create({ name, email, password, role });
    const tokens = await AuthController._issueTokens(user);
    return ApiResponse.send(res, {
      statusCode: 201,
      message: 'Registered successfully',
      data: { user, ...tokens },
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }
    if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked');

    const tokens = await AuthController._issueTokens(user);
    return ApiResponse.send(res, { message: 'Login successful', data: { user, ...tokens } });
  }

  static async refreshToken(req, res) {
    const { refreshToken } = req.body;
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
      throw new ApiError(401, 'Refresh token is no longer valid');
    }
    if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked');

    const tokens = await AuthController._issueTokens(user);
    return ApiResponse.send(res, { message: 'Token refreshed', data: tokens });
  }

  static async logout(req, res) {
    await User.updateOne({ _id: req.user._id }, { $unset: { refreshToken: 1 } });
    return ApiResponse.send(res, { message: 'Logged out successfully' });
  }

  static async me(req, res) {
    return ApiResponse.send(res, { data: req.user });
  }
}

module.exports = AuthController;
