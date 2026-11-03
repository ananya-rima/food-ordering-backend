const router = require('express').Router();
const CategoryController = require('../controllers/CategoryController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const adminSecret = require('../middlewares/adminSecret');
const { adminSecretIfAdmin } = adminSecret;
const v = require('../validations/category.validation');
const { idParam } = require('../validations/common');

router.use(authenticate);


router.get('/', adminSecretIfAdmin, asyncHandler(CategoryController.getAll));
router.get('/:id', adminSecretIfAdmin, validate(idParam, 'params'), asyncHandler(CategoryController.getOne));


router.post('/', authorize('admin'), adminSecret, validate(v.create), asyncHandler(CategoryController.create));
router.put('/:id', authorize('admin'), adminSecret, validate(idParam, 'params'), validate(v.update), asyncHandler(CategoryController.update));
router.delete('/:id', authorize('admin'), adminSecret, validate(idParam, 'params'), asyncHandler(CategoryController.remove));

module.exports = router;
