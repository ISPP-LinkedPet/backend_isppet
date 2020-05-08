const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const ANIMAL_FOLDER = path.join('images', 'animal_photos');
const IDENTIFICATION_FOLDER = path.join('images', 'identification_photos');
const VACCINES_FOLDER = path.join('images', 'vaccine_passports');

const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

const utilService = require('../services/util');
const dirAnimal = './public/images/animal_photos';
const dirIdentification = './public/images/identification_photos';
const dirVaccine = './public/images/vaccine_passports';

exports.createPet = async (petData, petPhotos, userId, role, trx) => {
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

  const allPhotos = [];
  try {
    // Mínimo 2 fotos del animal
    const savedAnimalPhotos = [];

    if (petPhotos.animal_photo && petPhotos.animal_photo.length >= 2) {
      petPhotos.animal_photo.forEach((photo) => {
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
    if (petPhotos.identification_photo) {
      if (Array.isArray(petPhotos.identification_photo)) {
        petPhotos.identification_photo.forEach((photo) => {
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
            `${uuidv4()}.${getExtension(petPhotos.identification_photo.name)}`,
        );
        savePhoto(petPhotos.identification_photo, photoName);
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
    if (petPhotos.vaccine_passport) {
      if (Array.isArray(petPhotos.vaccine_passport)) {
        petPhotos.vaccine_passport.forEach((photo) => {
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
            `${uuidv4()}.${getExtension(petPhotos.vaccine_passport.name)}`,
        );
        savePhoto(petPhotos.vaccine_passport, photoName);
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

    // Some values are not required during creation
    // Moderators will modify the pet publication
    let newPetData = {};

    if (role === 'particular') {
    // Get particular by user account id
      const particular = await trx('particular')
          .select('id')
          .where('user_account_id', userId)
          .first();

      newPetData = {
        animal_photo: savedAnimalPhotos.join(','),
        identification_photo: savedIdentificationPhotos.join(','),
        vaccine_passport: savedVaccinePhotos.join(','),
        birth_date: null,
        genre: null,
        breed: null,
        type: null,
        pedigree: null,
        name: petData.name,
        pet_status: 'In revision',
        particular_id: particular.id,
        shelter_id: null,
      };
    } else {
      const shelter = await trx('shelter')
          .select('id')
          .where('user_account_id', userId)
          .first();

      newPetData = {
        animal_photo: savedAnimalPhotos.join(','),
        identification_photo: savedIdentificationPhotos.join(','),
        vaccine_passport: savedVaccinePhotos.join(','),
        birth_date: petData.birth_date,
        genre: petData.genre,
        breed: petData.breed,
        type: petData.type,
        pedigree: petData.pedigree,
        name: petData.name,
        pet_status: 'Accepted',
        particular_id: null,
        shelter_id: shelter.id,
      };
    }


    const petId = await trx('pet').insert(newPetData);

    return await trx('pet')
        .where({'pet.id': petId})
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

exports.editPet = async (petData, petPhotos, petId, userId, role, trx) => {
  utilService.createPhotoDirectory(dirAnimal);
  utilService.createPhotoDirectory(dirIdentification);
  utilService.createPhotoDirectory(dirVaccine);

  // Se comprueba que este editando un pet propio

  let pet = {};
  let publication = {};

  if (role === 'particular') {
    pet = await trx('pet')
        .select('*', 'user_account.id AS userId')
        .join('particular', 'particular.id', '=', 'pet.particular_id')
        .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
        .where('pet.id', petId)
        .first();

    publication = await trx('publication')
        .join('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where('breeding.pet_id', pet.id)
        .first();
  } else {
    pet = await trx('pet')
        .select('*', 'user_account.id AS userId')
        .join('shelter', 'shelter.id', '=', 'pet.shelter_id')
        .join('user_account', 'user_account.id', '=', 'shelter.user_account_id')
        .where('pet.id', petId)
        .first();

    publication = await trx('publication')
        .join('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where('adoption.pet_id', pet.id)
        .first();
  }

  if (publication) {
    const error = new Error();
    error.status = 404;
    error.message = 'You cannot edit a pet with publications';
    throw error;
  }

  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Mascota no encontrada';
    throw error;
  }

  if (pet.userId !== userId) {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not edit a pet that you do not own';
    throw error;
  }

  const allPhotos = [];
  const savedAnimalPhotos = [];
  const savedIdentificationPhotos = [];
  const savedVaccinePhotos = [];

  try {
    if (petPhotos.animal_photo) {
      // Mínimo 2 fotos del animal

      if (petPhotos.animal_photo && petPhotos.animal_photo.length >= 2) {
        petPhotos.animal_photo.forEach((photo) => {
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

    if (petPhotos.identification_photo) {
      // Mínimo una foto identificativa

      if (petPhotos.identification_photo) {
        if (Array.isArray(petPhotos.identification_photo)) {
          petPhotos.identification_photo.forEach((photo) => {
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
              `${uuidv4()}.${getExtension(petPhotos.identification_photo.name)}`,
          );
          savePhoto(petPhotos.identification_photo, photoName);
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

    if (petPhotos.vaccine_passport) {
      // Mínimo una foto de las vacunas

      if (petPhotos.vaccine_passport) {
        if (Array.isArray(petPhotos.vaccine_passport)) {
          petPhotos.vaccine_passport.forEach((photo) => {
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
              `${uuidv4()}.${getExtension(petPhotos.vaccine_passport.name)}`,
          );
          savePhoto(petPhotos.vaccine_passport, photoName);
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

    // Moderators will modify the pet publication
    const editPetData = {};
    if (petPhotos.animal_photo) {
      editPetData.animal_photo = savedAnimalPhotos.join(',');
    }

    if (petPhotos.identification_photo) {
      editPetData.identification_photo = savedIdentificationPhotos.join(',');
    }
    if (petPhotos.vaccine_passport) {
      editPetData.vaccine_passport = savedVaccinePhotos.join(',');
    }

    if (petData.name) {
      editPetData.name = petData.name;
    }

    if (role === 'particular') {
      if (pet.pet_status !== 'In revision') {
        editPetData.breed = null;
        editPetData.type = null;
        editPetData.birth_date = null;
        editPetData.pedigree = null;
        editPetData.genre = null;
        editPetData.pet_status = 'In revision';
      }
    } else {
      if (petData.breed) {
        editPetData.breed = petData.breed;
      }
      if (petData.type) {
        editPetData.type = petData.type;
      }
      if (petData.birth_date) {
        editPetData.birth_date = petData.birth_date;
      }
      if (petData.pedigree) {
        editPetData.pedigree = petData.pedigree;
      }
      if (petData.genre) {
        editPetData.genre = petData.genre;
      }
    }
    await trx('pet')
        .where({'pet.id': petId})
        .update(editPetData);

    return await trx('pet')
        .where({'pet.id': petId})
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

exports.getPet = async (connection, petId) => {
  const pet = await connection('pet')
      .where('pet.id', petId)
      .first();

  if (!pet) {
    const error = new Error();
    error.status = 400;
    error.message = 'No pet with that ID';
    throw error;
  }

  return pet;
};

exports.getPetsInRevision = async (connection) => {
  const pets = await connection('pet').where('pet.pet_status', 'In revision');

  return pets;
};

exports.acceptPet = async (petData, petId, trx) => {
  const pet = await trx('pet')
      .where('pet.id', petId)
      .first();
  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Mascota no encontrada';
    throw error;
  }
  if (pet.pet_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes aceptar una mascota que no está en revisión';
    throw error;
  }

  try {
    // Moderators will modify the pet
    const editPetData = {};
    editPetData.birth_date = petData.birth_date;
    editPetData.genre = petData.genre;
    editPetData.breed = petData.breed;
    editPetData.type = petData.type;
    editPetData.pedigree = petData.pedigree;
    editPetData.pet_status = 'Accepted';

    await trx('pet')
        .where({'pet.id': petId})
        .update(editPetData);

    return await trx('pet')
        .where({'pet.id': petId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.rejectPet = async (petId, trx) => {
  const pet = await trx('pet')
      .where('pet.id', petId)
      .first();
  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Mascota no encontrada';
    throw error;
  }
  if (pet.pet_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'No puedes rechazar una mascota que no está en revisión.';
    throw error;
  }

  try {
    // Moderators will modify the pet
    const editPetData = {};
    editPetData.pet_status = 'Rejected';

    await trx('pet')
        .where({'pet.id': petId})
        .update(editPetData);

    return await trx('pet')
        .where({'pet.id': petId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.getPetsByParticularId = async (connection, particularId, breeding) => {
  try {
    const pets = await connection('pet')
        .select('*')
        .where('pet.particular_id', particularId);
    if (!pets.length) {
      const error = new Error();
      error.status = 404;
      error.message = 'Este particular no tiene ninguna mascota registrada.';
      throw error;
    }
    const availablePets = [];
    if (breeding == 'true') {
      availablePets.push(...pets.filter( (x) => x.genre == 'Male' || !(x.genre=='Female' && x.number_breeding > 3)));
    } else {
      availablePets.push(...pets);
    }

    return availablePets;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.deletePet = async (petId, userId, role, trx) => {
  const pet = await trx('pet')
      .where('pet.id', petId)
      .first();

  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Mascota no encontrada';
    throw error;
  }

  if (role === 'particular') {
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

    if (pet.particular_id !== particular.id) {
      const error = new Error();
      error.status = 404;
      error.message = 'You do not own this pet';
      throw error;
    }

    const breeding = await trx('breeding')
        .where('breeding.pet_id', pet.id)
        .first();

    if (breeding) {
      const error = new Error();
      error.status = 404;
      error.message = 'No puedes eliminar una mascota que tenga publicaciones.';
      throw error;
    }
  } else {
    const shelter = await trx('shelter')
        .select('id')
        .where('user_account_id', userId)
        .first();
    if (!shelter) {
      const error = new Error();
      error.status = 404;
      error.message = 'Shelter no encontrado';
      throw error;
    }

    if (pet.shelter_id !== shelter.id) {
      const error = new Error();
      error.status = 404;
      error.message = 'You do not own this pet';
      throw error;
    }

    const adoption = await trx('adoption')
        .where('adoption.pet_id', pet.id)
        .first();

    if (adoption) {
      const error = new Error();
      error.status = 404;
      error.message = 'No puedes eliminar una mascota que tenga publicaciones.';
      throw error;
    }
  }

  await trx('pet')
      .where('pet.id', pet.id)
      .del();

  return true;
};

exports.getCanDelete = async (connection, userId, petId, role) => {
  const pet = await connection('pet')
      .where('pet.id', petId)
      .first();

  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Pet not found';
    throw error;
  }

  let petCanBeDeleted = {};

  if (role === 'particular') {
    const particular = await connection('particular')
        .where('user_account_id', userId)
        .first();

    if (particular.id !== pet.particular_id) {
      const error = new Error();
      error.status = 404;
      error.message = 'You do not own this pet';
      throw error;
    }

    petCanBeDeleted = await connection('pet')
        .join('breeding', 'pet.id', '=', 'breeding.pet_id')
        .join('publication', 'publication.id', '=', 'breeding.publication_id')
        .where('pet.id', petId)
        .andWhere('publication.particular_id', particular.id)
        .first();
  } else {
    const shelter = await connection('shelter')
        .where('user_account_id', userId)
        .first();

    if (shelter.id !== pet.shelter_id) {
      const error = new Error();
      error.status = 404;
      error.message = 'You do not own this pet';
      throw error;
    }

    petCanBeDeleted = await connection('pet')
        .join('adoption', 'pet.id', '=', 'adoption.pet_id')
        .where('pet.id', petId)
        .andWhere('adoption.shelter_id', shelter.id)
        .first();
  }


  if (petCanBeDeleted) {
    return false;
  } else {
    return true;
  }
};

exports.getPetsByShelterId = async (connection, shelterId) => {
  try {
    const res = [];
    let pets = [];
    pets = await connection('pet')
        .select('*')
        .where('pet.shelter_id', shelterId);
    res.push(...pets);
    if (!pets.length) {
      const error = new Error();
      error.status = 404;
      error.message = 'Este shelter no tiene ninguna mascota registrada.';
      throw error;
    }
    return pets;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
