const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const r = request(app);
const path = require('path');
const fs = require('fs');

let loginToken = '';
const pub1 = '';
const pub2 = '';
const allPhotos = [];

before(function(done) {
  const login = {
    userName: 'palinaParticular',
    password: 'hola',
  };

  r.post('/auth/login')
      .send(login)
      .end(function(err, res) {
        loginToken = res.body.access_token;
        done();
      });
});

describe('request', function(done) {
  describe('GET', function(done) {
    it('Return true if the publication has requests', function(done) {
      r.get('/request/hasRequest/1')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.hasRequest, false);
            done();
          });
    });

    it('Return the requests of the breeding', function(done) {
      r.get('/request/breeding/1')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.requests[0].id, 34);
            assert.equal(res.body.requests[0].particular_id, 15);
            done();
          });
    });

    it('Return the requests of the adoption', function(done) {
      r.get('/request/adoption/13')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.requests[0].id, 38);
            assert.equal(res.body.requests[0].particular_id, 15);
            done();
          });
    });
  });

  describe('PUT', function(done) {
    it('Reject a request to one of my publications', function(done) {
      r.put('/request/44/reject')
          .set('Authorization', loginToken)
          .expect(200, done);
    });

    it('Accept a request to one of my publications', async function() {
      const login = {
        userName: 'pabloParticular',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const res = await r.put('/request/46/accept/4')
          .set('Authorization', token);
      assert.equal(res.status, 200);
    });
  });
});

