const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/categories', require('./category.routes'));
router.use('/restaurants', require('./restaurant.routes'));
router.use('/foods', require('./food.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/orders', require('./order.routes'));

module.exports = router;
