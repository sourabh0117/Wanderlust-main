const Listing = require('../models/listing');
const axios = require("axios");
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

module.exports.index = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {};

        if (category) {
            if (category === "MyListings" && req.user) {
                filter.owner = req.user._id;
            } else if (category === "MyListings" && !req.user) {
                req.flash("error", "You need to be logged in to view your listings.");
                return res.redirect("/login");
            } else {
                filter.category = category;
            }
        }

        const allListings = await Listing.find(filter);
        if (allListings.length === 0) {
            req.flash("error", "No listings available in this category.");
            return res.redirect("/listings");
        }
        res.render("listings/index.ejs", { allListings });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong. Please try again later.");
        res.redirect("/listings");
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render('./listings/new.ejs');
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const list = await Listing.findById(id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    .populate('owner');
    if(!list){
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }
    // console.log(list);
    res.render('./listings/show.ejs', {list});
};

module.exports.createListing = async (req, res, next) => {
    const geoData = await axios.get(NOMINATIM_URL,
        {
            params: {
            q: req.body.listing.location,
            format: "json",
            limit: 1
            },
            headers: {
            "User-Agent": "your-app-name"
            }
        }
    );
    // console.log(geoData.data[0]);

    let url = req.file.path;
    let filename = req.file.filename;
    const listing  = req.body.listing;
    const newListing =  new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    if (!geoData.data.length) {
        req.flash("error", "Location not found");
        return res.redirect("/listings/new");
    }
    newListing.geometry = {
        type: "Point",
        coordinates: [
            parseFloat(geoData.data[0].lon),
            parseFloat(geoData.data[0].lat)
        ]
    };
    let savedListing = await newListing.save();
    // console.log(savedListing);
    req.flash('success', 'New Listing created!');
    res.redirect('/listings');
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = listing.image.url.replace('/upload/', '/upload/w_250/');
    res.render('./listings/edit.ejs', {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== 'undefined'){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash('success', 'Listing Updated');
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    // console.log(listing);
    req.flash('success', 'Listing Deleted');
    res.redirect('/listings');
};

module.exports.searchListings = async (req, res) => {
    const { s } = req.query;
    if (!s || typeof s !== 'string') {
        req.flash("error", "Please enter a valid search term.");
        return res.redirect("/listings");
    }
    const listings = await Listing.find({
        $or: [
            { location: { $regex: s, $options: "i" } },
            { title: { $regex: s, $options: "i" } },
            { category: { $regex: s, $options: "i" } },
            { country: { $regex: s, $options: "i" } }
        ]
    });

    if(listings.length === 0){
        req.flash("error","No Listings Found!");
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs", { allListings: listings });
};