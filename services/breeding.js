const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const BREEDING_FIELDS = [
  'breeding.id AS breedingId',
  'publication.id AS publicationId',
  'breeding.publication_id',
  'publication.particular_id',
  'publication.creation_date',
  'publication.animal_photo',
  'publication.identification_photo',
  'publication.document_status',
  'publication.birth_date',
  'publication.genre',
  'publication.breed',
  'publication.transaction_status',
  'breeding.price',
  'breeding.codenumber',
  'publication.location',
  'publication.pedigree',
  'publication.type',
  'publication.vaccine_passport',
  'breeding.pet_id',
];

const ANIMAL_FOLDER = path.join('images', 'animal_photos');
const IDENTIFICATION_FOLDER = path.join('images', 'identification_photos');
const VACCINES_FOLDER = path.join('images', 'vaccine_passports');

const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

const utilService = require('../services/util');
const dirAnimal = './public/images/animal_photos';
const dirIdentification = './public/images/identification_photos';
const dirVaccine = './public/images/vaccine_passports';

exports.getBreeding = async (connection, breedingId) => {
  const breeding = await connection('breeding')
      .select(BREEDING_FIELDS)
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where('breeding.id', breedingId)
      .first();

  if (!breeding) {
    const error = new Error();
    error.status = 400;
    error.message = 'No existe crianza con esa id';
    throw error;
  }

  return breeding;
};

exports.createBreeding = async (breedingData, breedingPhotos, userId, trx) => {
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

  const allPhotos = [];
  const codenumberBreeding = numbergenerator();
  try {
    // Mínimo 2 fotos del animal
    const savedAnimalPhotos = [];
    if (
      breedingPhotos.animal_photo &&
      breedingPhotos.animal_photo.length >= 2
    ) {
      breedingPhotos.animal_photo.forEach((photo) => {
        const photoName = path.join(
            ANIMAL_FOLDER,
            `${uuidv4()}.${getExtension(photo.name)}`,
        );
        savePhoto(photo, photoName);
        savedAnimalPhotos.push(photoName);
      });
    } else {
      const error = new Error();
      error.status = 400;
      error.message =
        'Es necesario subir al menos dos fotos del animal';
      throw error;
    }

    allPhotos.push(...savedAnimalPhotos);

    // Mínimo una foto identificativa
    const savedIdentificationPhotos = [];
    if (breedingPhotos.identification_photo) {
      if (Array.isArray(breedingPhotos.identification_photo)) {
        breedingPhotos.identification_photo.forEach((photo) => {
          const photoName = path.join(
              IDENTIFICATION_FOLDER,
              `${uuidv4()}.${getExtension(photo.name)}`,
          );
          savePhoto(photo, photoName);
          savedIdentificationPhotos.push(photoName);
        });
      } else {
        const photoName = path.join(
            IDENTIFICATION_FOLDER,
            `${uuidv4()}.${getExtension(
                breedingPhotos.identification_photo.name,
            )}`,
        );
        savePhoto(breedingPhotos.identification_photo, photoName);
        savedIdentificationPhotos.push(photoName);
      }
    } else {
      const error = new Error();
      error.status = 400;
      error.message =
        'Es necesario subir al menos una foto identificativa del animal';
      throw error;
    }

    allPhotos.push(...savedIdentificationPhotos);

    // Mínimo una foto de las vacunas
    const savedVaccinePhotos = [];
    if (breedingPhotos.vaccine_passport) {
      if (Array.isArray(breedingPhotos.vaccine_passport)) {
        breedingPhotos.vaccine_passport.forEach((photo) => {
          const photoName = path.join(
              VACCINES_FOLDER,
              `${uuidv4()}.${getExtension(photo.name)}`,
          );
          savePhoto(photo, photoName);
          savedVaccinePhotos.push(photoName);
        });
      } else {
        const photoName = path.join(
            VACCINES_FOLDER,
            `${uuidv4()}.${getExtension(breedingPhotos.vaccine_passport.name)}`,
        );
        savePhoto(breedingPhotos.vaccine_passport, photoName);
        savedVaccinePhotos.push(photoName);
      }
    } else {
      const error = new Error();
      error.status = 400;
      error.message =
        'Es necesario subir al menos una foto del pasaporte de las vacunas';
      throw error;
    }

    allPhotos.push(...savedVaccinePhotos);

    // Get particular by user account id
    const particular = await trx('particular')
        .select('id')
        .where('user_account_id', userId)
        .first();

    // Some values are not required during creation
    // Moderators will modify the breeding publication
    const pubData = {
      animal_photo: savedAnimalPhotos.join(','),
      identification_photo: savedIdentificationPhotos.join(','),
      vaccine_passport: savedVaccinePhotos.join(','),
      document_status: 'In revision',
      birth_date: null,
      genre: null,
      breed: null,
      location: breedingData.location,
      type: null,
      pedigree: null,
      transaction_status: 'Offered',
      particular_id: particular.id,
    };

    const publicationId = await trx('publication').insert(pubData);
    const breedingId = await trx('breeding').insert({
      publication_id: publicationId,
      price: breedingData.price,
      codenumber: codenumberBreeding,
      pet_id: null,
    });

    return await trx('breeding')
        .join('publication', 'breeding.publication_id', '=', 'publication.id')
        .select(BREEDING_FIELDS)
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    // Borramos las fotos guardadas en caso de error
    allPhotos.forEach((photo) => {
      fs.unlink(path.join('public', photo), (err) => {
        // nothing to do
      });
    });
    throw error;
  }
};

