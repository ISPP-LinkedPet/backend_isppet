const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const r = request(app);

describe('user', function(done) {
  describe('GET', function() {
    it('Should return the logged user', async function() {
      const login = {
        userName: 'palinaParticular',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.get('/user/')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.name, 'Palina');
    });
  });
});
