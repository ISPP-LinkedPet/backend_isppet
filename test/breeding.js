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

describe('breedings', function(done) {
  describe('GET', function(done) {
    it('Should return json as default data format', function(done) {
      r.get('/breeding/offers')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body[0].codenumber, 'ddcd1234');
            done();
          });
    });
  });

  describe('POST', function(done) {
    it('Should return 200 status code and breeding along with data', function(done) {
      const breeding = {location: 'Avda. Reina Mercedes',
        price: 100,
      };

      r.post('/breeding')
          .field(breeding)
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .attach('animal_photo', 'public/images/animal_photos/doberman2.jpg')
          .attach('identification_photo', 'public/images/ads/laHuella.png')
          .attach('vaccine_passport', 'public/images/ads/laHuella.png')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            pub1 = res.body;
            assert.equal(pub1.price, 100);
            done();
          });
    });
  });

  describe('PUT', function(done) {
    it('Should return 200 status code and breeding along with the update', function(done) {
      const breeding = {location: 'Avda. Reina Mercedes',
        price: 100,
      };

      r.put('/breeding/edit/25')
          .field(breeding)
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .attach('animal_photo', 'public/images/animal_photos/doberman2.jpg')
          .attach('identification_photo', 'public/images/ads/laHuella.png')
          .attach('vaccine_passport', 'public/images/ads/laHuella.png')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            pub2 = res.body;
            assert.equal(pub2.price, 100);
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
