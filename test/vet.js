const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const fs = require('fs');
const path = require('path');
const r = request(app);

describe('vet', function(done) {
  describe('GET', function() {
    it('Should return all the vets', async function() {
      this.timeout(10000);
      const login = {
        userName: 'palinaParticular',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.get('/vet/')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.length, 18); // hay 18 veterinarios
    });
  });

  describe('PUT', function() {
    it('Should set the vet to premium', async function() {
      const login = {
        userName: 'danielAdministrator',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.put('/vet/premiumTrue/2')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.is_premium, 1);
    });

    it('Should set the vet to non premium', async function() {
      const login = {
        userName: 'danielAdministrator',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.put('/vet/premiumFalse/2')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.is_premium, 0);
    });
  });
});
