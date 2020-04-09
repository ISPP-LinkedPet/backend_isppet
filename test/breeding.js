'use strict';

const request = require('supertest');

const r = request('http://localhost:8080');

before(function() {
  const login = {
    userName: 'palinaParticular',
    password: 'hola',
  };

  r.post('/auth/login')
      .send(login)
      .expect(200);
});

describe('breedings', function() {
  describe('GET', function() {
    it('Should return json as default data format', function(done) {
      r.get('/breeding/offers')
          .expect('Content-Type', /json/)
          .expect(200, done());
    });
  });

  describe('POST', function() {
    it('Should return 200 status code and breeding along with data', function(done) {
      const breeding = {animal_photo: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        identification_photo: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        vaccine_passport: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        location: 'Avda. Reina Mercedes',
        price: 100,
      };

      r.post('/breeding/')
          .send(breeding)
          .expect(200)
          .expect('breeding.location', 'Avda. Reina Mercedes', done());
    });
  });

  describe('PUT', function() {
    it('Should return 200 status code and breeding along with the update', function(done) {
      const breeding = {animal_photo: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        identification_photo: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        vaccine_passport: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        location: 'Avda. Reina Mercedes',
        price: 100,
      };

      r.put('/breeding/edit/1')
          .send(breeding)
          .expect(200)
          .expect('breeding.location', 'Avda. Reina Mercedes', done());
    });
  });
});
