if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}
// console.log(process.env);

const express = require('express');
const router = express.Router();
const wrapasync = require('../utils/wrapasync.js');
const { isLoggedIn, isOwner } = require('../middleware.js');
const {validateListing} = require('../middleware.js');
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});


// Index route, Create route share the same route path
router
    .route('/')
    .get(wrapasync(listingController.index))
    .post(isLoggedIn, 
        validateListing, 
        upload.single('listing[image]'),
        wrapasync(listingController.createListing)
    );

// New Route
router.get('/new', 
    isLoggedIn, 
    listingController.renderNewForm
);

// Edit Route
router.get('/:id/edit', 
    isLoggedIn, 
    isOwner, 
    wrapasync(listingController.renderEditForm)
);

// Search Route
router.get("/search", wrapasync(listingController.searchListings));

// Show route, Update route, Delete route share the same route path
router
    .route('/:id')
    .get(wrapasync(listingController.showListing))
    .put(isLoggedIn, 
        isOwner, 
        validateListing, 
        upload.single('listing[image]'),
        wrapasync(listingController.updateListing)
    )
    .delete(isLoggedIn, 
        isOwner, 
        wrapasync(listingController.destroyListing)
    );

module.exports = router;




