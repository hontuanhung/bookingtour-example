const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const validator = require('../utils/validator');

exports.setTourUserIds = (req, res, next) => {
  req.body.user = req.user.id;
  req.body.tour = req.params.tourId;
  next();
};

exports.getAllReviews = factory.getAll(Review, {
  path: 'tour',
  select: 'name',
});

exports.validateBeforeReview = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    review: { required: true, type: 'string' },
    rating: { type: 'number', min: 1, max: 5 },
  });
  next();
});

exports.getReview = factory.getOne(Review);
exports.creatReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
