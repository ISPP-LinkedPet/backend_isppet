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
  'creation_date',
];

const ANIMAL_FOLDER = path.join('images', 'animal_photos');
const IDENTIFICATION_FOLDER = path.join('images', 'identification_photos');
const VACCINES_FOLDER = path.join('images', 'vaccine_passports');

const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

const utilService = require('../services/util');
const dirAnimal = './public/images/animal_photos';
const dirIdentification = './public/images/identification_photos';
const dirVaccine = './public/images/vaccine_passports';

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
      .limit(10)
      .offset(10 * page);

  return adoptions;
};

exports.updateAdoption = async (
  adoptionData,
  adoptionPhotos,
  adoptionId,
  userId,
  role,
  trx,
) => {
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

  // Se comprueba que este editando un adoption propio y en revision
  const pub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('adoption.id', adoptionId)
      .first();

  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adopción no encontrada';

    throw error;
  }

  if ((role === 'particular' && (pub.particular_id !== userId)) || (role === 'shelter' && (pub.shelter_id !== userId))) {
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

  if (pub.transaction_status === 'Completed') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación cuyo estado del proceso de transacción es completado.';
    throw error;
  }

  const allPhotos = [];
  const savedAnimalPhotos = [];
  const savedIdentificationPhotos = [];
  const savedVaccinePhotos = [];

  try {
    // Mínimo 2 fotos del animal
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
        'Es necesario subir al menos dos fotos del animal';
      throw error;
    }

    allPhotos.push(...savedAnimalPhotos);

    // Mínimo una foto identificativa
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

    if (role === 'particular') {
      pubData.document_status = 'In revision';
    }


    await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .update(pubData);

    await trx('adoption')
        .where({'adoption.id': adoptionId})
        .update({
          name: adoptionData.name,
          taxes: adoptionData.taxes,
          pet_id: null,
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
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

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
        'Es necesario subir al menos dos fotos del animal';
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
        transaction_status: 'Offered',
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
        transaction_status: 'Offered',
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
        pet_id: null,
      });
    } else if (role === 'particular') {
      adoptionId = await trx('adoption').insert({
        publication_id: publicationId,
        name: adoptionData.name,
        taxes: null,
        shelter_id: null,
        pet_id: null,
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
  const extension = photo.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    const error = new Error();
    error.status = 404;
    error.message = 'La extensión de la imagen no es válida.';
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
    error.message = 'Usuario no encontrado';
    throw error;
  }

  const adoptions = await connection('adoption')
      .select('*', 'adoption.id AS adoption_id')
      .join('publication', 'adoption.publication_id', '=', 'publication.id')
      .where('publication.document_status', 'In revision');
  return adoptions;
};

exports.acceptAdoption = async (adoptionId, trx) => {
  const pub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('adoption.id', adoptionId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adopción no encontrada';

    throw error;
  }
  if (pub.document_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes aceptar una publicación que no está en revisión.';
    throw error;
  }

  try {
    // Moderators will modify the adoption publication
    const pubData = {};
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
    console.err(error);
    throw error;
  }
};

exports.rejectAdoption = async (adoptionId, trx) => {
  const pub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('adoption.id', adoptionId)
      .first();
  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adopción no encontrada';

    throw error;
  }
  if (pub.document_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes rechazar una publicación que no está en revisión';
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
    console.err(error);
    throw error;
  }
};

