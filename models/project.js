const mongoose = require("mongoose");

//SCHEMA SETUP

let projectSchema = new mongoose.Schema({
	name: String,
	created_on: {
		type: Date,
		default: Date.now,
	},
	issues: [
		{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Issue"
		}
	],
});

let Project = mongoose.model("Project", projectSchema);
module.exports = Project;