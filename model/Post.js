const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	createdTime: {
		type: String,
		default: Date.now()
	},
	createdBy: {
		type: String,
		required: true
	}
});

// export model user with UserSchema
module.exports = mongoose.model('Post', PostSchema);
