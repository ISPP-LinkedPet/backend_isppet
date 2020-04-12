const request = require('supertest');
const assert = require('chai').assert;
const app = require('../index.js').app;
const fs = require('fs');
const path = require('path');
const r = request(app);

const photos = [];

describe('pet', function(done) {
  describe('GET', function() {
    it('Should return the pets in revision', async function() {
      const login = {
        userName: 'rosaModerator',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.get('/pet/revision')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.length, 1); // solo hay una en revisión
    });

    it('Should return the pet by the given id', async function() {
      const login = {
        userName: 'rosaModerator',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.get('/pet/1')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.name, 'Roudi');
    });

    it('Should return the pets by the given particular', async function() {
      const login = {
        userName: 'arcaShelter',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.get('/pet/user/1')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.length, 4);
    });
  });

  describe('POST', function() {
    it('Pets require two animal_photos', async function() {
      const login = {
        userName: 'palinaParticular',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const petData = {
        name: 'Prueba',
      };

      const response = await r.post('/pet/')
          .set('Authorization', token)
          .field(petData)
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .attach('identification_photo', 'public/images/ads/laHuella.png')
          .attach('vaccine_passport', 'public/images/ads/laHuella.png');
      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'It is required to upload at least two photos of the animal');
    });

    it('Should create a pet', async function() {
      const login = {
        userName: 'palinaParticular',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const petData = {
        name: 'Prueba',
      };

      const response = await r.post('/pet/')
          .set('Authorization', token)
          .field(petData)
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .attach('identification_photo', 'public/images/ads/laHuella.png')
          .attach('vaccine_passport', 'public/images/ads/laHuella.png');
      assert.equal(response.status, 200);
      assert.equal(response.body.name, 'Prueba');
      photos.push(...response.body.animal_photo.split(','));
      photos.push(response.body.identification_photo);
      photos.push(response.body.vaccine_passport);
    });
  });

  describe('PUT', function() {
    it('Should edit a pet', async function() {
      const login = {
        userName: 'palinaParticular',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const petData = {
        name: 'Antonio',
      };

      const response = await r.put('/pet/edit/5')
          .set('Authorization', token)
          .field(petData)
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .attach('animal_photo', 'public/images/animal_photos/doberman.jpg')
          .attach('identification_photo', 'public/images/ads/laHuella.png')
          .attach('vaccine_passport', 'public/images/ads/laHuella.png');
      assert.equal(response.status, 200);
      assert.equal(response.body.name, 'Antonio');
      photos.push(...response.body.animal_photo.split(','));
      photos.push(response.body.identification_photo);
      photos.push(response.body.vaccine_passport);
    });

    it('Should accept a pet', async function() {
      const login = {
        userName: 'rosaModerator',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const petData = {
        genre: 'male',
        type: 'Dog',
        birth_date: '2020-01-01',
        pedigree: 1,
        breed: 'Doberman',
      };

      const response = await r.put('/pet/accept/5')
          .set('Authorization', token)
          .field(petData);
      assert.equal(response.status, 200);
      assert.equal(response.body.pet_status, 'Accepted');
    });

    it('Should reject a pet', async function() {
      const login = {
        userName: 'rosaModerator',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.put('/pet/reject/6')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body.pet_status, 'Rejected');
    });
  });

  describe('DELETE', function() {
    it('Should delete a pet', async function() {
      const login = {
        userName: 'palinaParticular',
        password: 'hola',
      };

      const loginResponse = await r.post('/auth/login')
          .send(login);
      assert.equal(loginResponse.status, 200);
      const token = loginResponse.body.access_token;

      const response = await r.delete('/pet/delete/6')
          .set('Authorization', token);
      assert.equal(response.status, 200);
      assert.equal(response.body, true);
    });
  });
});

after(function(done) {
  photos.forEach((photo) => {
    fs.unlink(path.join('public', photo), (err) => {
      // nothing to do
    });
  });
  done();
});

