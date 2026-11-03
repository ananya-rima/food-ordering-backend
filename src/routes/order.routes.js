const router = require('express').Router();
const OrderController = require('../controllers/OrderController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const { adminSecretIfAdmin } = require('../middlewares/adminSecret');
const v = require('../validations/order.validation');
const { idParam } = require('../validations/common');

router.use(authenticate, adminSecretIfAdmin); 
router.post('/', authorize('user'), validate(v.create), asyncHandler(OrderController.create));
router.get('/', validate(v.listQuery, 'query'), asyncHandler(OrderController.getAll));
router.get('/:id', validate(idParam, 'params'), asyncHandler(OrderController.getById));
router.patch('/:id/status', authorize('owner', 'admin'), validate(idParam, 'params'), validate(v.updateStatus), asyncHandler(OrderController.updateStatus));
router.patch('/:id/cancel', authorize('user'), validate(idParam, 'params'), asyncHandler(OrderController.cancel));

module.exports = router;
