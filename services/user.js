

exports.getUser = async (connection, userId) => {
  const res = await connection('user_account')
      .where('user_account.id', userId)
      .first();
  if (!res) {
    const error = new Error();
    error.status = 400;
    error.message = 'No user with that ID';
    throw error;
  }

  return res;
};


