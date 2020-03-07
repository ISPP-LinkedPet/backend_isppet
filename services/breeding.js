exports.getBreeding = async (id, connection) => {
  const breeding = await connection('breeding').where({id});
  return breeding;
};

exports.getMyFavoriteBreedings = async (idAccount, connection) => {
  const user = await connection('particular').where({user_account_id: idAccount}).first();

  const breedings = await connection('breeding')
      .join('publication', 'breeding.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('request', 'request.particular_id', '=', 'particular.id')
      .where({'particular.id': user.id})
      .andWhere({'request.is_favorite': true});
  return breedings;
};
