const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const ADOPTION_FIELDS = [
  'adoption.id',
  'publication_id',
  'shelter_id',
  'animal_photo',
  'identification_photo',
  'document_status',
  'birth_date',
  'genre',
  'breed',
  'transaction_status',
  'taxes',
  'location',
  'name',
  'pedigree',
  'type',
  'vaccine_passport',
];

const ANIMAL_FOLDER = path.join('images', 'animal_photos');
const IDENTIFICATION_FOLDER = path.join('images', 'identification_photos');
const VACCINES_FOLDER = path.join('images', 'vaccine_passports');

const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];
exports.getAdoption = async (connection, adoptionId) => {
  const adoption = await connection('adoption')
      .select(ADOPTION_FIELDS)
      .join('publication', 'adoption.publication_id', '=', 'publication.id')
      .where('adoption.id', adoptionId)
      .first();

  if (!adoption) {
    const error = new Error();
    error.status = 400;
    error.message = 'No adoption with that ID';
    throw error;
  }

  return adoption;
};

exports.getParticularAdoptions = async (connection, page) => {
  const adoptions = await connection('adoption')
      .select('*', 'adoption.id as adoption_id')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .innerJoin('particular', 'particular.id', '=', 'publication.particular_id')
      .where('publication.transaction_status', 'Completed')
      .limit(10)
      .offset(10 * page);

  return adoptions;
};

