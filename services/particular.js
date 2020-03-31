const REVIEW_FIELDS = [
  'user_account_id',
  'particular.id',
  'surname',
  'user_account.name',
  'user_account.user_name',
  'user_account.role',
  'user_account.name',
  'user_account.register_date',
  'user_account.address',
  'user_account.optional_photo',
];

exports.getParticular = async (connection, particularId) => {
  const particular = await connection('particular')
      .select(REVIEW_FIELDS)
      .join('user_account', 'particular.user_account_id', '=', 'user_account.id')
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
exports.hasRequestFrom = async (connection, userId, particularId) => {
  let hasRequest = false;
  const particular = await connection('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (particular == undefined) {
    const error = new Error();
    error.status = 404;
    error.message = 'Particular not found';
    throw error;
  }

  const request = await connection('request')
      .select('*')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.status', 'Pending')
      .andWhere('request.particular_id', particularId);

  const request1 = await connection('request')
      .select('*')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.status', 'Accepted')
      .andWhere('request.particular_id', particularId);

  if (request.length || request1.length) {
    hasRequest = true;
  }

  return hasRequest;
};
