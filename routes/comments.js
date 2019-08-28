const express    = require("express"),
// 	  the below adds the req.params.id. from the campgrounds
	  router  	 = express.Router({mergeParams: true}),
	  Campground = require("../models/campgrounds"),
      Comment    = require("../models/comment"),
	  middleware = require("../middleware")


// COMMENTS ROUTES =====================================

// comments new
router.get("/new", middleware.isLoggedIn, (req,res) => {
// 	find campground by id
	Campground.findById(req.params.id,(err, campground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground:campground});
		}
	});
});


// comments create
router.post("/", middleware.isLoggedIn, (req,res)=> {
// 	look up campground using id
	Campground.findById(req.params.id, (err, campground) =>{
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// 	create new comment
			Comment.create(req.body.comment, (err, comment) => {
				if(err) {
					req.flash("error", "Something went wrong.");
					console.log(err);
					res.redirect("/campgrounds");
				} else {
// 				add username and id to comments	
				comment.author.id = req.user._id;
				comment.author.username = req.user.username;
// 				save comments
				comment.save();
				// 	connect new comment to campground
				campground.comments.push(comment);
				campground.save();
				console.log(comment);
				// 	redirect to back to showpage of campground
				req.flash("success", "Successfully added comment.");
				res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});

});

// comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req,res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {campground_id:req.params.id, comment:foundComment});
		}
	});
});


// comment update
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) =>{
	console.log(req.params.comment_id);
	console.log(req.body.comment);
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// comment destroy
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Comment succesfully deleted.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;
