const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const validator = require('validator');
/* import {mongoose} from ('mongoose');
import {slugify} from ('slugify');
import {validator} from ('validator'); */

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      // maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      // minlength: [10, 'A tour name must have more or euqal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      // required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      // require: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      // require: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => val.toFixed(1),
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      // required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // this only points to current doc on NEW document creation
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      // required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      // require: [true, 'A  tour must have a cover image'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: [Date],
      // require: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        // default: 'Point',
        // emun: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          emun: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

// DOCUMENT MIDDLEWARE: chạy trước khi .save() và .create()(post) thực thi
tourSchema.pre('save', function (next) {
  console.log(this); // trỏ đến doc đang được thực thi
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Embedding by userid
/* tourSchema.pre('save', async function (next) {
  // console.log(this.guides);
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
}); */

tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
}); //chạy sau khi .save()

//FIND QUERY MIDDLEWARE: chạy trước khi .find() thực thi
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //this trỏ đến Query object
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs[docs]);
  next();
});

// // AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this._pipeline.unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this);
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
