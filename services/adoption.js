const path = require('path');

const ANIMAL_FOLDER = path.join('images', 'animal_photos');
const IDENTIFICATION_FOLDER = path.join('images', 'identification_photos');
const VACCINES_FOLDER = path.join('images', 'vaccine_passports');

const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

exports.getParticularAdoptions = async (connection, page) => {
  const adoptions = await connection('adoption')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .innerJoin('particular', 'particular.id', '=', 'publication.particular_id')
      .where('publication.transaction_status', 'Completed')
      .limit(10)
      .offset(10 * page);

  return adoptions;
};

exports.createAdoption = async (
  adoptionData,
  adoptionPhotos,
  shelterId,
  trx,
) => {
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

    const pubData = {
      animal_photo: savedAnimalPhotos.join(','),
      identification_photo: savedIdentificationPhotos.join(','),
      document_status: 'In revision',
      transaction_status: 'In progress',
      title: adoptionData.title,
      vaccine_passport: savedVaccinePhotos.join(','),
      type: adoptionData.type,
      location: adoptionData.location,
      pedigree: adoptionData.pedigree,
    };

    const publicationId = await trx('publication').insert(pubData);
    const adoptionId = await trx('adoption').insert({
      publication_id: publicationId,
      name: adoptionData.name,
      taxes: adoptionData.taxes,
      shelter_id: shelterId,
    });

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
