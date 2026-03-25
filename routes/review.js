const express = require('express');
const router = express.Router({mergeParams: true});
const wrapasync = require('../utils/wrapasync.js');
const {isLoggedIn, isAuthor} = require('../middleware.js');
const {validateReview} = require('../middleware.js');
const reviewController = require('../controllers/review.js');

// Post Route
router.post('/', 
    isLoggedIn, 
    validateReview, 
    wrapasync(reviewController.createReview)
);

// Delete Review Route
router.delete('/:reviewId', 
    isLoggedIn, 
    isAuthor, 
    wrapasync(reviewController.destroyReview)
);

module.exports = router;