'use strict';

const request = require('supertest');

const r = request('http://localhost:8080');

before(function() {
  const login = {
    userName: 'danielAdministrator',
    password: 'hola',
  };

  r.post('/auth/login')
      .send(login)
      .expect(200);
});

describe('administrator', function() {
  describe('GET', function() {
    it('Should return json as the default data format, showing the banned users', function(done) {
      r.get('/ban/list')
          .expect('Content-Type', /json/)
          .expect(200, done());
    });
  });
});