exports.getMyInterestedBreedings = async (connection, userId) => {
  const particular = await connection('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  const breedings = await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('request', 'request.particular_id', '=', 'particular.id')
      .where('particular.id', particular.id)
      .andWhere('request.status', 'Pending');

  return breedings;
};

exports.getBreedingsOffers = async (breedingParams, connection, userId) => {
  const particular = await connection('user_account')
      .select('particular.id')
      .join('particular', 'particular.user_account_id', '=', 'user_account.id')
      .where('user_account.id', userId)
      .andWhere('user_account.role', 'particular')
      .first();

  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Usuario no encontrado';
    throw error;
  }

  const price = breedingParams.price;
  const type = breedingParams.type;
  const pedigree = breedingParams.pedigree;
  const breed = breedingParams.breed;
  const genre = breedingParams.genre;

  const breedings = await connection('breeding')
      .select('*', 'breeding.id as breeding_id')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where('publication.document_status', 'Accepted')
      .andWhere('publication.transaction_status', 'Offered')
      .andWhereNot('publication.particular_id', particular.id)
      .modify(function(queryBuilder) {
        if (price) {
          queryBuilder.andWhere('breeding.price', '<=', parseFloat(price));
        }
        if (type) {
          queryBuilder.andWhere('publication.type', 'like', `%${type}%`);
        }
        if (pedigree) {
          if (pedigree == 'true') {
            queryBuilder.andWhere('publication.pedigree', 'like', 1);
          } else {
            queryBuilder.andWhere('publication.pedigree', 'like', 0);
          }
        }
        if (breed) {
          queryBuilder.andWhere('publication.breed', 'like', `%${breed}%`);
        }
        if (genre) {
          queryBuilder.andWhere('publication.genre', 'like', `%${genre}%`);
        }
      });

  return breedings;
};

exports.getPendingBreedings = async (connection, userId) => {
  const user = await connection('moderator')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Usuario no encontrado';
    throw error;
  }

  const breedings = await connection('breeding')
      .select('*', 'breeding.id AS breedingId')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where('publication.document_status', 'In revision');
  return breedings;
};

