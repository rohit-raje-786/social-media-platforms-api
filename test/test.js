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
						done();
					});
				done();
			});
	});
});
