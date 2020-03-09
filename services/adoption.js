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
      .limit(10).offset(10*page);

  return adoptions;
};

exports.createAdoption = async (adoptionData, adoptionPhotos, shelterId, trx) => {
  console.log('Hola 1');
  const animalPhotoName = path.join(ANIMAL_FOLDER, `${shelterId}-${new Date().getTime()}.${getExtension(adoptionPhotos.animal_photo.name)}`);
  const identificationPhotoName = path.join(IDENTIFICATION_FOLDER, `${shelterId}-${new Date().getTime()}.${getExtension(adoptionPhotos.identification_photo.name)}`);
  const vaccinePassportName = path.join(VACCINES_FOLDER, `${shelterId}-${new Date().getTime()}.${getExtension(adoptionPhotos.vaccine_passport.name)}`);

  console.log(animalPhotoName);
  console.log(identificationPhotoName);
  console.log(vaccinePassportName);

  savePhoto(adoptionPhotos.animal_photo, animalPhotoName);
  savePhoto(adoptionPhotos.identification_photo, identificationPhotoName);
  savePhoto(adoptionPhotos.vaccine_passport, vaccinePassportName);

  const pubData = {
    animal_photo: animalPhotoName,
    identification_photo: identificationPhotoName,
    document_status: 'In revision',
    transaction_status: 'In progress',
    title: adoptionData.title,
    vaccine_passport: vaccinePassportName,
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
