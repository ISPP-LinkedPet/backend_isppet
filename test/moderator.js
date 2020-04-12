const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const r = request(app);
const path = require('path');
const fs = require('fs');

let loginToken = '';

before(function(done) {
  const login = {
    userName: 'rosaModerator',
    password: 'hola',
  };

  r.post('/auth/login')
      .send(login)
      .end(function(err, res) {
        loginToken = res.body.access_token;
        done();
      });
});

describe('moderator', function(done) {
  describe('PUT', function(done) {
    it('Should accept a breeding', function(done) {
      const breeding = {birth_date: '2020-01-01',
        genre: 'Male',
        breed: 'Doberman',
        type: 'Dog',
        pedigree: 1,
      };

      r.put('/breeding/accept/22')
          .field(breeding)
          .set('Authorization', loginToken)
          .end(function(err, res) {
            assert.equal(res.body.breed, 'Doberman');
            assert.equal(res.body.id, 22);
            done();
          });
    });

    it('Should reject a breeding', function(done) {
      r.put('/breeding/reject/23')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            assert.equal(res.body.id, 23);
            assert.equal(res.body.document_status, 'Rejected');
            done();
          });
    });
  });
});
