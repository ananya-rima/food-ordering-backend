const router = require('express').Router();
const FoodController = require('../controllers/FoodController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const v = require('../validations/food.validation');
const { idParam } = require('../validations/common');

router.use(authenticate);


router.get('/my', authorize('owner'), validate(v.myListQuery, 'query'), asyncHandler(FoodController.getMine));
router.post('/', authorize('owner'), validate(v.create), asyncHandler(FoodController.create));
router.put('/:id', authorize('owner'), validate(idParam, 'params'), validate(v.update), asyncHandler(FoodController.update));
router.patch('/:id/availability', authorize('owner'), validate(idParam, 'params'), validate(v.availability), asyncHandler(FoodController.setAvailability));
router.delete('/:id', authorize('owner'), validate(idParam, 'params'), asyncHandler(FoodController.remove));


router.get('/', authorize('user', 'owner'), validate(v.listQuery, 'query'), asyncHandler(FoodController.getAll));
router.get('/:id', authorize('user', 'owner'), validate(idParam, 'params'), asyncHandler(FoodController.getById));

module.exports = router;
