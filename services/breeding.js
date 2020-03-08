exports.getBreeding = async (id, connection) => {
  const breeding = await connection('breeding').where({id});
  return breeding;
};

exports.getBreedingsOffers = async (connection) => {
  const breedings = await connection('breeding').join('publication', 'breeding.publication_id', '=', 'publication.id').where({'publication.document_status': 'Accepted'}).andWhere({'publication.transaction_status': 'In progress'});
  return breedings;
};
