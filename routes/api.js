const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const router = express.Router();

const User = require('../model/User');
const Post = require('../model/Post');
const Like = require('../model/Like');
const Comment = require('../model/Comment');

router.post(
	'/authenticate',
	[
		check('email', 'Please enter a valid email').isEmail(),
		check('password', 'Please enter a valid password').isLength({
			min: 6
		})
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array()
			});
		}

		const { email, password } = req.body;
		try {
			let user = await User.findOne({
				email
			});
			if (!user)
				return res.status(400).json({
					message: 'User Not Exist'
				});

			const isMatch = password === user.password;

			if (!isMatch)
				return res.status(400).json({
					message: 'Incorrect Password !'
				});

			const payload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				payload,
				process.env.TOKEN_KEY,
				{
					expiresIn: 3600
				},
				(err, token) => {
					if (err) throw err;
					user.token = token;
					return res.status(200).json(user);
				}
			);
		} catch (e) {
			console.error(e);
			return res.status(500).json({
				message: 'Server Error'
			});
		}
	}
);

router.post('/follow/:id', auth, async (req, res) => {
	if (req.user.user.id === req.params.id) {
		return res.status(500).json({
			message: 'User cannot follow himself'
		});
	} else {
		try {
			let user = await User.findById(req.params.id);
			let followerExit = user.followersArr.filter(f => f === req.user.user.id);

			if (followerExit.length === 0) {
				const user = await User.findOneAndUpdate(
					{
						_id: req.params.id
					},
					{
						$inc: { followers: 1 },
						$push: { followersArr: req.user.user.id }
					},
					{ new: true }
				);

				await User.findOneAndUpdate(
					{
						_id: req.user.user.id
					},
					{
						$inc: { following: 1 },
						$push: { followingArr: req.params.id }
					},
					{ new: true }
				);
				return res.status(200).send(user);
			} else {
				return res.status(200).json({
					message: `You already follow ${req.params.id}`
				});
			}
		} catch (e) {
			return res.status(500).json({
				message: 'Server Error'
			});
		}
	}
});

router.post('/unfollow/:id', auth, async (req, res) => {
	if (req.user.user.id === req.params.id) {
		return res.status(500).json({
			message: 'User cannot unfollow himself'
		});
	} else {
		try {
			let user = await User.findById(req.params.id);
			let followerExit = user.followersArr.filter(f => f === req.user.user.id);

			if (followerExit.length === 0) {
				return res.status(200).json({
					message: `User must follow the another user to unfollow`
				});
			} else {
				const user = await User.findOneAndUpdate(
					{
						_id: req.params.id
					},
					{
						$inc: { followers: -1 },
						$pull: { followersArr: req.user.user.id }
					},
					{ new: true }
				);

				await User.findOneAndUpdate(
					{
						_id: req.user.user.id
					},
					{
						$inc: { following: -1 },
						$pull: { followingArr: req.params.id }
					},
					{ new: true }
				);
				return res.status(200).send(user);
			}
		} catch (e) {
			return res.status(500).json({
				message: 'Server Error'
			});
		}
	}
});

//to get the user profile
router.get('/:username', auth, async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username });
		if (!user) {
			return res.status(400).json({
				message: 'User Not Exist'
			});
		}
		const updatedUser = {
			username: user.username,
			followers: user.followers,
			following: user.following
		};
		return res.status(200).json(updatedUser);
	} catch (e) {
		res.status(500).json({
			message: 'Server Error'
		});
	}
});

//to add a new post
router.post('/posts', auth, async (req, res) => {
	try {
		const { title, description } = req.body;
		let post = new Post({
			title,
			description,
			createdBy: req.user.user.id
		});
		await post.save();

		let like = new Like({
			postId: post._id
		});

		await like.save();

		return res.status(200).json(post);
	} catch (e) {
		return res.status(500).json({
			message: e.message
		});
	}
});

// to delete the post
router.delete('/posts/:id', auth, async (req, res) => {
	try {
		let id = req.params.id;
		let post = await Post.findOne({
			createdBy: req.user.user.id
		});
		// console.log(post);
		if (post) {
			await Post.deleteOne({ _id: id });
			await Like.deleteOne({ postId: post._id });
			let comment = await Comment.find({
				postId: id
			});
			if (comment) {
				await Comment.deleteOne({ postId: id });
			}

			return res.status(200).send('Post deleted successfully');
		} else {
			return res.status(400).json({
				message: 'User is not authorized to delete the post'
			});
		}
	} catch (e) {
		return res.status(500).json({
			message: 'Server Error'
		});
	}
});

