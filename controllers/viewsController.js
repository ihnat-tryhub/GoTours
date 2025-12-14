const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const CSP_HEADER =
  "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;";

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection с учетом фильтрации
  let filter = {};
  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: 'i' };
  }
  if (req.query['price[lte]']) {
    filter.price = { ...filter.price, $lte: req.query['price[lte]'] };
  }
  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }
  const features = new APIFeatures(Tour.find(filter), req.query).sort().limit().paginate();
  const tours = await features.query;

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('overview', {
    title: 'All Tours',
    tours,
    query: req.query,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user ',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name'));
  }
  //2) Build template

  //3) Render template using data from 1
  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('signup', {
    title: 'Signup',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  if (bookings.length == 0) {
    return res.status(200).set('Content-Security-Policy', CSP_HEADER).render('overview', {
      title: 'My bookings',
      message: 'You have no bookings yet.  Book a tour now!',
    });
  }
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('overview', {
    title: 'My bookings',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.resetPassword = catchAsync(async (req, res) => {
  res.status(200).set('Content-Security-Policy', CSP_HEADER).render('resetPassword', {
    title: 'Reset password',
  });
});
