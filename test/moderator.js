const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const r = request(app);

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

    it('Should accept a adoption', function(done) {
      r.put('/adoption/accept/1')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            assert.equal(res.body.document_status, 'Accepted');
            assert.equal(res.body.id, 1);
            done();
          });
    });

    it('Should reject a adoption', function(done) {
      r.put('/adoption/reject/14')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            assert.equal(res.body.document_status, 'Rejected');
            assert.equal(res.body.id, 14);
            done();
          });
    });
  });
});
