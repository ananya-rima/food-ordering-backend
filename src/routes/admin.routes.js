const router = require('express').Router();
const AdminController = require('../controllers/AdminController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const adminSecret = require('../middlewares/adminSecret');
const v = require('../validations/admin.validation');
const { idParam } = require('../validations/common');


router.use(authenticate, authorize('admin'), adminSecret);

router.get('/stats', asyncHandler(AdminController.getStats));
router.get('/users', validate(v.usersQuery, 'query'), asyncHandler(AdminController.getUsers));
router.patch('/users/:id/block', validate(idParam, 'params'), asyncHandler(AdminController.blockUser));
router.patch('/users/:id/unblock', validate(idParam, 'params'), asyncHandler(AdminController.unblockUser));
router.get('/restaurants', validate(v.restaurantsQuery, 'query'), asyncHandler(AdminController.getRestaurants));
router.get('/orders', validate(v.ordersQuery, 'query'), asyncHandler(AdminController.getOrders));

module.exports = router;
