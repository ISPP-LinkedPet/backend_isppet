const breedingFields = ['breeding.id',
  'publication_id',
  'particular_id',
  'creation_date',
  'animal_photo',
  'identification_photo',
  'document_status',
  'age',
  'genre',
  'breed',
  'transaction_status',
  'title',
  'price',
  'vaccine_passport'];

exports.getBreeding = async (connection, breedingId) => {
  const breeding = await connection('breeding')
      .select(breedingFields)
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where('breeding.id', breedingId)
      .first();

  if (!breeding) {
    const error = new Error();
    error.status = 400;
    error.message = 'No breeding with that ID';
    throw error;
  }

  return breeding;
};

exports.createBreeding = async (breedingData, particularId, trx) => {
  const pubData = {
    animal_photo: breedingData.animal_photo,
    identification_photo: breedingData.identification_photo,
    document_status: 'In revision',
    age: breedingData.age,
    genre: breedingData.genre,
    breed: breedingData.breed,
    transaction_status: 'In progress',
    title: breedingData.title,
    particular_id: particularId, // Hay que pillarlo
    vaccine_passport: breedingData.vaccine_passport,
  };

  const publicationId = await trx('publication').insert(pubData);
  const breedingId = await trx('breeding').insert({
    publication_id: publicationId,
    price: breedingData.price,
  });

  return await trx('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .select(breedingFields)
      .where({'breeding.id': breedingId})
      .first();
};

exports.getMyFavoriteBreedings = async (connection, userId) => {
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
};
