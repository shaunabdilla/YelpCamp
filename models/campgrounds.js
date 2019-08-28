const mongoose = require("mongoose");

// Schema Setup for Database
var campgroundSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	location : String,
	lat: Number,
	lng: Number,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

// compile schema into model
module.exports = mongoose.model("Campground", campgroundSchema);