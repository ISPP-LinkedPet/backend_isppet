const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const r = request(app);
const path = require('path');
const fs = require('fs');

let loginToken = '';
let ad1 = '';
const allPhotos = [];

before(function(done) {
  const login = {
    userName: 'danielAdministrator',
    password: 'hola',
  };

  r.post('/auth/login')
      .send(login)
      .end(function(err, res) {
        loginToken = res.body.access_token;
        done();
      });
});

describe('administrator', function(done) {
  describe('GET', function(done) {
    it('Should return json as the default data format, showing the banned users', function(done) {
      r.get('/administrator/ban/list')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body[0].user_name, 'doggyShelter');
            done();
          });
    });

    it('Should return json as the default data format, showing the active users', function(done) {
      r.get('/administrator/unban/list')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body[0].user_name, 'refugioShelter');
            done();
          });
    });

    it('Should show the statistics', function(done) {
      r.get('/administrator/statistics')
          .set('Authorization', loginToken)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body[0].breedings_count, 32);
            done();
          });
    });
  });

  describe('POST', function(done) {
    it('Should return 200 status code and ad along with data', function(done) {
      const ad = {ad_type: 'CPM',
        price: 100,
        redirect_to: 'http://www.google.com',
        vet_id: 1,
        active: 1,
      };

      r.post('/administrator/ad/create')
          .field(ad)
          .attach('top_banner', 'public/images/ads/laHuella.png')
          .attach('lateral_banner', 'public/images/ads/laHuella.png')
          .set('Authorization', loginToken)
          .end(function(err, res) {
            ad1 = res.body.ad;
            assert.equal(ad.price, 100);
            done();
          });
    });
  });
});

after(function(done) {
  String(ad1.top_banner).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  String(ad1.lateral_banner).split(',').forEach((photo) => {
    allPhotos.push(photo);
  });

  allPhotos.forEach((photo) => {
    fs.unlink(path.join('public', photo), (err) => {
      // nothing to do
    });
  });

  done();
});
