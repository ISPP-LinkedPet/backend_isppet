exports.rejectRequest = async (trx, requestId, userId) => {
  const particular = await trx('particular')
      .select('particular.id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('user_account.id', userId)
      .first();
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

  await trx('request')
      .select('id')
      .where('request.id', requestId)
      .update({status: 'Rejected'});
};

exports.acceptRequest = async (trx, requestId, userId, publicationId) => {
  const particular = await trx('particular')
      .select('particular.id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('user_account.id', userId)
      .first();
  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found particular';
    throw error;
  }

  // publication must be in "Offered" status
  const publication = await trx('publication')
      .where('publication.id', publicationId)
      .andWhere('publication.transaction_status', 'Offered')
      .andWhere('publication.document_status', 'Accepted');
  if (!publication) {
    const error = new Error();
    error.status = 404;
    error.message = 'Publication not Valid';
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

  for (const requestR of requestToReject) {
    await trx('request')
        .select('id')
        .where('request.id', requestR.request_id)
        .update({status: 'Rejected'});
  }

  await trx('request')
      .select('id')
      .where('request.id', requestId)
      .update({status: 'Accepted'});

  // change publication status
  await trx('publication')
      .where('publication.id', publicationId)
      .update({transaction_status: 'In payment'});
};
exports.hasRequest = async (connection, userId, requestId) => {
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
      .select('*', 'request.id as request_id')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.status', 'Pending')
      .andWhere('request.id', requestId);

  if (request.length) {
    hasRequest = true;
  }

  return hasRequest;
};

exports.deleteRequest = async (requestId, userId, trx) => {
  const particular = await trx('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Particular not found';
    throw error;
  }

  const request = await trx('request')
      .where('request.id', requestId)
      .first();

  if (!request) {
    const error = new Error();
    error.status = 404;
    error.message = 'Request not found';
    throw error;
  }
 console.log(particular);
 console.log(request);
  if (request.particular_id !== particular.id) {
    const error = new Error();
    error.status = 404;
    error.message = 'You do not own this request';
    throw error;
  }

  if (request.status === 'Accepted') {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not delete an accepted request';
    throw error;
  }

  await trx('request')
      .where('request.id', request.id)
      .del();

  return true;
};
