const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const round = (n) => Math.round(n * 100) / 100;

class CartController {
  
  static async _view(userId) {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.food', 'name price image isVeg isAvailable')
      .populate('restaurant', 'name status');

    if (!cart) return { restaurant: null, items: [], totalItems: 0, totalPrice: 0 };

    const items = cart.items
      .filter((i) => i.food) 
      .map((i) => ({
        food: i.food,
        quantity: i.quantity,
        subtotal: round(i.food.price * i.quantity),
      }));

    return {
      restaurant: cart.restaurant,
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: round(items.reduce((s, i) => s + i.subtotal, 0)),
    };
  }

  static async getCart(req, res) {
    return ApiResponse.send(res, { data: await CartController._view(req.user._id) });
  }

  static async addItem(req, res) {
    const { foodId, quantity } = req.body;
    const food = await Food.findById(foodId);
    if (!food) throw new ApiError(404, 'Food item not found');
    if (!food.isAvailable) throw new ApiError(400, `${food.name} is currently unavailable`);

    const restaurant = await Restaurant.findById(food.restaurant);
    if (!restaurant || restaurant.status !== 'open') throw new ApiError(400, 'Restaurant is currently closed');

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    if (cart.items.length && !cart.restaurant.equals(food.restaurant)) {
      throw new ApiError(409, 'Your cart has items from another restaurant. Clear the cart first');
    }

    const existing = cart.items.find((i) => i.food.equals(food._id));
    if (existing) {
      if (existing.quantity + quantity > 50) throw new ApiError(400, 'Maximum quantity per item is 50');
      existing.quantity += quantity;
    } else {
      cart.items.push({ food: food._id, quantity });
    }
    cart.restaurant = food.restaurant;
    await cart.save();

    return ApiResponse.send(res, { message: 'Item added to cart', data: await CartController._view(req.user._id) });
  }

  static async updateItem(req, res) {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, 'Cart is empty');
    const item = cart.items.find((i) => i.food.equals(req.params.foodId));
    if (!item) throw new ApiError(404, 'Item not found in cart');

    const { action, quantity } = req.body;
    let newQty = quantity;
    if (action === 'increase') newQty = item.quantity + 1;
    if (action === 'decrease') newQty = item.quantity - 1;
    if (newQty > 50) throw new ApiError(400, 'Maximum quantity per item is 50');

    if (newQty <= 0) cart.items = cart.items.filter((i) => !i.food.equals(req.params.foodId));
    else item.quantity = newQty;

    if (!cart.items.length) cart.restaurant = undefined;
    await cart.save();
    return ApiResponse.send(res, { message: 'Cart updated', data: await CartController._view(req.user._id) });
  }

  static async removeItem(req, res) {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.some((i) => i.food.equals(req.params.foodId))) {
      throw new ApiError(404, 'Item not found in cart');
    }
    cart.items = cart.items.filter((i) => !i.food.equals(req.params.foodId));
    if (!cart.items.length) cart.restaurant = undefined;
    await cart.save();
    return ApiResponse.send(res, { message: 'Item removed', data: await CartController._view(req.user._id) });
  }

  static async clearCart(req, res) {
    await Cart.deleteOne({ user: req.user._id });
    return ApiResponse.send(res, { message: 'Cart cleared', data: await CartController._view(req.user._id) });
  }
}

module.exports = CartController;
