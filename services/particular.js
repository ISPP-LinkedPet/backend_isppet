exports.getParticular = async (connection, particularId) => {
  const particular = await connection('particular')
      .innerJoin('user_account', 'particular.user_account_id', '=', 'user_account.id')
      .where('particular.id', particularId)
      .first();

  if (!particular) {
    const error = new Error();
    error.status = 400;
    error.message = 'No particulars with that ID';
    throw error;
  }

  return particular;
};

