const express = require("express"),
	  router  = express.Router(),
	  Campground = require("../models/campgrounds"),
	  middleware = require("../middleware"),
	  NodeGeocoder = require("node-geocoder");
 

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX route - show all campgrounds
router.get("/", (req,res) => {
// 	Get all campgrounds from DB
	Campground.find({}, (err, allCampgrounds) => {
		if (err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user});
		}
	});
});

// CREATE route - add new to database
router.post("/", middleware.isLoggedIn, (req, res)=> {
// 	get data from form and add to array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	
	geocoder.geocode(req.body.location, (err, data) => {
		console.log(data);
		console.log(err);
    if (err||!data.length) {
	  req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng, price:price};
	
// 	Create a new campground and save to database
	Campground.create(newCampground, (err, newlyCreated) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});
});
// NEW - show form to create campgrounds
router.get("/new", middleware.isLoggedIn, (req, res) => { 
	res.render("campgrounds/new");
});

// SHOW ROUTE - show particular camp new info
router.get("/:id", (req, res) => {
	// 	find the campground with provided id
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if (err){
			console.log(err);
		} else {
			console.log(foundCampground);
			// 	render showpage of the provided id campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});


// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req,res) => {
		Campground.findById(req.params.id, (err, foundCampground) => {
			if (err) {
				req.flash("error", "Campground not found.");
			} else {
				res.render("campgrounds/edit", {campground: foundCampground});
			}
		});
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) =>{
	geocoder.geocode(req.body.location, (err, data) => {
		if (err || !data.length) {
		  req.flash('error', 'Invalid address');
		  return res.redirect('back');
		}
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) =>{
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req,res) => {
	Campground.findByIdAndRemove(req.params.id, (err)=>{
		if(err){
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Campground succesfully destroyed.");
			res.redirect("/campgrounds");
		}
	});
});


module.exports = router;