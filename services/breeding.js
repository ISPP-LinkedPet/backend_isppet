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
    document_status: breedingData.document_status,
    age: breedingData.age,
    genre: breedingData.genre,
    breed: breedingData.breed,
    transaction_status: breedingData.transaction_status,
    title: breedingData.title,
  };

  const publicationId = await connection('publication').insert(pubData);
  const breedingId = await connection('breeding').insert({
    publication_id: publicationId,
    price: breedingData.price,
  });

  return await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where({'breeding.id': breedingId})
      .first();
};
