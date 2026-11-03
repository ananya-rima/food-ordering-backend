const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { containsRegex } = require('../utils/regex');
const { getOwnerRestaurant } = require('../utils/ownership');

class RestaurantController {
 
  static async create(req, res) {
    if (await Restaurant.exists({ owner: req.user._id })) {
      throw new ApiError(409, 'You already have a restaurant');
    }
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
    return ApiResponse.send(res, { statusCode: 201, message: 'Restaurant created', data: restaurant });
  }

  static async getMine(req, res) {
    const restaurant = await getOwnerRestaurant(req.user._id);
    return ApiResponse.send(res, { data: restaurant });
  }

  static async updateMine(req, res) {
    const restaurant = await getOwnerRestaurant(req.user._id); 
    Object.assign(restaurant, req.body);
    await restaurant.save();
    return ApiResponse.send(res, { message: 'Restaurant updated', data: restaurant });
  }

  static async updateStatus(req, res) {
    const restaurant = await getOwnerRestaurant(req.user._id);
    restaurant.status = req.body.status;
    await restaurant.save();
    return ApiResponse.send(res, { message: `Restaurant is now ${restaurant.status}`, data: restaurant });
  }


  static async getAll(req, res) {
    const { search, status } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (search) filter.name = containsRegex(search);
    if (status) filter.status = status;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).sort('-createdAt').skip(skip).limit(limit),
      Restaurant.countDocuments(filter),
    ]);
    return ApiResponse.send(res, { data: restaurants, meta: buildMeta(total, page, limit) });
  }

  static async getById(req, res) {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
    const foods = await Food.find({ restaurant: restaurant._id, isAvailable: true }).populate('category', 'name');
    return ApiResponse.send(res, { data: { restaurant, menu: foods } });
  }
}

module.exports = RestaurantController;
