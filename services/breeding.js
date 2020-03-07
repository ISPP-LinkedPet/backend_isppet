exports.getBreeding = async (id, connection) => {
  const breeding = await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where({'breeding.id': id})
      .first();
  return breeding;
};

exports.createBreeding = async (breedingData, connection) => {
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

  const trx = await connection.transaction();

  const publicationId = await trx('publication').insert(pubData);
  const breedingId = await trx('breeding').insert({
    publication_id: publicationId,
    price: breedingData.price,
  });

  trx.commit();

  return await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where({'breeding.id': breedingId})
      .first();
};
