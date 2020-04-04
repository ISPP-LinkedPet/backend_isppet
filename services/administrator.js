exports.banUser = async (connection, userId) => {
  const user = await this.getUserAccount(connection, userId);

  if (!user) {
    const error = new Error();
    error.status = 400;
    error.message = 'No user with that ID';
    throw error;
  }

  if (!user.activate) {
    const error = new Error();
    error.status = 400;
    error.message = 'This user has already been banned';
    throw error;
  }

  try {
    user.activate = false;
    await connection('user_account')
        .where({'user_account.id': userId})
        .update(user);

    return await connection('user_account')
        .where({'user_account.id': userId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.getUserAccount = async (connection, userId) => {
  const res = await connection('user_account')
      .where({'user_account.id': userId})
      .first();

  return res;
};

exports.unbanUser = async (connection, userId) => {
  const user = await this.getUserAccount(connection, userId);

  if (!user) {
    const error = new Error();
    error.status = 400;
    error.message = 'No user with that ID';
    throw error;
  }

  if (user.activate) {
    const error = new Error();
    error.status = 400;
    error.message = 'This user has already been unbanned';
    throw error;
  }

  try {
    user.activate = true;
    await connection('user_account')
        .where({'user_account.id': userId})
        .update(user);

    return await connection('user_account')
        .where({'user_account.id': userId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.getUserAccount = async (connection, userId) => {
  const res = await connection('user_account')
      .where({'user_account.id': userId})
      .first();

  return res;
};

exports.getBanUsers = async (connection, userId) => {
  const user = await connection('administrator')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const banUsers = await connection('user_account')
      .where({'user_account.activate': false});
  return banUsers;
};

exports.getUnbanUsers = async (connection, userId) => {
  const user = await connection('administrator')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const unbanUsers = await connection('user_account')
      .where({'user_account.activate': true});
  return unbanUsers;
};

exports.makeVetPremium = async (trx, vetId) => {
  const vet = await trx('vet').where('vet.id', vetId).andWhere('vet.is_premium', 0).first();
  console.log(vet)
  if (!vet) {
    const error = new Error();
    error.status = 400;
    error.message = 'This vet is already premium';
    throw error;
  }

  const makeVetPremium = await trx('vet').where('vet.id', vetId).update({is_premium: 1});
  if (!makeVetPremium) {
    const error = new Error();
    error.status = 403;
    error.message = 'Not make premium';
    throw error;
  }
};

exports.cancelVetPremium = async (trx, vetId) => {

  const vet = await trx('vet').where('vet.id', vetId).andWhere('vet.is_premium', 1).first();
  console.log(vet)
  if (!vet) {
    const error = new Error();
    error.status = 403;
    error.message = 'This vet is not premium, so you cannot cancel';
    throw error;
  }

  const cancelVetPremium = await trx('vet').where('vet.id', vetId).update({is_premium: 0});
  if (!cancelVetPremium) {
    const error = new Error();
    error.status = 403;
    error.message = 'Not cancel';
    throw error;
  }
};

