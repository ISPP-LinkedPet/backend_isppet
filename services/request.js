exports.rejectRequest = async (trx, requestId, userId) => {
  const particular = await trx('particular').select('particular.id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('user_account.id', userId).first();
  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found particular';
    throw error;
  }

  // you only can reject request make to your publications
  const request = await trx('request')
      .select('request.id')
      .join('publication', 'publication.id', '=', 'request.publication_id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.id', requestId)
      .andWhere('request.status', 'Pending')
      .first();
  if (!request) {
    const error = new Error();
    error.status = 404;
    error.message = 'Request not found';
    throw error;
  }

  await trx('request').select('id').where('request.id', requestId).update({status: 'Rejected'});
};

exports.acceptRequest = async (trx, requestId, userId, publicationId) => {
  const particular = await trx('particular').select('particular.id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('user_account.id', userId).first();
  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found particular';
    throw error;
  }

  // you only can accept request make to your publications
  const request = await trx('request')
      .select('request.id')
      .join('publication', 'publication.id', '=', 'request.publication_id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.id', requestId)
      .andWhere('publication.id', publicationId)
      .andWhere('request.status', 'Pending')
      .first();
  if (!request) {
    const error = new Error();
    error.status = 404;
    error.message = 'Request not found';
    throw error;
  }
  const requestToReject = await trx('request')
      .select('request.id AS request_id')
      .join('publication', 'publication.id', '=', 'request.publication_id')
      .whereNot('request.id', requestId)
      .andWhere('publication.particular_id', particular.id)
      .andWhere('publication.id', publicationId);

  for (requestR of requestToReject) {
    await trx('request').select('id').where('request.id', requestR.request_id).update({status: 'Rejected'});
  }

  await trx('request').select('id').where('request.id', requestId).update({status: 'Accepted'});
};
