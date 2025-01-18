const express = require('express');
const router = express.Router();
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

router.route('/:id').get(authController.protect, reviewController.getReview);

module.exports = router;
// populate two fields
