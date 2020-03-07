exports.getMyFavoriteAdoptions = async (idAccount, connection) => {
  const user = await connection('particular').where({user_account_id: idAccount}).first();

  const adoptions = await connection('adoption')
      .join('publication', 'adoption.publication_id', '=', 'publication.id')
      .join('particular', 'particular.id', '=', 'publication.particular_id')
      .join('request', 'request.particular_id', '=', 'particular.id')
      .where({'particular.id': user.id})
      .andWhere({'request.is_favorite': true});
  return adoptions;
};
