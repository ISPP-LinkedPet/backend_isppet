const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const r = request(app);
const path = require('path');
const fs = require('fs');

let loginToken = '';
let pub1 = '';
let pub2 = '';
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

describe('adoptions', function(done) {
  describe('GET', function(done) {
    it('Should return json as default data format', function(done) {
      r.get('/adoption/available')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body[0].name, 'Kiwi');
            done();
          });
    });
  });

  describe('POST', function(done) {
    it('Should return 200 status code and adoption along with data', function(done) {
      const adoption = {type: 'Dog',
        location: 'Avda. Reina Mercedes',
        pedigree: 1,
        birth_date: '2020-01-01',
        genre: 'Male',
        breed: 'Doberman',
        name: 'Paco',
      };

      r.post('/adoption')
          .field(adoption)
          .attach('animal_photo', 'public/images/animal_photos/doberman2.jpg')
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            pub1 = res.body.adoption;
            assert.equal(pub1.name, 'Paco');
            done();
          });
    });
  });

  describe('PUT', function(done) {
    it('Should return 200 status code and adoption along with the update', function(done) {
      const adoption = {type: 'Dog',
        location: 'Avda. Reina Mercedes',
        pedigree: 1,
        birth_date: '2020-01-01',
        genre: 'Male',
        breed: 'Doberman',
        name: 'Paco',
      };

      r.put('/adoption/edit/13')
          .field(adoption)
          .attach('animal_photo', 'public/images/animal_photos/doberman2.jpg')
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            pub2 = res.body.adoption;
            assert.equal(pub2.name, 'Paco');
            done();
          });
    });
  });
});

after(function(done) {
  String(pub1.animal_photo).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  String(pub1.identification_photo).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  String(pub1.vaccine_passport).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  String(pub2.animal_photo).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  String(pub2.identification_photo).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  String(pub2.vaccine_passport).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  allPhotos.forEach((photo) => {
    fs.unlink(path.join('public', photo), (err) => {
      // nothing to do
    });
  });

  done();
});
