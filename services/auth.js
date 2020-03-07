exports.getUserLogin = async (connection, userName) =>{
  try {
    const rows = await connection('user_account')
        .select('user_account.id AS userId', 'user_account.role', 'user_account.password', 'user_account.activate')
        .where('user_account.user_name', userName);
    if (!rows.length) {
      const error = new Error();
      error.status = 404;
      error.message = 'Not found account';
      throw error;
    }
    if (rows[0].activate == 0) {
      const error = new Error();
      error.status = 400;
      error.message = 'Account desactivate';
      throw error;
    }

    return rows[0];
  } catch (error) {
    throw error;
  }
};
