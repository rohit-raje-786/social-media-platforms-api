const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
	comment: {
		type: String,
		required: true
	},
	postId: {
		type: String,
		required: true
	},
	commentBy: {
		type: String,
		required: true
	}
});

// export model user with UserSchema
module.exports = mongoose.model('Comment', CommentSchema);
