const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

const round = (n) => Math.round(n * 100) / 100;


const TRANSITIONS = {
  pending: ['accepted', 'rejected'],
  accepted: ['preparing'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
};
const ADMIN_CANCELLABLE = ['pending', 'accepted', 'preparing', 'out_for_delivery'];

class OrderController {
 
  static async _assertAccess(order, user) {
    if (user.role === 'admin') return;
    if (user.role === 'user') {
      if (!order.user.equals(user._id)) throw new ApiError(403, 'This is not your order');
      return;
    }
    
    const restaurant = await Restaurant.findOne({ owner: user._id });
    if (!restaurant || !order.restaurant.equals(restaurant._id)) {
      throw new ApiError(403, 'This order does not belong to your restaurant');
    }
  }

  static async _findOrder(id) {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');
    return order;
  }

 
  static async create(req, res) {
    const { deliveryAddress, paymentMethod, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
    if (!cart || !cart.items.length) throw new ApiError(400, 'Your cart is empty');

    const restaurant = await Restaurant.findById(cart.restaurant);
    if (!restaurant) throw new ApiError(400, 'Restaurant no longer exists');
    if (restaurant.status !== 'open') throw new ApiError(400, `${restaurant.name} is currently closed`);

    const items = cart.items.map((i) => {
      if (!i.food) throw new ApiError(400, 'An item in your cart no longer exists. Please update your cart');
      if (!i.food.isAvailable) throw new ApiError(400, `${i.food.name} is currently unavailable`);
      return { food: i.food._id, name: i.food.name, price: i.food.price, quantity: i.quantity };
    });
    const totalAmount = round(items.reduce((s, i) => s + i.price * i.quantity, 0));

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant._id,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      notes,
      statusHistory: [{ status: 'pending', changedBy: req.user._id }],
    });
    await Cart.deleteOne({ _id: cart._id });

    return ApiResponse.send(res, { statusCode: 201, message: 'Order placed', data: order });
  }

 
  static async getAll(req, res) {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    if (req.user.role === 'user') {
      filter.user = req.user._id;
    } else if (req.user.role === 'owner') {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) return ApiResponse.send(res, { data: [], meta: buildMeta(0, page, limit) });
      filter.restaurant = restaurant._id;
    } 

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('restaurant', 'name')
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);
    return ApiResponse.send(res, { data: orders, meta: buildMeta(total, page, limit) });
  }

  static async getById(req, res) {
    const order = await OrderController._findOrder(req.params.id);
    await OrderController._assertAccess(order, req.user);
    await order.populate([
      { path: 'restaurant', select: 'name address' },
      { path: 'user', select: 'name email' },
    ]);
    return ApiResponse.send(res, { data: order });
  }

 
  static async updateStatus(req, res) {
    const { status } = req.body;
    const order = await OrderController._findOrder(req.params.id);
    await OrderController._assertAccess(order, req.user);

    if (status === 'cancelled') {
      if (req.user.role !== 'admin') throw new ApiError(403, 'Only an admin can cancel through this endpoint');
      if (!ADMIN_CANCELLABLE.includes(order.status)) {
        throw new ApiError(400, `Cannot cancel an order that is ${order.status}`);
      }
    } else {
      const allowed = TRANSITIONS[order.status] || [];
      if (!allowed.includes(status)) {
        throw new ApiError(
          400,
          allowed.length
            ? `Order is ${order.status}; next allowed status: ${allowed.join(' or ')}`
            : `Order is ${order.status} and its status can no longer be changed`
        );
      }
    }

    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id });
    await order.save();
    return ApiResponse.send(res, { message: `Order ${status.replace(/_/g, ' ')}`, data: order });
  }

  
  static async cancel(req, res) {
    const order = await OrderController._findOrder(req.params.id);
    await OrderController._assertAccess(order, req.user);
    if (order.status !== 'pending') {
      throw new ApiError(400, `Only pending orders can be cancelled (this order is ${order.status})`);
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', changedBy: req.user._id });
    await order.save();
    return ApiResponse.send(res, { message: 'Order cancelled', data: order });
  }
}

module.exports = OrderController;
