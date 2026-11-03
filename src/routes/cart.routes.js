const router = require('express').Router();
const CartController = require('../controllers/CartController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const v = require('../validations/cart.validation');

router.use(authenticate, authorize('user'));

router.get('/', asyncHandler(CartController.getCart));
router.post('/items', validate(v.addItem), asyncHandler(CartController.addItem));
router.patch('/items/:foodId', validate(v.foodIdParam, 'params'), validate(v.updateItem), asyncHandler(CartController.updateItem));
router.delete('/items/:foodId', validate(v.foodIdParam, 'params'), asyncHandler(CartController.removeItem));
router.delete('/', asyncHandler(CartController.clearCart));

module.exports = router;
