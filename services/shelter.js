exports.getShelters = async (connection, page) => {
  const shelters = await connection('shelter').select('*')
      .innerJoin('user_account', 'shelter.user_account_id', '=', 'user_account.id')
      .innerJoin('adoption', 'shelter.adoption_id', '=', 'adoption.id')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .limit(10).offset(10*page);

  return shelters;
};

exports.getShelter = async (connection, shelterId) => {
  const shelter = await connection('shelter')
      .innerJoin('user_account', 'shelter.user_account_id', '=', 'user_account.id')
      .where('shelter.id', shelterId)
      .first();

  if (!shelter) {
    const error = new Error();
    error.status = 400;
    error.message = 'No shelters with that ID';
    throw error;
  }

  return shelter;
};

