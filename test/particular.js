const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const r = request(app);

let loginToken = '';

before(function(done) {
  const login = {
    userName: 'lucianaParticular',
    password: 'hola',
  };

  r.post('/auth/login')
      .send(login)
      .end(function(err, res) {
        loginToken = res.body.access_token;
        done();
      });
});

describe('particular', function(done) {
  describe('GET', function() {
    it('Should return the data of the logged particular', async function() {
      const response = await r.get('/particular/myData')
          .set('Authorization', loginToken);
      assert.equal(response.status, 200);
      assert.equal(response.headers['content-type'], 'application/pdf');
    });

    it('Should return a particular by the given ID', async function() {
      const response = await r.get('/particular/1')
          .set('Authorization', loginToken);
      assert.equal(response.status, 200);
      assert.equal(response.body.particular.id, 1);
      assert.equal(response.body.particular.name, 'Palina');
    });

    it('Should return true if the logged particular has any request from the given particular', async function() {
      const response = await r.get('/particular/hasRequest/1')
          .set('Authorization', loginToken);
      assert.equal(response.status, 200);
      assert.equal(response.body.hasRequestFrom, false);
    });

    it('Should return the profile of the logged particular', async function() {
      const response = await r.get('/particular/user/profile')
          .set('Authorization', loginToken);
      assert.equal(response.status, 200);
      assert.equal(response.body.particular.surname, 'Luciana');
    });
  });

  describe('DELETE', function() {
    it('Should delete the logged user', async function() {
      const response = await r.delete('/particular/delete/user')
          .set('Authorization', loginToken);
      assert.equal(response.status, 200);
      assert.equal(response.body.particular, true);
    });
  });
});
