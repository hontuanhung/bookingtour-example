const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    console.log(req.query);
    //To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    if (popOptions)
      features.query.populate({
        path: 'tour',
        select: 'name',
      });
    // const docs = await features.query.explain();
    const docs = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
        docs,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const docChanged = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!docChanged) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: docChanged,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    console.log(id);
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

/*   exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    let reviews = await Review.find(filter).populate({
      path: 'tour',
      select: 'name',
    });
  
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: reviews,
    });
  }); */
/*   exports.getAllTours = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    console.log(req.query);
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  }); */

/* 
exports.getTour = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const id = req.params.id;
  const tour = await Tour.findById(id).populate('reviews');

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}); */

/*   exports.createTour = catchAsync(async (req, res, next) => {
    // console.log(req.body);
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
*/

/* 
exports.getTour = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const id = req.params.id;
  const tour = await Tour.findById(id).populate('reviews');

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tourChanged = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tourChanged) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tourChanged,
    },
  });
}); */

/* exports.deleteTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
}); */
