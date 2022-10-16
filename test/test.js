const chai = require('chai');
const expect = chai.expect;
const should = require('should');
const request = require('supertest');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('POST /add post', function () {
	it('To check if the post is getting created by providing all the required parameters with correct format', function (done) {
		// Use supertest to run assertions for our API

		request('http://localhost:4000')
			.post('/api/authenticate')
			.send({
				email: 'rp589006@gmail.com',
				password: '123456'
			})
			.expect(200)
			.end((err, res) => {
				if (err) {
					console.log(err);
					return;
				}
				request('http://localhost:4000')
					.post('/api/posts')
					.send({
						token: res.body.token,
						title: ' Peaky Blinders',
						description: 'Tommy Shelby'
					})
					.expect(201)
					.end((err, res) => {
						if (err) console.log(err);
						res.status.should.equal(201);
						res.body.should.have.property('title');
						res.body.should.have.property('description');
						res.body.should.have.property('_id');
						res.body.should.have.property('createdTime');
						done();
					});
				done();
			});
	});
});

describe('POST /follow user', function () {
	it('To check wether the user does not follow himself and only once user can follow the another person', function (done) {
		// Use supertest to run assertions for our API

		request('http://localhost:4000')
			.post('/api/authenticate')
			.send({
				email: 'rp589006@gmail.com',
				password: '123456'
			})
			.expect(200)
			.end((err, res) => {
				if (err) {
					console.log(err);
				}
				const userId = '63497cc11901e15cfad2f565'; //if user follow himseld
				const anotherUserId = '6349989e1901e15cfad2f566'; //if user follow another user
				request('http://localhost:4000')
					.post(`/api/follow/${userId}`)
					.send({
						token: res.body.token
					})
					.expect(500)
					.end((err, res) => {
						if (err) console.log(err);
						res.status.should.equal(500);
						res.body.should.have.property('message', 'User cannot follow himself');
						done();
					});
			});
	});
});

describe('POST /unfollow user', function () {
	it('To check wether the user does not unfollow himself and User must follow the another user to unfollow', function (done) {
		// Use supertest to run assertions for our API

		request('http://localhost:4000')
			.post('/api/authenticate')
			.send({
				email: 'rp589006@gmail.com',
				password: '123456'
			})
			.expect(200)
			.end((err, res) => {
				if (err) {
					console.log(err);
				}
				const userId = '63497cc11901e15cfad2f565'; //if user unfollow himseld
				const anotherUserId = '6349989e1901e15cfad2f566'; //if user unfollow another user
				request('http://localhost:4000')
					.post(`/api/unfollow/${userId}`)
					.send({
						token: res.body.token
					})
					.expect(400)
					.end((err, res) => {
						if (err) console.log(err);
						res.status.should.equal(400);
						res.body.should.have.property('message', 'User cannot unfollow himself');
						done();
					});
			});
	});
});
