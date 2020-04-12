const request = require('supertest');
const assert = require('chai').assert;
const expect = require('chai').expect;
const app = require('../index.js').app;
const r = request(app);

let loginToken = '';

before(function(done) {
  const login = {
    userName: 'danielAdministrator',
    password: 'hola',
  };

  r.post('/auth/login')
      .send(login)
      .end(function(err, res) {
        loginToken = res.body.access_token;
        done();
      });
});

describe('ad', function(done) {
  describe('GET', function(done) {
    it('Should return 3 ads', function(done) {
      r.get('/ad')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.ads.length, 3);
            done();
          });
    });

    it('Should return 2 ads', function(done) {
      r.get('/ad/2')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.ads.length, 2);
            done();
          });
    });
  });

  describe('POST', function() {
    it('Should add a new click to the ad', async function() {
      const response = await r.post('/ad/addClick/1')
          .set('Authorization', loginToken);
      expect(response.status).to.be.equal(200);
      expect(response.body.message).to.be.equal('Click added');
    });
  });
});