exports.updateAdoption = async (
  adoptionData,
  adoptionPhotos,
  adoptionId,
  userId,
  trx,
) => {
  // Se comprueba que este editando un adoption propio y en revision
  const pub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('adoption.id', adoptionId)
      .first();
  console.log(pub);

  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adoption not found';
    throw error;
  }

  if (pub.shelter_id === null && !(pub.particular_id === userId)) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not edit a publication that you do not own';
    throw error;
  } else if (pub.particular_id === null && !(pub.shelter_id === userId)) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not edit a publication that you do not own';
    throw error;
  }

  if (
    !(pub.document_status === 'In revision') &&
    !(pub.particular_id === null)
  ) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not edit a publication which is not in revision';
    throw error;
  } else if (
    !(pub.document_status === 'Accepted') &&
    !(pub.shelter_id === null)
  ) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not edit a publication which is not in revision';
    throw error;
  }

  const allPhotos = [];

  try {
    // Mínimo 2 fotos del animal
    const savedAnimalPhotos = [];
    if (
      adoptionPhotos.animal_photo &&
      adoptionPhotos.animal_photo.length >= 2
    ) {
      adoptionPhotos.animal_photo.forEach((photo) => {
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
        'It is required to upload at least two photos of the animal';
      throw error;
    }

    allPhotos.push(...savedAnimalPhotos);

    // Mínimo una foto identificativa
    const savedIdentificationPhotos = [];
    if (adoptionPhotos.identification_photo) {
      if (Array.isArray(adoptionPhotos.identification_photo)) {
        adoptionPhotos.identification_photo.forEach((photo) => {
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
                adoptionPhotos.identification_photo.name,
            )}`,
        );
        savePhoto(adoptionPhotos.identification_photo, photoName);
        savedIdentificationPhotos.push(photoName);
      }
    }

    allPhotos.push(...savedIdentificationPhotos);

    // Mínimo una foto de las vacunas
    const savedVaccinePhotos = [];
    if (adoptionPhotos.vaccine_passport) {
      if (Array.isArray(adoptionPhotos.vaccine_passport)) {
        adoptionPhotos.vaccine_passport.forEach((photo) => {
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
            `${uuidv4()}.${getExtension(adoptionPhotos.vaccine_passport.name)}`,
        );
        savePhoto(adoptionPhotos.vaccine_passport, photoName);
        savedVaccinePhotos.push(photoName);
      }
    }

    allPhotos.push(...savedVaccinePhotos);

    // Some values are not required during edition
    // Moderators will modify the adoption publication
    const pubData = {
      animal_photo: savedAnimalPhotos.join(','),
      identification_photo: savedIdentificationPhotos.join(',') || null,
      vaccine_passport: savedVaccinePhotos.join(',') || null,
      type: adoptionData.type,
      location: adoptionData.location,
      pedigree: adoptionData.pedigree,
      birth_date: adoptionData.birth_date,
      genre: adoptionData.genre,
      breed: adoptionData.breed,
    };

    await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .update(pubData);
    await trx('adoption')
        .where({'adoption.id': adoptionId})
        .update({
          name: adoptionData.name,
          taxes: adoptionData.taxes,
        });

    return await trx('publication')
        .select('*', 'adoption.id as id')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
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

exports.createAdoption = async (
  adoptionData,
  adoptionPhotos,
  userId,
  role,
  trx,
) => {
  const allPhotos = [];

  try {
    // Mínimo 2 fotos del animal
    const savedAnimalPhotos = [];
    if (
      adoptionPhotos.animal_photo &&
      adoptionPhotos.animal_photo.length >= 2
    ) {
      adoptionPhotos.animal_photo.forEach((photo) => {
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
        'It is required to upload at least two photos of the animal';
      throw error;
    }

    allPhotos.push(...savedAnimalPhotos);

    // Mínimo una foto identificativa
    const savedIdentificationPhotos = [];
    if (adoptionPhotos.identification_photo) {
      if (Array.isArray(adoptionPhotos.identification_photo)) {
        adoptionPhotos.identification_photo.forEach((photo) => {
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
                adoptionPhotos.identification_photo.name,
            )}`,
        );
        savePhoto(adoptionPhotos.identification_photo, photoName);
        savedIdentificationPhotos.push(photoName);
      }
    }

    allPhotos.push(...savedIdentificationPhotos);

    // Mínimo una foto de las vacunas
    const savedVaccinePhotos = [];
    if (adoptionPhotos.vaccine_passport) {
      if (Array.isArray(adoptionPhotos.vaccine_passport)) {
        adoptionPhotos.vaccine_passport.forEach((photo) => {
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
            `${uuidv4()}.${getExtension(adoptionPhotos.vaccine_passport.name)}`,
        );
        savePhoto(adoptionPhotos.vaccine_passport, photoName);
        savedVaccinePhotos.push(photoName);
      }
    }

    allPhotos.push(...savedVaccinePhotos);

    let pubData = null;

    if (role === 'shelter') {
      pubData = {
        animal_photo: savedAnimalPhotos.join(','),
        identification_photo: savedIdentificationPhotos.join(',') || null,
        document_status: 'Accepted',
        transaction_status: 'In progress',
        vaccine_passport: savedVaccinePhotos.join(',') || null,
        type: adoptionData.type,
        location: adoptionData.location,
        pedigree: adoptionData.pedigree,
        birth_date: adoptionData.birth_date,
        genre: adoptionData.genre,
        breed: adoptionData.breed,
      };
    } else if (role === 'particular') {
      pubData = {
        animal_photo: savedAnimalPhotos.join(','),
        identification_photo: savedIdentificationPhotos.join(',') || null,
        document_status: 'In revision',
        transaction_status: 'In progress',
        vaccine_passport: savedVaccinePhotos.join(',') || null,
        type: adoptionData.type,
        location: adoptionData.location,
        pedigree: adoptionData.pedigree,
        birth_date: adoptionData.birth_date,
        genre: adoptionData.genre,
        breed: adoptionData.breed,
        particular_id: userId,
      };
    }

    const publicationId = await trx('publication').insert(pubData);

    let adoptionId = null;

    if (role === 'shelter') {
      adoptionId = await trx('adoption').insert({
        publication_id: publicationId,
        name: adoptionData.name,
        taxes: adoptionData.taxes,
        shelter_id: userId,
      });
    } else if (role === 'particular') {
      adoptionId = await trx('adoption').insert({
        publication_id: publicationId,
        name: adoptionData.name,
        taxes: null,
        shelter_id: null,
      });
    }

    return await trx('adoption')
        .select('*', 'adoption.id as id')
        .join('publication', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
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

exports.getPendingAdoptions = async (connection, userId) => {
  const user = await connection('moderator')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const adoptions = await connection('adoption')
      .join('publication', 'adoption.publication_id', '=', 'publication.id')
      .where('publication.document_status', 'In revision');
  return adoptions;
};

exports.acceptAdoption = async (adoptionData, adoptionId, trx) => {
  const pub = await trx('publication')
      .select('*', 'user_account.id AS userId')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('adoption.id', adoptionId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adoption not found';
    throw error;
  }
  if (!(pub.document_status === 'In revision')) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not accept a publication which is not in revision';
    throw error;
  }

  try {
    // Moderators will modify the adoption publication
    const pubData = {};
    pubData.birth_date = adoptionData.birth_date;
    pubData.genre = adoptionData.genre;
    pubData.breed = adoptionData.breed;
    pubData.type = adoptionData.type;
    pubData.pedigree = adoptionData.pedigree;
    pubData.document_status = 'Accepted';

    await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .update(pubData);

    return await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .first();
  } catch (error) {
    throw error;
  }
};

exports.rejectAdoption = async (adoptionId, trx) => {
  const pub = await trx('publication')
      .select('*', 'user_account.id AS userId')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('adoption.id', adoptionId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adoption not found';
    throw error;
  }
  if (!(pub.document_status === 'In revision')) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not reject a publication which is not in revision';
    throw error;
  }

  try {
    // Moderators will modify the adoption publication
    const pubData = {};
    pubData.document_status = 'Rejected';

    await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .update(pubData);

    return await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .first();
  } catch (error) {
    throw error;
  }
};

exports.imInterested = async (userId, adoptionId, trx) => {
  // Se comprueba que no se intenta estar interesado en una publication propia
  const pub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where({'adoption.id': adoptionId})
      .first();

  if (pub == undefined || pub.particular_id === userId) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not be interested in your own publications';
    throw error;
  }

  // Se comprueba que esta publicacion no este con una request pendiente del usuario actual
  const rqt = await trx('request')
      .where({publication_id: pub.publication_id})
      .andWhere({particular_id: userId})
      .first();

  if (rqt && rqt.status === 'Pending') {
    const error = new Error();
    error.status = 404;
    error.message = 'Already interested or concluded';
    throw error;
  }

  // Se comprueba que esta publicacion tenga los documentos verificados y todavia este en progreso
  const wrongPub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where({'publication.document_status': 'Accepted'})
      .andWhere({'publication.transaction_status': 'In progress'})
      .andWhere({'adoption.id': adoptionId});

  if (!wrongPub.length) {
    const error = new Error();
    error.status = 404;
    error.message = 'The publication documents or status are wrong';
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
      particular_id: userId,
    };

    const requestId = await trx('request').insert(rqtData);
    return await trx('request')
        .where({id: requestId})
        .first();
  }

  // Comprobar que la request no sea del propia usuario y que sea visible para todo el mundo
};

