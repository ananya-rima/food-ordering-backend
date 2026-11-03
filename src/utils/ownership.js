const Restaurant = require('../models/Restaurant');
const ApiError = require('./ApiError');


exports.getOwnerRestaurant = async (ownerId) => {
  const restaurant = await Restaurant.findOne({ owner: ownerId });
  if (!restaurant) throw new ApiError(404, 'You have not created a restaurant yet');
  return restaurant;
};
