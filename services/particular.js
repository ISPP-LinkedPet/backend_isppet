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