exports.imInterested = async (userId, breedingId, trx) => {
  // se obtine el id del particular
  const particularId = await trx('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!particularId) {
    const error = new Error();
    error.status = 404;
    error.message = 'Usuario no encontrado';
    throw error;
  }
  // Se comprueba que no se intenta estar interesado en una publication propia
  const pub = await trx('publication')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where('breeding.id', breedingId)
      .first();

  if (pub == undefined || pub.particular_id === particularId.id) {
    const error = new Error();
    error.status = 404;
    error.message = 'Usted no puede estar interesado en una publicación propia.';
    throw error;
  }

  // Se comprueba que esta publicacion no este con una request pendiente del usuario actual
  const rqt = await trx('request')
      .where({publication_id: pub.publication_id})
      .andWhere({particular_id: particularId.id})
      .first();

  if (rqt && rqt.status === 'Pending') {
    const error = new Error();
    error.status = 404;
    error.message = 'Ya está interesado o ha concluido.';
    throw error;
  }

  // Se comprueba que esta publicacion tenga los documentos verificados y todavia este en progreso
  const wrongPub = await trx('publication')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where({'publication.document_status': 'Accepted'})
      .andWhere({'publication.transaction_status': 'Offered'})
      .andWhere({'breeding.id': breedingId});

  if (!wrongPub.length) {
    const error = new Error();
    error.status = 404;
    error.message = 'Los documentos o estado de la publicación están mal.';
    throw error;
  }

  if (rqt != undefined) {
    await trx('request')
        .where({id: rqt.id})
        .update({
          status: 'Pending',
        });
    return await trx('request')
        .where({id: rqt.id})
        .first();
  } else {
    const rqtData = {
      status: 'Pending',
      publication_id: pub.publication_id,
      particular_id: particularId.id,
    };
    const requestId = await trx('request').insert(rqtData);
    return await trx('request')
        .where({id: requestId})
        .first();
  }

  // Comprobar que la request no sea del propia usuario y que sea visible para todo el mundo
};

