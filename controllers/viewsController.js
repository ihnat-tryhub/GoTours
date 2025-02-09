const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  const tourReivews = await Review.find({ tour: tour._id });

  const tourGuides = tour.guides;
  // create route and get the data
  // 2) Build template
  // 3) Render template using the data from 1)
  res
    .status(200)
    .set('Content-Security-Policy', 'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com')
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});
