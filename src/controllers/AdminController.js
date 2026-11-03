const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { containsRegex } = require('../utils/regex');

class AdminController {
  
  static async getUsers(req, res) {
    const { role, isBlocked, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked;
    if (search) {
      const rx = containsRegex(search);
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return ApiResponse.send(res, { data: users, meta: buildMeta(total, page, limit) });
  }

  static async _setBlocked(req, res, blocked) {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role === 'admin') throw new ApiError(400, 'Admin accounts cannot be blocked');
    if (user.isBlocked === blocked) {
      throw new ApiError(400, `User is already ${blocked ? 'blocked' : 'unblocked'}`);
    }
    user.isBlocked = blocked;
    if (blocked) user.refreshToken = undefined; 
    await user.save();
    return ApiResponse.send(res, { message: `User ${blocked ? 'blocked' : 'unblocked'}`, data: user });
  }

  static blockUser(req, res) {
    return AdminController._setBlocked(req, res, true);
  }

  static unblockUser(req, res) {
    return AdminController._setBlocked(req, res, false);
  }

  
  static async getRestaurants(req, res) {
    const { search, status } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (search) filter.name = containsRegex(search);
    if (status) filter.status = status;
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).populate('owner', 'name email isBlocked').sort('-createdAt').skip(skip).limit(limit),
      Restaurant.countDocuments(filter),
    ]);
    return ApiResponse.send(res, { data: restaurants, meta: buildMeta(total, page, limit) });
  }

  
  static async getOrders(req, res) {
    const { status, restaurant, user } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (status) filter.status = status;
    if (restaurant) filter.restaurant = restaurant;
    if (user) filter.user = user;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('restaurant', 'name').populate('user', 'name email').sort('-createdAt').skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return ApiResponse.send(res, { data: orders, meta: buildMeta(total, page, limit) });
  }

  
  static async getStats(req, res) {
    const [users, owners, blockedUsers, restaurants, foods, categories, totalOrders, byStatus, revenueAgg] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'owner' }),
        User.countDocuments({ isBlocked: true }),
        Restaurant.countDocuments(),
        Food.countDocuments(),
        Category.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
       
        Order.aggregate([
          { $match: { status: 'delivered' } },
          { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        ]),
      ]);

    const ordersByStatus = byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
    const revenue = revenueAgg[0] || { revenue: 0, orders: 0 };

    return ApiResponse.send(res, {
      data: {
        users,
        restaurantOwners: owners,
        blockedUsers,
        restaurants,
        foodItems: foods,
        categories,
        totalOrders,
        ordersByStatus,
        deliveredOrders: revenue.orders,
        totalRevenue: Math.round(revenue.revenue * 100) / 100,
        averageOrderValue: revenue.orders ? Math.round((revenue.revenue / revenue.orders) * 100) / 100 : 0,
      },
    });
  }
}

module.exports = AdminController;
