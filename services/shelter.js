exports.getShelters = async (connection, page) => {
  const shelters = await connection('shelter').select('*')
      .innerJoin('user_account', 'shelter.user_account_id', '=', 'user_account.id')
      .innerJoin('adoption', 'shelter.adoption_id', '=', 'adoption.id')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .limit(10).offset(10*page);

  return shelters;
};
