const mongoose = require("mongoose");

//SCHEMA SETUP

let issueSchema = new mongoose.Schema({
	issue_title: String,
	issue_text: String,
	created_by: String,
	assigned_to: String,
	status_text: String,
	created_on: {
		type: Date,
		default: Date.now,
    },
    updated_on: {
		type: Date,
		default: Date.now,
    },
    open: {
        type: Boolean,
        default: true
    }
});

let Issue = mongoose.model("Issue", issueSchema);
module.exports = Issue;