// to like the post
router.post('/like/:id', auth, async (req, res) => {
	try {
		let id = req.params.id;
		let post = await Like.findOne({ postId: id });

		console.log(post);

		if (post) {
			let alreadyLike = post.likeBy.filter(user => user === req.user.user.id);
			let alreadyunLike = post.unlikeBy.filter(user => user === req.user.user.id);

			if (alreadyunLike.length === 0 && alreadyLike.length === 0) {
				await Like.findOneAndUpdate(post._id, {
					$inc: { likes: 1 },
					$push: { likeBy: req.user.user.id }
				});
				return res.status(200).send(`User ${req.user.user.id} liked the post ${id}`);
			} else if (alreadyunLike.length != 0) {
				await Like.findOneAndUpdate(post._id, {
					$inc: { likes: 1, unlikes: -1 },

					$pull: { unlikeBy: req.user.user.id },
					$push: { likeBy: req.user.user.id }
				});
				return res.status(200).send(`User ${req.user.user.id} liked the post ${id}`);
			} else if (alreadyLike != 0) {
				return res.status(200).send('User can like the post only once');
			}
		} else {
			return res.status(400).json({
				message: 'Post does not exists'
			});
		}
	} catch (e) {
		return res.status(500).json({
			message: 'Server Error'
		});
	}
});

// to unlike a post
router.post('/unlike/:id', auth, async (req, res) => {
	try {
		let id = req.params.id;
		let post = await Like.findOne({ postId: id });

		if (post) {
			let alreadyLike = post.likeBy.filter(user => user === req.user.user.id);
			let alreadyunLike = post.unlikeBy.filter(user => user === req.user.user.id);

			if (alreadyLike.length === 0 && alreadyunLike.length === 0) {
				await Like.findOneAndUpdate(post._id, {
					$inc: { unlikes: 1 },
					$push: { unlikeBy: req.user.user.id }
				});
				return res.status(200).send(`User ${req.user.user.id} unliked the post ${id}`);
			} else if (alreadyLike.length != 0) {
				await Like.findOneAndUpdate(post._id, {
					$inc: { likes: -1, unlikes: 1 },
					$push: { unlikeBy: req.user.user.id },
					$pull: { likeBy: req.user.user.id }
				});
				return res.status(200).send(`User ${req.user.user.id} unliked the post ${id}`);
			} else if (alreadyunLike.length != 0) {
				return res.status(200).send('User can unlike the post only once');
			}
		} else {
			return res.status(400).json({
				message: 'Post does not exists'
			});
		}
	} catch (e) {
		return res.status(500).json({
			message: 'Server Error'
		});
	}
});

router.post('/comment/:id', auth, async (req, res) => {
	try {
		let id = req.params.id;
		let post = await Post.findById(id);

		if (post) {
			const { comment } = req.body;

			console.log(comment);
			let comm = new Comment({
				comment: comment,
				postId: id,
				commentBy: req.user.user.id
			});

			await comm.save();
			return res.status(200).send(`Comment Id ${comm._id}`);
		} else {
			return res.status(400).json({
				message: 'Post does not exists'
			});
		}
	} catch (e) {
		return res.status(500).json({
			message: e.message
		});
	}
});

router.get('/posts/:id', auth, async (req, res) => {
	try {
		let id = req.params.id;
		let post = await Post.findById(id);

		if (post) {
			const likes = await Like.findOne({
				postId: id
			});
			const comments = await Comment.find({
				postId: id
			});

			return res.status(200).json({
				likes: likes.likes,
				comments: comments.length
			});
		} else {
			return res.status(400).json({
				message: 'Post does not exists'
			});
		}
	} catch (e) {
		return res.status(500).json({
			message: 'Server Error'
		});
	}
});

router.post('/all_posts', auth, async (req, res) => {
	try {
		let post = await Post.find({
			createdBy: req.user.user.id
		});
		let posts_arr = [];
		if (post) {
			for (let i = 0; i < post.length; i++) {
				const likes = await Like.find({
					postId: post[i]._id
				});
				const comments = await Comment.find({
					postId: post[i]._id
				});
				let onlyComments = [];

				comments.forEach(c => {
					onlyComments.push(c.comment);
				});
				posts_arr.push({
					id: post[i]._id,
					title: post[i].title,
					description: post[i].description,
					created_at: post[i].createdTime,
					likes: likes.length,
					comments: onlyComments
				});
			}

			return res.status(200).json(posts_arr);
		} else {
			return res.status(400).json({
				message: 'Post does not exists'
			});
		}
	} catch (e) {
		return res.status(500).json({
			message: 'Server Error'
		});
	}
});

module.exports = router;
