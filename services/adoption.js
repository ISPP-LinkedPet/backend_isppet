exports.getParticularAdoptions = async (connection, page) => {
  const adoptions = await connection('adoption')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .innerJoin('particular', 'particular.id', '=', 'publication.particular_id')
      .where('publication.transaction_status', 'Completed')
      .limit(10).offset(10*page);

  return adoptions;
};

exports.createAdoption = async (adoptionData, adoptionPhotos, shelterId, trx) => {
  const animalPhotoName = path.join(animalPhotosFolder, `${shelterId}-${new Date().getTime()}.${getExtension(adoptionPhotos.animal_photo.name)}`);
  const identificationPhotoName = path.join(identificationPhotosFolder, `${shelterId}-${new Date().getTime()}.${getExtension(adoptionPhotos.identification_photo.name)}`);
  const vaccinePassportName = path.join(vaccinesPassportFolder, `${shelterId}-${new Date().getTime()}.${getExtension(adoptionPhotos.vaccine_passport.name)}`);

  const pubData = {
    animal_photo: animalPhotoName,
    identification_photo: identificationPhotoName,
    document_status: 'In revision',
    transaction_status: 'In progress',
    title: breedingData.title,
    particular_id: shelterId,
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
  });

  return await trx('adoption')
      .join('publication', 'adoption.publication_id', '=', 'publication.id')
      .where({'adoption.id': adoptionId})
      .first();
};
