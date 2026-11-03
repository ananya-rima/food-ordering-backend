const router = require('express').Router();
const RestaurantController = require('../controllers/RestaurantController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const v = require('../validations/restaurant.validation');
const { idParam } = require('../validations/common');

router.use(authenticate);


router.post('/', authorize('owner'), validate(v.create), asyncHandler(RestaurantController.create));
router.get('/my', authorize('owner'), asyncHandler(RestaurantController.getMine));
router.put('/my', authorize('owner'), validate(v.update), asyncHandler(RestaurantController.updateMine));
router.patch('/my/status', authorize('owner'), validate(v.status), asyncHandler(RestaurantController.updateStatus));


router.get('/', authorize('user', 'owner'), validate(v.listQuery, 'query'), asyncHandler(RestaurantController.getAll));
router.get('/:id', authorize('user', 'owner'), validate(idParam, 'params'), asyncHandler(RestaurantController.getById));

module.exports = router;
