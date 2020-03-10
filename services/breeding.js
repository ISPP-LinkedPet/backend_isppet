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
};

exports.getMyFavoriteBreedings = async (connection, userId) => {
  const user = await connection('user_account').select('id')
      .where('user_account.id', userId).andWhere('user_account.role', 'particular').first();

  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const particular = await connection('particular').select('id')
      .where('user_account_id', userId).first();
  const breedings = await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('request', 'request.particular_id', '=', 'particular.id')
      .where('particular.id', particular.id)
      .andWhere('request.status', 'Pending');

  return breedings;
};

exports.getBreedingsOffers = async (breedingParams, connection, userId) => {
  const user = await connection('user_account').select('id')
      .where('user_account.id', userId).andWhere('user_account.role', 'particular').first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }
  const location = breedingParams.location;
  const age = breedingParams.age;
  const type = breedingParams.type;
  const breed = breedingParams.breed;
  const pedigree = breedingParams.pedigree;
  const breedings = await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where('publication.document_status', 'Accepted')
      .andWhere('publication.transaction_status', 'In progress').modify(function(queryBuilder) {
        if (location) {
          queryBuilder.andWhere('publication.location', 'like', `%${location}%`);
        }
        if (age) {
          queryBuilder.andWhere('publication.age', age);
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
  return breedings;
};
