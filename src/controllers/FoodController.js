const Food = require('../models/Food');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { containsRegex } = require('../utils/regex');
const { getOwnerRestaurant } = require('../utils/ownership');

const SORT_MAP = {
  newest: '-createdAt',
  price_asc: 'price',
  price_desc: '-price',
  name: 'name',
};

class FoodController {
  
  static async _getOwnedFood(foodId, ownerId) {
    const food = await Food.findById(foodId);
    if (!food) throw new ApiError(404, 'Food item not found');
    const restaurant = await getOwnerRestaurant(ownerId);
    if (!food.restaurant.equals(restaurant._id)) {
      throw new ApiError(403, 'You do not own this food item');
    }
    return food;
  }

  static async _assertCategory(categoryId) {
    if (!(await Category.exists({ _id: categoryId }))) throw new ApiError(404, 'Category not found');
  }

 
  static async create(req, res) {
    const restaurant = await getOwnerRestaurant(req.user._id);
    await FoodController._assertCategory(req.body.category);
    const food = await Food.create({ ...req.body, restaurant: restaurant._id });
    return ApiResponse.send(res, { statusCode: 201, message: 'Food item added', data: food });
  }

  static async update(req, res) {
    const food = await FoodController._getOwnedFood(req.params.id, req.user._id);
    if (req.body.category) await FoodController._assertCategory(req.body.category);
    Object.assign(food, req.body);
    await food.save();
    return ApiResponse.send(res, { message: 'Food item updated', data: food });
  }

  static async setAvailability(req, res) {
    const food = await FoodController._getOwnedFood(req.params.id, req.user._id);
    food.isAvailable = req.body.isAvailable;
    await food.save();
    return ApiResponse.send(res, { message: 'Availability updated', data: food });
  }

  static async remove(req, res) {
    const food = await FoodController._getOwnedFood(req.params.id, req.user._id);
    await food.deleteOne();
    return ApiResponse.send(res, { message: 'Food item deleted' });
  }

  static async getMine(req, res) {
    const restaurant = await getOwnerRestaurant(req.user._id);
    const { page, limit, skip } = getPagination(req.query);
    const filter = { restaurant: restaurant._id };
    if (req.query.search) filter.name = containsRegex(req.query.search);

    const [foods, total] = await Promise.all([
      Food.find(filter).populate('category', 'name').sort('-createdAt').skip(skip).limit(limit),
      Food.countDocuments(filter),
    ]);
    return ApiResponse.send(res, { data: foods, meta: buildMeta(total, page, limit) });
  }

 
  static async getAll(req, res) {
    const { search, restaurantName, restaurant, category, isVeg, isAvailable, minPrice, maxPrice, sort } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (search) filter.name = containsRegex(search);
    if (category) filter.category = category;
    if (isVeg !== undefined) filter.isVeg = isVeg;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (restaurantName) {
      const ids = await Restaurant.distinct('_id', { name: containsRegex(restaurantName) });
      filter.restaurant = restaurant
        ? ids.some((id) => id.equals(restaurant)) ? restaurant : { $in: [] }
        : { $in: ids };
    } else if (restaurant) {
      filter.restaurant = restaurant;
    }

   
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    else if (req.user.role === 'user') filter.isAvailable = true;

    const [foods, total] = await Promise.all([
      Food.find(filter)
        .populate('restaurant', 'name status')
        .populate('category', 'name')
        .sort(SORT_MAP[sort] || SORT_MAP.newest)
        .skip(skip)
        .limit(limit),
      Food.countDocuments(filter),
    ]);
    return ApiResponse.send(res, { data: foods, meta: buildMeta(total, page, limit) });
  }

  static async getById(req, res) {
    const food = await Food.findById(req.params.id)
      .populate('restaurant', 'name status address')
      .populate('category', 'name');
    if (!food) throw new ApiError(404, 'Food item not found');
    return ApiResponse.send(res, { data: food });
  }
}

module.exports = FoodController;