exports.editBreeding = async (
  breedingData,
  breedingPhotos,
  breedingId,
  userId,
  trx,
) => {
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

  // Se comprueba que este editando un breeding propio y en revision
  const pub = await trx('publication')
      .select('*', 'user_account.id AS userId')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('breeding.id', breedingId)
      .first();

  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Crianza no encontrada';
    throw error;
  }

  if (pub.userId !== userId) {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación que no es tuya.';
    throw error;
  }

  if (pub.document_status === 'Rejected') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación cuyo estado de los documentos es rechazada.';
    throw error;
  }

  if (pub.transaction_status !== 'Offered') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación cuyo estado de publicación no sea ofrecida.';
    throw error;
  }

  const allPhotos = [];
  const savedAnimalPhotos = [];
  const savedIdentificationPhotos = [];
  const savedVaccinePhotos = [];

  try {
    if (breedingPhotos.animal_photo) {
      // Mínimo 2 fotos del animal

      if (
        breedingPhotos.animal_photo &&
        breedingPhotos.animal_photo.length >= 2
      ) {
        breedingPhotos.animal_photo.forEach((photo) => {
          const photoName = path.join(
              ANIMAL_FOLDER,
              `${uuidv4()}.${getExtension(photo.name)}`,
          );
          savePhoto(photo, photoName);
          savedAnimalPhotos.push(photoName);
        });
      } else {
        const error = new Error();
        error.status = 400;
        error.message =
          'Es necesario subir al menos dos fotos del animal';
        throw error;
      }
      allPhotos.push(...savedAnimalPhotos);
    }

    if (breedingPhotos.identification_photo) {
      // Mínimo una foto identificativa

      if (breedingPhotos.identification_photo) {
        if (Array.isArray(breedingPhotos.identification_photo)) {
          breedingPhotos.identification_photo.forEach((photo) => {
            const photoName = path.join(
                IDENTIFICATION_FOLDER,
                `${uuidv4()}.${getExtension(photo.name)}`,
            );
            savePhoto(photo, photoName);
            savedIdentificationPhotos.push(photoName);
          });
        } else {
          const photoName = path.join(
              IDENTIFICATION_FOLDER,
              `${uuidv4()}.${getExtension(
                  breedingPhotos.identification_photo.name,
              )}`,
          );
          savePhoto(breedingPhotos.identification_photo, photoName);
          savedIdentificationPhotos.push(photoName);
        }
      } else {
        const error = new Error();
        error.status = 400;
        error.message =
          'Es necesario subir al menos una foto identificativa del animall';
        throw error;
      }
      allPhotos.push(...savedIdentificationPhotos);
    }

    if (breedingPhotos.vaccine_passport) {
      // Mínimo una foto de las vacunas

      if (breedingPhotos.vaccine_passport) {
        if (Array.isArray(breedingPhotos.vaccine_passport)) {
          breedingPhotos.vaccine_passport.forEach((photo) => {
            const photoName = path.join(
                VACCINES_FOLDER,
                `${uuidv4()}.${getExtension(photo.name)}`,
            );
            savePhoto(photo, photoName);
            savedVaccinePhotos.push(photoName);
          });
        } else {
          const photoName = path.join(
              VACCINES_FOLDER,
              `${uuidv4()}.${getExtension(breedingPhotos.vaccine_passport.name)}`,
          );
          savePhoto(breedingPhotos.vaccine_passport, photoName);
          savedVaccinePhotos.push(photoName);
        }
      } else {
        const error = new Error();
        error.status = 400;
        error.message =
          'Es necesario subir al menos una foto del pasaporte de las vacunas';
        throw error;
      }
      allPhotos.push(...savedVaccinePhotos);
    }

    // Moderators will modify the breeding publication
    const pubData = {};
    if (breedingPhotos.animal_photo) {
      pubData.animal_photo = savedAnimalPhotos.join(',');
    }

    if (breedingData.location) pubData.location = breedingData.location;

    if (pub.document_status === 'In revision') {
      if (breedingPhotos.identification_photo) {
        pubData.identification_photo = savedIdentificationPhotos.join(',');
      }
      if (breedingPhotos.vaccine_passport) {
        pubData.vaccine_passport = savedVaccinePhotos.join(',');
      }
    }
    pubData.document_status = 'In revision';

    await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .update(pubData);

    // Se borran las request de esta publicacion
    await trx('request')
        .where('publication_id', pub.id).del();

    // Update price
    if (breedingData.price) {
      await trx('breeding')
          .where({'breeding.id': breedingId})
          .update({
            price: breedingData.price,
            pet_id: null,
          });
    }

    return await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    // Borramos las fotos guardadas en caso de error
    allPhotos.forEach((photo) => {
      fs.unlink(path.join('public', photo), (err) => {
        // nothing to do
      });
    });
    throw error;
  }
};