exports.getAdoptionsOffers = async (adoptionParams, connection, userId) => {
  const user = await connection('user_account')
      .select('id')
      .where('user_account.id', userId)
      .andWhere('user_account.role', 'particular')
      .first();

  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const location = adoptionParams.location;
  const birthDate = adoptionParams.birth_date;
  const type = adoptionParams.type;
  const breed = adoptionParams.breed;
  const pedigree = adoptionParams.pedigree;

  const adoptions = await connection('adoption')
      .join('publication', 'adoption.publication_id', '=', 'publication.id')
      .where('publication.document_status', 'Accepted')
      .andWhere('publication.transaction_status', 'In progress')
      .andWhereNot('publication.particular_id', user.id)
      .modify(function(queryBuilder) {
        if (location) {
          queryBuilder.andWhere('publication.location', 'like', `%${location}%`);
        }
        if (birthDate) {
          queryBuilder.andWhere('publication.birth_date', birthDate);
        }
        if (type) {
          queryBuilder.andWhere('publication.type', 'like', `%${type}%`);
        }
        if (breed) {
          queryBuilder.andWhere('publication.breed', 'like', `%${breed}%`);
        }
        if (pedigree) {
          queryBuilder.andWhere('publication.pedigree', pedigree);
        }
      });
  return adoptions;
};

exports.getAdoptions = async (connection, page) => {
  const adoptions = await connection('adoption')
      .select('*')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .where('publication.transaction_status', 'Completed')
      .limit(10)
      .offset(10 * page);

  return adoptions;
};
