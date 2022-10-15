const mongoose = require('mongoose');

const LikeSchema = mongoose.Schema({
	likes: {
		type: Number,
		default: 0
	},
	unlikes: {
		type: Number,
		default: 0
	},
	postId: {
		type: String,
		required: true
	},
	likeBy: {
		type: Array
	},
	unlikeBy: {
		type: Array
	}
});

// export model user with UserSchema
module.exports = mongoose.model('Like', LikeSchema);
