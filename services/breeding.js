const path = require('path');

const BREEDING_FIELDS = ['breeding.id',
  'publication_id',
  'particular_id',
  'creation_date',
  'animal_photo',
  'identification_photo',
  'document_status',
  'age',
  'genre',
  'breed',
  'transaction_status',
  'title',
  'price',
  'vaccine_passport'];

const ANIMAL_FOLDER = path.join('images', 'animal_photos');
const IDENTIFICATION_FOLDER = path.join('images', 'identification_photos');
const VACCINES_FOLDER = path.join('images', 'vaccines_passports');

const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

exports.getBreeding = async (connection, breedingId) => {
  const breeding = await connection('breeding')
      .select(BREEDING_FIELDS)
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where('breeding.id', breedingId)
      .first();

  if (!breeding) {
    const error = new Error();
    error.status = 400;
    error.message = 'No breeding with that ID';
    throw error;
  }

  return breeding;
};

exports.createBreeding = async (breedingData, breedingPhotos, particularId, trx) => {
  const animalPhotoName = path.join(ANIMAL_FOLDER, `${particularId}-${new Date().getTime()}.${getExtension(breedingPhotos.animal_photo.name)}`);
  const identificationPhotoName = path.join(IDENTIFICATION_FOLDER, `${particularId}-${new Date().getTime()}.${getExtension(breedingPhotos.identification_photo.name)}`);
  const vaccinePassportName = path.join(VACCINES_FOLDER, `${particularId}-${new Date().getTime()}.${getExtension(breedingPhotos.vaccine_passport.name)}`);

  savePhoto(breedingPhotos.animal_photo, animalPhotoName);
  savePhoto(breedingPhotos.identification_photo, identificationPhotoName);
  savePhoto(breedingPhotos.vaccine_passport, vaccinePassportName);

  // Genre, age and breed not required during creation
  const pubData = {
    animal_photo: animalPhotoName,
    identification_photo: identificationPhotoName,
    document_status: 'In revision',
    // age: breedingData.age,
    // genre: breedingData.genre,
    // breed: breedingData.breed,
    transaction_status: 'In progress',
    title: breedingData.title,
    particular_id: particularId,
    vaccine_passport: vaccinePassportName,
  };

  const publicationId = await trx('publication').insert(pubData);
  const breedingId = await trx('breeding').insert({
    publication_id: publicationId,
    price: breedingData.price,
  });

  return await trx('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .select(BREEDING_FIELDS)
      .where({'breeding.id': breedingId})
      .first();
};

exports.getMyFavoriteBreedings = async (connection, userId) => {
  const user = await connection('particular').select('id').where({user_account_id: userId}).first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const breedings = await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('request', 'request.particular_id', '=', 'particular.id')
      .where({'particular.id': user.id})
      .andWhere({'request.is_favorite': true});

  return breedings;
};

exports.imInterested = async (userId, breedingId, trx) => {
  // Se comprueba que no se hace
  const pub = await trx('publication')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where({'breeding.id': breedingId})
      .first();

  if (pub.particular_id === userId) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not make your own publications favorite';
    throw error;
  }

  // Se comprueba que esta publicacion no este en los favoritos del particular
  const rqt = await trx('request')
      .where({publication_id: pub.publication_id})
      .andWhere({particular_id: userId})
      .first();

  if (rqt && rqt.is_favorite) {
    const error = new Error();
    error.status = 404;
    error.message = 'Already favorite';
    throw error;
  }

  const wrongPub = await trx('publication')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where({'publication.document_status': 'Accepted'})
      .andWhere({'publication.transaction_status': 'In progress'})
      .andWhere({'breeding.id': breedingId});

  if (wrongPub.length == 0) {
    const error = new Error();
    error.status = 404;
    error.message = 'The publication documents or status are wrong';
    throw error;
  }

  if (rqt) {
    await trx('request')
        .where({id: rqt.id})
        .update({
          is_favorite: true,
        });

    return await trx('request')
        .where({id: rqt.id}).first();
  } else {
    const rqtData = {
      status: 'Favorite',
      is_favorite: true,
      publication_id: pub.publication_id,
      particular_id: userId,
    };

    const requestId = await trx('request').insert(rqtData);
    return await trx('request')
        .where({id: requestId}).first();
  }

  // Comprobar que la request no sea del propia usuario y que sea visible para todo el mundo
};

const savePhoto = async (photo, photoRoute) => {
  await photo.mv(path.join('public', photoRoute));
};

const getExtension = (photo) => {
  const extension = photo.split('.').pop();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    const error = new Error();
    error.status = 404;
    error.message = 'No valid extension';
    throw error;
  }
  return photo.split('.').pop();
};


