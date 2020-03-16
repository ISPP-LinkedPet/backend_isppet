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
  'age',
  'genre',
  'breed',
  'transaction_status',
  'title',
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
      .select('*', 'user_account.id AS userId')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .join('shelter', 'shelter.id', '=', 'adoption.shelter_id')
      .join('user_account', 'user_account.id', '=', 'shelter.user_account_id')
      .where('adoption.id', adoptionId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adoption not found';
    throw error;
  }
  if (!(pub.userId === userId)) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not edit a publication that you do not own';
    throw error;
  }
  if (!(pub.document_status === 'In revision')) {
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
    } else {
      const error = new Error();
      error.status = 400;
      error.message =
        'It is required to upload at least one identification photo';
      throw error;
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
    } else {
      const error = new Error();
      error.status = 400;
      error.message =
        'It is required to upload at least one photo of the vaccine passport';
      throw error;
    }

    allPhotos.push(...savedVaccinePhotos);

    // Some values are not required during edition
    // Moderators will modify the adoption publication
    const pubData = {
      animal_photo: savedAnimalPhotos.join(','),
      identification_photo: savedIdentificationPhotos.join(','),
      age: adoptionData.age || null,
      genre: adoptionData.genre || null,
      breed: adoptionData.breed || null,
      location: adoptionData.location || null,
      type: adoptionData.type || null,
      pedigree: adoptionData.pedigree || null,
      title: adoptionData.title,
      vaccine_passport: savedVaccinePhotos.join(','),
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
    } else {
      const error = new Error();
      error.status = 400;
      error.message =
        'It is required to upload at least one identification photo';
      throw error;
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
    } else {
      const error = new Error();
      error.status = 400;
      error.message =
        'It is required to upload at least one photo of the vaccine passport';
      throw error;
    }

    allPhotos.push(...savedVaccinePhotos);

    let pubData = null;

    if (role === 'shelter') {
      pubData = {
        animal_photo: savedAnimalPhotos.join(','),
        identification_photo: savedIdentificationPhotos.join(','),
        document_status: 'Accepted',
        transaction_status: 'In progress',
        title: null,
        vaccine_passport: savedVaccinePhotos.join(','),
        type: null,
        location: adoptionData.location || null,
        pedigree: null,
        age: null,
        genre: null,
        breed: null,
      };
    } else if (role === 'particular') {
      pubData = {
        animal_photo: savedAnimalPhotos.join(','),
        identification_photo: savedIdentificationPhotos.join(','),
        document_status: 'In revision',
        transaction_status: 'In progress',
        title: null,
        vaccine_passport: savedVaccinePhotos.join(','),
        type: null,
        location: adoptionData.location || null,
        pedigree: null,
        age: null,
        genre: null,
        breed: null,
        particular_id: userId,
      };
    }

    console.log(pubData);

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
        taxes: adoptionData.taxes,
        shelter_id: null,
      });
    }

    return await trx('adoption')
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
  const pub = await trx('publication').select('*', 'user_account.id AS userId')
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
  if ( !(pub.document_status === 'In revision')) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not accept a publication which is not in revision';
    throw error;
  }

  try {
    // Moderators will modify the adoption publication
    const pubData = {};
    pubData.title = adoptionData.title;
    pubData.age = adoptionData.age;
    pubData.genre = adoptionData.genre;
    pubData.breed = adoptionData.breed;
    pubData.type = adoptionData.type;
    pubData.pedigree = adoptionData.pedigree;
    pubData.document_status  = 'Accepted';

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
  const pub = await trx('publication').select('*', 'user_account.id AS userId')
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
  if ( !(pub.document_status === 'In revision')) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not reject a publication which is not in revision';
    throw error;
  }

  try {
    // Moderators will modify the adoption publication
    const pubData = {};
    pubData.document_status  = 'Rejected';

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