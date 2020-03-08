exports.getParticularAdoptions = async (connection, page) => {
  const adoptions = await connection('adoption')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .innerJoin('particular', 'particular.id', '=', 'publication.particular_id')
      .where('publication.transaction_status', 'Completed')
      .limit(10).offset(10*page);

  return adoptions;
};

exports.getPendingAdoptions = async (connection, userId) => {
  const user = await connection('moderator').select('id').where({ user_account_id: userId }).first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const adoptions = await connection('adoption')
    .join('publication', 'adoption.publication_id', '=', 'publication.id')
    .where({ 'publication.document_status': 'In revision' });
  return adoptions;
};