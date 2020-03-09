exports.getBreeding = async (id, connection) => {
  const breeding = await connection('breeding').where({id});
  return breeding;
};

exports.getBreedingsOffers = async (breedingParams, connection) => {
  const location = breedingParams.location;
  const age = breedingParams.age;
  const type = breedingParams.type;
  const breed = breedingParams.breed;
  const pedigree = breedingParams.pedigree;
  const breedings = await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .where({'publication.document_status': 'Accepted'})
      .andWhere({'publication.transaction_status': 'In progress'}).modify(function(queryBuilder) {
        if (location) {
          queryBuilder.andWhere('publication.location', 'like', `%${location}%`);
        }
        if (age) {
          queryBuilder.andWhere({'publication.age': age});
        }
        if (type) {
          queryBuilder.andWhere('publication.type', 'like', `%${type}%`);
        }
        if (breed) {
          queryBuilder.andWhere('publication.breed', 'like', `%${breed}%`);
        }
        if (pedigree) {
          queryBuilder.andWhere({'publication.pedigree': pedigree});
        }
      });
  return breedings;
};
