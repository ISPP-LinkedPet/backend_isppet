const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const ANIMAL_FOLDER = path.join('images', 'animal_photos');
const IDENTIFICATION_FOLDER = path.join('images', 'identification_photos');
const VACCINES_FOLDER = path.join('images', 'vaccine_passports');

const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

exports.createPet = async (petName, petPhotos, userId, trx) => {
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
        'It is required to upload at least two photos of the animal';
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

    // Get particular by user account id
    const particular = await trx('particular')
        .select('id')
        .where('user_account_id', userId)
        .first();

    // Some values are not required during creation
    // Moderators will modify the pet publication
    const newPetData = {
      animal_photo: savedAnimalPhotos.join(','),
      identification_photo: savedIdentificationPhotos.join(','),
      vaccine_passport: savedVaccinePhotos.join(','),
      birth_date: null,
      genre: null,
      breed: null,
      type: null,
      pedigree: null,
      name: petName.name,
      pet_status: 'In revision',
      particular_id: particular.id,
    };

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

exports.editPet = async (petName, petPhotos, petId, userId, trx) => {
  // Se comprueba que este editando un pet propio
  const pet = await trx('pet')
      .select('*', 'user_account.id AS userId')
      .join('particular', 'particular.id', '=', 'pet.particular_id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('pet.id', petId)
      .first();

  const publication = await trx('publication')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where('breeding.pet_id', pet.id)
      .first();


  if (publication) {
    const error = new Error();
    error.status = 404;
    error.message = 'You cannot edit a pet with publications';
    throw error;
  }

  if (!pet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Pet not found';
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
          'It is required to upload at least two photos of the animal';
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
          'It is required to upload at least one identification photo';
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
          'It is required to upload at least one photo of the vaccine passport';
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

    if (petName.name) {
      editPetData.name = petName.name;
    }

    if (pet.pet_status !== 'In revision') {
      editPetData.breed = null;
      editPetData.type = null;
      editPetData.birth_date = null;
      editPetData.pedigree = null;
      editPetData.genre = null;
      editPetData.pet_status = 'In revision';
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
    error.message = 'No valid extension';
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
    error.message = 'Pet not found';
    throw error;
  }
  if (pet.pet_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not accept a pet which is not in revision';
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
    error.message = 'Pet not found';
    throw error;
  }
  if (pet.pet_status !== 'In revision') {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not reject a pet which is not in revision';
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
exports.getPetsByParticularId = async (connection, particularId) => {
  try {
    const res = [];
    let pets = [];
    pets = await connection('pet')
        .select('*')
        .where('pet.particular_id', particularId);
    res.push(...pets);
    if (!pets.length) {
      const error = new Error();
      error.status = 404;
      error.message = 'Este particular no tiene ninguna mascota registrada.';
      throw error;
    }
    return pets;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
