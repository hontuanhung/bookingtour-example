const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');
const {
  uploadTourImgs,
  resizeTourImages,
  getDistances,
  getToursWithin,
  getMonthlyPlan,
  getTourStats,
  aliasTopTours,
  getAllTours,
  validateBeforeCreateTour,
  createTour,
  getTour,
  validateBeforeUpdateTour,
  updateTour,
  deleteTour,
} = require(`./../controllers/tourController`);

const router = express.Router();
//MIDDLEWARE
// router.param('id', checkID);

//ROUTES

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/:tourId/reviews', reviewRouter)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewController.validateBeforeCreateReview,
    reviewController.setTourUserIds,
    reviewController.creatReview
  );

router.route('/tour-stats').get(getTourStats);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    validateBeforeCreateTour,
    createTour
  );
router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    validateBeforeUpdateTour,
    uploadTourImgs,
    resizeTourImages,
    updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour
  );

module.exports = router;