exports.acceptBreeding = async (breedingData, breedingId, trx) => {
  const pub = await trx('publication')
      .select('*', 'user_account.id AS userId')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('breeding.id', breedingId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Crianza no encontrada';

    throw error;
  }
  if (pub.document_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes aceptar una publicación que no está en revisión.';
    throw error;
  }

  try {
    // Moderators will modify the breeding publication
    const pubData = {};
    pubData.birth_date = breedingData.birth_date;
    pubData.genre = breedingData.genre;
    pubData.breed = breedingData.breed;
    pubData.type = breedingData.type;
    pubData.pedigree = breedingData.pedigree;
    pubData.document_status = 'Accepted';

    await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .update(pubData);

    return await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.rejectBreeding = async (breedingId, trx) => {
  const pub = await trx('publication')
      .select('*', 'user_account.id AS userId')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('breeding.id', breedingId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Crianza no encontrada';

    throw error;
  }
  if (pub.document_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes rechazar una publicación que no está en revisión';
    throw error;
  }

  try {
    // Moderators will modify the breeding publication
    const pubData = {};
    pubData.document_status = 'Rejected';

    await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .update(pubData);

    return await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.finishBreeding = async (breedingData, breedingId, trx) => {
  const pub = await trx('publication')
      .select('*', 'user_account.id AS userId')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('breeding.id', breedingId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Crianza no encontrada';

    throw error;
  }
  if ((pub.transaction_status !== 'In progress') &&
      (pub.transaction_status !== 'Offered') &&
      (pub.transaction_status !== 'In payment')) {
    const error = new Error();
    error.status = 404;
    error.message =
      'No puedes finalizar una publicación que no está en progreso.';
    throw error;
  }
  if (pub.codenumber !== breedingData.codenumber) {
    const error = new Error();
    error.status = 404;
    error.message = 'El código de verificación no es correcto';
    throw error;
  }

  try {
    // Moderators will modify the breeding publication
    const pubData = {};
    pubData.transaction_status = 'Awaiting payment';

    await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .update(pubData);

    // increment pet breeding counter
    await trx('pet').join('breeding', 'breeding.pet_id', '=', 'pet.id')
        .where('breeding.id', breedingId).increment('number_breeding', 1);

    return await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

const savePhoto = async (photo, photoRoute) => {
  await photo.mv(path.join('public', photoRoute));
};

// eslint-disable-next-line require-jsdoc
function numbergenerator() {
  let codenumber = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    codenumber += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return codenumber;
}

const getExtension = (photo) => {
  const extension = photo
      .split('.')
      .pop()
      .toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    const error = new Error();
    error.status = 404;
    error.message = 'La extensión de la imagen no es válida.';
    throw error;
  }
  return photo.split('.').pop();
};

exports.breedingHasRequest = async (connection, userId, breedingId) => {
  let hasRequest = false;
  const particular = await connection('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (particular == undefined) {
    const error = new Error();
    error.status = 404;
    error.message = 'Particular no encontrado';
    throw error;
  }

  const request = await connection('request')
      .select('*', 'breeding.id as breeding_id')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where('request.particular_id', particular.id)
      .andWhere('request.status', 'Pending')
      .andWhere('breeding.id', breedingId);

  if (request.length) {
    hasRequest = true;
  }

  return hasRequest;
};

exports.getAvailableBreedingsForParticular = async (connection, userId) => {
  const particular = await connection('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Particular no encontrado';
    throw error;
  }

  const breedings = await connection('breeding')
      .select('*', 'breeding.id as breeding_id')
      .join('publication', 'publication.id', '=', 'breeding.publication_id')
      .whereNot('publication.particular_id', particular.id)
      .andWhere('publication.document_status', 'Accepted')
      .andWhere('publication.transaction_status', 'Offered');

  return breedings;
};

exports.createBreedingWithPet = async (breedingData, userId, trx) => {
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

  const codenumberBreeding = numbergenerator();
  try {
    const pet = await trx('pet')
        .where('pet.id', breedingData.petId)
        .first();

    // Get particular by user account id
    const particular = await trx('particular')
        .select('id')
        .where('user_account_id', userId)
        .first();

    if (!pet) {
      const error = new Error();
      error.status = 404;
      error.message = 'Mascota no encontrada';
      throw error;
    }

    if (!particular) {
      const error = new Error();
      error.status = 404;
      error.message = 'Particular no encontrado';
      throw error;
    }

    if (pet.particular_id != particular.id) {
      const error = new Error();
      error.status = 404;
      error.message = 'Esta mascota no es tuya';
      throw error;
    }

    if (pet.pet_status !== 'Accepted') {
      const error = new Error();
      error.status = 404;
      error.message = 'Mascota inválida, sus documentos están sin revisar o rechazados';
      throw error;
    }

    const pubData = {
      animal_photo: pet.animal_photo,
      identification_photo: pet.identification_photo,
      vaccine_passport: pet.vaccine_passport,
      document_status: pet.pet_status,
      birth_date: pet.birth_date,
      genre: pet.genre,
      breed: pet.breed,
      location: breedingData.location,
      type: pet.type,
      pedigree: pet.pedigree,
      transaction_status: 'Offered',
      particular_id: particular.id,
    };

    const publicationId = await trx('publication').insert(pubData);
    const breedingId = await trx('breeding').insert({
      publication_id: publicationId,
      price: breedingData.price,
      codenumber: codenumberBreeding,
      pet_id: pet.id,
    });

    return await trx('breeding')
        .join('publication', 'breeding.publication_id', '=', 'publication.id')
        .select(BREEDING_FIELDS)
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    throw error;
  }
};

exports.editBreedingWithPet = async (
  breedingData,
  breedingId,
  userId,
  trx,
) => {
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

  // Se comprueba que este editando un breeding propio y en revision
  const pub = await trx('publication')
      .select('*', 'user_account.id AS userId')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('breeding.id', breedingId)
      .first();

  // Get particular by user account id
  const particular = await trx('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();

  const pet = await trx('pet')
      .where('pet.id', breedingData.petId)
      .first();

  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Mascota no encontrada';
    throw error;
  }

  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Particular no encontrado';
    throw error;
  }

  if (pet.particular_id != particular.id) {
    const error = new Error();
    error.status = 404;
    error.message = 'You do not own this pet';
    throw error;
  }

  if (pet.pet_status !== 'Accepted') {
    const error = new Error();
    error.status = 404;
    error.message = 'Pet is not valid, documents unrevised or rejected';
    throw error;
  }
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Crianza no encontrada';

    throw error;
  }

  if (pub.userId !== userId) {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación que no sea tuya';
    throw error;
  }

  if (pub.document_status === 'Rejected') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación rechazada';
    throw error;
  }

  if (pub.transaction_status !== 'Offered') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación cuyo estado no es ofrecida';
    throw error;
  }

  try {
    // Moderators will modify the breeding publication
    const pubData = {
      animal_photo: pet.animal_photo,
      identification_photo: pet.identification_photo,
      vaccine_passport: pet.vaccine_passport,
      document_status: pet.pet_status,
      birth_date: pet.birth_date,
      genre: pet.genre,
      breed: pet.breed,
      location: breedingData.location,
      type: pet.type,
      pedigree: pet.pedigree,
    };

    await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .update(pubData);

    // Se borran las request de esta publicacion
    await trx('request')
        .where('publication_id', pub.id).del();

    // Update price
    if (breedingData.price) {
      await trx('breeding')
          .where({'breeding.id': breedingId})
          .update({
            price: breedingData.price,
            pet_id: pet.id,
          });
    }

    return await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    // Borramos las fotos guardadas en caso de error
    allPhotos.forEach((photo) => {
      fs.unlink(path.join('public', photo), (err) => {
        // nothing to do
      });
    });
    throw error;
  }
};

exports.deleteBreeding = async (breedingId, userId, trx) => {
  const particular = await trx('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Particular no encontrado';
    throw error;
  }

  const breeding = await trx('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where('breeding.id', breedingId)
      .first();

  if (!breeding) {
    const error = new Error();
    error.status = 404;
    error.message = 'Crianza no encontrada';

    throw error;
  }

  if (breeding.particular_id !== particular.id) {
    const error = new Error();
    error.status = 404;
    error.message = 'Esta crianza no está creada por ti.';
    throw error;
  }

  if (breeding.transaction_status === 'Awaiting payment' ||
    breeding.transaction_status === 'In progress' ||
    breeding.transaction_status === 'In payment') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes eliminar una publicación que tiene un pago en proceso.';
    throw error;
  }

  await trx('publication')
      .where('publication.id', breeding.publication_id)
      .del();

  return true;
};
