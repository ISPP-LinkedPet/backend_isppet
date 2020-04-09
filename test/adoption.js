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

describe('adoptions', function() {
  describe('GET', function() {
    it('Should return json as default data format', function(done) {
      r.get('/adoption/available')
          .expect('Content-Type', /json/)
          .expect(200, done());
    });
  });

  describe('POST', function() {
    it('Should return 200 status code and adoption along with data', function(done) {
      const adoption = {animal_photo: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        type: 'Dog',
        location: 'Avda. Reina Mercedes',
        pedigree: true,
        birth_date: '2020-01-01',
        genre: 'Male',
        breed: 'Doberman',
        name: 'Paco',
      };

      r.post('/adoption/')
          .send(adoption)
          .expect(200)
          .expect('adoption.name', 'Paco', done());
    });
  });

  describe('PUT', function() {
    it('Should return 200 status code and adoption along with the update', function(done) {
      const adoption = {animal_photo: 'http://ecx.images-amazon.com/images/I/91DpCeCgSBL._SL1500_.jpg',
        type: 'Dog',
        location: 'Avda. Reina Mercedes',
        pedigree: true,
        birth_date: '2020-01-01',
        genre: 'Male',
        breed: 'Doberman',
        name: 'Paco',
      };

      r.put('/adoption/edit/13')
          .send(adoption)
          .expect(200)
          .expect('adoption.name', 'Paco', done());
    });
  });
});
