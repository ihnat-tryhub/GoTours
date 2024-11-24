const fs = require('fs');
const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

// Create a checkBody middleware
// Check if body contains the name and price property
// If not, send back bad request (400)
// Add it to the post handler stack

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router.param('id', tourController.checkId);

router
  .route('/:id')
  .get(tourController.getTour)
  .delete(tourController.deleteTour)
  .patch(tourController.updateTour);

module.exports = router;
