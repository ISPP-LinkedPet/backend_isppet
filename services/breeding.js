exports.getBreeding = async (connection, breadingId) => {
  try {
    const breeding = await connection('breeding')
        .innerJoin('publication', 'breeding.publication_id', '=', 'publication.id')
        .where('breeding.id', breadingId)
        .first();

    if (!breeding) {
      const error = new Error();
      error.status = 400;
      error.message = 'No breeding with that ID';
      throw error;
    }

    return breeding;
  } catch (error) {
    throw error;
  }
};

exports.createBreeding = async (breedingData, trx) => {
  try {
    const pubData = {
      animal_photo: breedingData.animal_photo,
      identification_photo: breedingData.identification_photo,
      document_status: 'In revision',
      age: breedingData.age,
      genre: breedingData.genre,
      breed: breedingData.breed,
      transaction_status: 'In progress',
      title: breedingData.title,
      particular_id: 1, // Hay que pillarlo
      vaccine_passport: breedingData.vaccine_passport,
    };

    const publicationId = await trx('publication').insert(pubData);
    const breedingId = await trx('breeding').insert({
      publication_id: publicationId,
      price: breedingData.price,
    });

    return await trx('breeding')
        .join('publication', 'breeding.publication_id', '=', 'publication.id')
        .where({'breeding.id': breedingId})
        .first();
  } catch (error) {
    throw error;
  }
};
