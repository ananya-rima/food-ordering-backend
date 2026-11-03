const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const v = require('../validations/auth.validation');

router.post('/register', validate(v.register), asyncHandler(AuthController.register));
router.post('/login', validate(v.login), asyncHandler(AuthController.login));
router.post('/refresh-token', validate(v.refresh), asyncHandler(AuthController.refreshToken));
router.post('/logout', authenticate, asyncHandler(AuthController.logout));
router.get('/me', authenticate, asyncHandler(AuthController.me));

module.exports = router;
