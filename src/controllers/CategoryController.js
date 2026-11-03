const Category = require('../models/Category');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

class CategoryController {
 
  static async getAll(req, res) {
    const categories = await Category.find().sort('name');
    return ApiResponse.send(res, { data: categories });
  }

  static async getOne(req, res) {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');
    return ApiResponse.send(res, { data: category });
  }

 
  static async create(req, res) {
    const category = await Category.create(req.body);
    return ApiResponse.send(res, { statusCode: 201, message: 'Category created', data: category });
  }

  static async update(req, res) {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new ApiError(404, 'Category not found');
    return ApiResponse.send(res, { message: 'Category updated', data: category });
  }

  static async remove(req, res) {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');
    if (await Food.exists({ category: category._id })) {
      throw new ApiError(409, 'Cannot delete a category that still has food items');
    }
    await category.deleteOne();
    return ApiResponse.send(res, { message: 'Category deleted' });
  }
}

module.exports = CategoryController;
