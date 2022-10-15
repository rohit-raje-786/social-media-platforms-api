const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	followers: {
		type: Number,
		required: true
	},
	following: {
		type: Number,
		required: true
	},
	followersArr: {
		type: Array
	},
	followingArr: {
		type: Array
	},
	token: {
		type: String,
		required: true
	}
});

// export model user with UserSchema
module.exports = mongoose.model('User', UserSchema);