exports.imInterested = async (userId, adoptionId, trx) => {
  // Se comprueba que no se intenta estar interesado en una publication propia

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
  const pub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where({'adoption.id': adoptionId})
      .first();

  if (pub == undefined || pub.particular_id === particularId.id) {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes estar interesado en una publicación que es tuya.';
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
    error.message = 'Ya interesado o está concluida.';
    throw error;
  }

  // Se comprueba que esta publicacion tenga los documentos verificados y todavia este en progreso
  const wrongPub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where({'publication.document_status': 'Accepted'})
      .andWhere({'publication.transaction_status': 'Offered'})
      .andWhere({'adoption.id': adoptionId});
  if (!wrongPub.length) {
    const error = new Error();
    error.status = 404;
    error.message = 'Los documentos o estados de la publicación son erróneos';
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

exports.getAdoptionsOffers = async (adoptionParams, connection, userId) => {
  const particular = await connection('user_account')
      .select('particular.id')
      .innerJoin('particular', 'particular.user_account_id', '=', 'user_account.id')
      .where('user_account.id', userId)
      .andWhere('user_account.role', 'particular')
      .first();

  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Usuario no encontrado';
    throw error;
  }

  const location = adoptionParams.location;
  const birthDate = adoptionParams.birth_date;
  const type = adoptionParams.type;
  const breed = adoptionParams.breed;
  const pedigree = adoptionParams.pedigree;

  let adoptions = connection('adoption')
      .select('*', 'adoption.id as adoption_id', 'publication.type AS typePublic')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .where('publication.document_status', 'Accepted')
      // .andWhere('publication.transaction_status', 'Offered')
      .andWhere( (row) => {
        row.whereNot('publication.particular_id', particular.id);
        row.orWhereNull('publication.particular_id');
      });

  if (location) {
    adoptions.andWhere('publication.location', 'like', `%${location}%`);
  }
  if (birthDate) {
    adoptions.andWhere('publication.birth_date', birthDate);
  }
  if (type) {
    adoptions.andWhere('publication.type', type);
  }
  if (breed) {
    adoptions.andWhere('publication.breed', 'like', `%${breed}%`);
  }
  if (pedigree) {
    if (pedigree == 'true') {
      adoptions.andWhere('publication.pedigree', 1);
    } else {
      adoptions.andWhere('publication.pedigree', 0);
    }
  }

  adoptions.orderBy('adoption_id', 'asc');
  adoptions = await adoptions;
  return adoptions;
};

exports.getAdoptions = async (connection, page) => {
  const adoptions = await connection('adoption')
      .select('*', 'adoption.id as adoption_id')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      // .where('publication.transaction_status', 'Offered')
      .andWhere('publication.document_status', 'Accepted')
      .orderBy('adoption_id', 'asc');

  return adoptions;
};

exports.deleteAdoption = async (adoptionId, userId, trx) => {
  const pub = await trx('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('adoption.id', adoptionId)
      .first();

  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adopción no encontrada';

    throw error;
  }

  if ((pub.shelter_id === null && (pub.particular_id !== userId)) || (pub.particular_id === null && (pub.shelter_id !== userId))) {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes eliminar una publicación que no es tuya.';
    throw error;
  }

  if (pub.transaction_status === 'Awaiting payment' ||
    pub.transaction_status === 'In progress' ||
    pub.transaction_status === 'In payment') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes eliminar una publicación que está en proceso de pago.';
    throw error;
  }

  await trx('publication')
      .where('publication.id', pub.publication_id)
      .del();

  return true;
};

exports.createAdoptionWithPet = async (adoptionData, userId, trx) => {
  try {
    const pet = await trx('pet')
        .where('pet.id', adoptionData.petId)
        .first();

    // Get shelter by user account id
    const shelter = await trx('shelter')
        .select('id')
        .where('user_account_id', userId)
        .first();

    if (!pet) {
      const error = new Error();
      error.status = 404;
      error.message = 'Mascota no encontrada';
      throw error;
    }

    if (!shelter) {
      const error = new Error();
      error.status = 404;
      error.message = 'Shelter no encontrado';
      throw error;
    }

    if (pet.shelter_id != shelter.id) {
      const error = new Error();
      error.status = 404;
      error.message = 'Esta mascota no es tuya';
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
      location: adoptionData.location,
      type: pet.type,
      pedigree: pet.pedigree,
      transaction_status: 'Offered',
      particular_id: null,
    };

    const publicationId = await trx('publication').insert(pubData);
    const adoptionId = await trx('adoption').insert({
      publication_id: publicationId,
      name: pet.name,
      taxes: adoptionData.taxes,
      shelter_id: shelter.id,
      pet_id: pet.id,
    });

    return await trx('adoption')
        .select('*', 'adoption.id as id')
        .join('publication', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .first();
  } catch (error) {
    throw error;
  }
};

exports.editAdoptionWithPet = async (
  adoptionData,
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

  // Get shelter by user account id
  const shelter = await trx('shelter')
      .select('id')
      .where('user_account_id', userId)
      .first();

  const pet = await trx('pet')
      .where('pet.id', adoptionData.petId)
      .first();

  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Mascota no encontrada';
    throw error;
  }

  if (!shelter) {
    const error = new Error();
    error.status = 404;
    error.message = 'Shelter no encontrado';
    throw error;
  }

  if (pet.shelter_id != shelter.id) {
    const error = new Error();
    error.status = 404;
    error.message = 'You do not own this pet';
    throw error;
  }

  if (!pub) {
    const error = new Error();
    error.status = 404;
    error.message = 'Adopcion no encontrada';

    throw error;
  }

  if (pub.userId !== userId) {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación que no sea tuya';
    throw error;
  }

  if (pub.transaction_status !== 'Offered') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes editar una publicación cuyo estado no es ofrecida';
    throw error;
  }

  try {
    // Moderators will modify the adoption publication
    const pubData = {
      animal_photo: pet.animal_photo,
      identification_photo: pet.identification_photo,
      vaccine_passport: pet.vaccine_passport,
      document_status: pet.pet_status,
      birth_date: pet.birth_date,
      genre: pet.genre,
      breed: pet.breed,
      location: adoptionData.location,
      type: pet.type,
      pedigree: pet.pedigree,
    };

    await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .update(pubData);

    // Update taxes
    if (adoptionData.taxes) {
      await trx('adoption')
          .where({'adoption.id': adoptionId})
          .update({
            taxes: adoptionData.taxes,
            pet_id: pet.id,
            name: pet.name,
          });
    }

    return await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where({'adoption.id': adoptionId})
        .first();
  } catch (error) {
    throw error;
  }
};
