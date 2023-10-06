// const query = require('express');
// const APIFeatures = require(`${__dirname}/../utils/APIFeatures`);
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const validator = require('../utils/validator');

const multerStorage = multer.memoryStorage();

const muterFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: muterFilter,
});

// upload.single('images');
// upload.array('images', 5);

exports.uploadTourImgs = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.imageCover || !req.files.images) return next();
  // console.log(req.files);
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  console.log(req.body);
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.validateBeforeCreateTour = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    name: {
      required: true,
      type: 'string',
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or euqal then 10 characters'],
    },
    duration: { required: true, type: 'number' },
    maxGroupSize: {
      required: true,
      type: 'number',
    },
    difficulty: {
      required: true,
      type: 'string',
      enum: ['easy', 'medium', 'difficult'],
    },
    price: { required: true, type: 'number' },
    priceDiscount: { type: 'number' },
    summary: { type: 'string' },
    description: { required: true, type: 'string' },
    imageCover: { required: true, type: 'string' },
    images: { required: true, type: ['string'] },
    startDates: { required: true },
    secretTour: {
      type: 'boolean',
    },
    startLocation: {
      type: 'string',
    },
    locations: {
      type: 'string',
    },
  });
  next();
});

exports.validateBeforeUpdateTour = catchAsync(async (req, res, next) => {
  validator.validateData(req.body, {
    name: {
      type: 'string',
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or euqal then 10 characters'],
    },
    duration: { type: 'number' },
    maxGroupSize: {
      type: 'number',
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'difficult'],
    },
    price: { type: 'number' },
    priceDiscount: { type: 'number' },
    summary: { type: 'string' },
    description: { type: 'string' },
    imageCover: { type: 'string' },
    images: { type: ['string'] },
    startDates: {},
    secretTour: {
      type: 'boolean',
    },
    startLocation: {
      type: 'string',
    },
    locations: {
      type: 'string',
    },
  });
  next();
});

// CRUD
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    /* {
        $match: { _id: { $ne: 'EASY' } },
      }, */
  ]);
  // console.log(stats);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $substr: ['$startDates', 5, 2] },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(radius);
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,lng.'
      ),
      400
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,lng.'
      ),
      400
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
