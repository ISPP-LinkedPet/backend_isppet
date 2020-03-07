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

exports.getMyFavoriteBreedings = async (connection, userId) => {
  try {
    const user = await connection('particular').select('id').where({user_account_id: userId}).first();
    if (!user) {
      const error = new Error();
      error.status = 404;
      error.message = 'Not found user';
      throw error;
    }

    const breedings = await connection('breeding')
        .join('publication', 'breeding.publication_id', '=', 'publication.id')
        .join('particular', 'particular.id', '=', 'publication.particular_id')
        .join('request', 'request.particular_id', '=', 'particular.id')
        .where({'particular.id': user.id})
        .andWhere({'request.is_favorite': true});

    return breedings;
  } catch (error) {
    throw error;
  }
};
