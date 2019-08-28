require('dotenv').config();

const express 		= require("express"),
	  app 			= express(),
 	  port 			= 3000,
 	  bodyParser 	= require("body-parser"),
 	  mongoose 		= require("mongoose"),
	  passport 		= require("passport"),
	  LocalStrategy = require("passport-local"),
	  methodOverride = require("method-override"),
	  flash			= require("connect-flash"),
	  Campground 	= require("./models/campgrounds"),
	  User 			= require("./models/user"),
	  Comment		= require("./models/comment"),
	  seedDB 		= require("./seeds"),
	  NodeGeocoder = require("node-geocoder")
	 
// requiring routes
const commentRoutes    = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes 	   = require("./routes/index") 

// mongoose deprecation changes here ------------------------
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// mongoose deprecation changes here ------------------------

// using seed to populate db
// seedDB();

// connecting mongoose to db
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });

// serving public folder to app
app.use(express.static(__dirname + "/public"));

// using body parser for json etc
app.use(bodyParser.urlencoded({extended: true}));

// setting ejs
app.set("view engine", "ejs");

// method override
app.use(methodOverride("_method"));

// use connect-flash
app.use(flash());

// passport configuration
app.use(require("express-session")({
	secret: "Nina is the best dog",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


// =====================================================

app.listen(port, () => {
	console.log("Listening on port 3000, YelpCamp Server has started");
});