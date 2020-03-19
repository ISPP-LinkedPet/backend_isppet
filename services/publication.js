exports.getPublicationsByActorId = async (connection, actorId) => {
  try {
    const actor = await connection('user_account').where('user_account.id', actorId).first();

    if (!actor) {
      const error = new Error();
      error.status = 400;
      error.message = 'No actor with that ID';
      throw error;
    }

    const publications = [];
    let breedings = [];
    let adoptionsP = [];
    let adoptionsS = [];
    if (actor.role === 'particular') {
      const particular = await connection('particular').where('particular.user_account_id', actor.id).first();
      breedings = await connection('breeding').select('*', 'breeding.id as breeding_id')
          .join('publication', 'breeding.publication_id', '=', 'publication.id')
          .where('publication.particular_id', particular.id);
      adoptionsP = await connection('adoption').select('*', 'adoption.id as adoption_id')
          .join('publication', 'adoption.publication_id', '=', 'publication.id')
          .where('publication.particular_id', particular.id);
      publications.push(...breedings);
      publications.push(...adoptionsP);
    } else if (actor.role === 'shelter') {
      const shelter = await connection('shelter').where('shelter.user_account_id', actor.id).first();
      adoptionsS = await connection('adoption').select('*', 'adoption.id as adoption_id')
          .join('publication', 'adoption.publication_id', '=', 'publication.id')
          .where('adoption.shelter_id', shelter.id);
      publications.push(...adoptionsS);
    }

    return publications;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getPublicationsStatus = async (connection, status) => {
  const breedings = await connection('publication')
      .innerJoin('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where('publication.document_status', status);

  const adoptions = await connection('publication')
      .innerJoin('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('publication.document_status', status);

  const publications = [...breedings, ...adoptions];

  if (!breedings || !adoptions) {
    const error = new Error();
    error.status = 400;
    error.message = 'No publication in revision';
    throw error;
  }

  return publications;
};

exports.getPublication = async (connection, publicationId) => {
  const publication = await connection('publication')
      .where('id', publicationId)
      .first();

  if (!publication) {
    const error = new Error();
    error.status = 400;
    error.message = 'No publication with that ID';
    throw error;
  }

  return publication;
};

exports.getAcceptedRequestListByActorId = async (connection, userId) => {
  const particular = await connection('particular').select('particular.id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('user_account.id', userId).first();

  console.log('HOLA', particular.id);

  const acceptedRequest = await connection('publication')
      .join('request', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.status', 'Accepted');

  return acceptedRequest;
};

exports.getRejectedRequestListByActorId = async (connection, userId) => {
  const particular = await connection('particular').select('particular.id')
      .join('user_account', 'user_account.id', '=', 'particular.user_account_id')
      .where('user_account.id', userId).first();

  console.log('HOLA', particular.id);

  const acceptedRequest = await connection('publication')
      .join('request', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.status', 'Rejected');

  return acceptedRequest;
};

exports.getAcceptedRequestsToMyPublications = async (connection, userId) => {
  const actor = await connection('user_account').where('user_account.id', userId).first();
  if (!actor) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  let requests = [];
  if (actor.role === 'particular') {
    const user = await connection('particular').select('id').where('user_account_id', userId).first();
    requests = await connection('publication')
        .join('request', 'publication.id', '=', 'request.publication_id')
        .where('publication.particular_id', user.id)
        .andWhere('request.status', 'Accepted');
  } else if (actor.role === 'shelter') {
    const user = await connection('shelter').select('id').where('user_account_id', userId).first();
    requests = await connection('publication')
        .join('request', 'publication.id', '=', 'request.publication_id')
        .join('adoption', 'publication.id', '=', 'adoption.publication_id')
        .where('adoption.shelter_id', user.id)
        .andWhere('request.status', 'Accepted');
  }
  return requests;
};

exports.getPendingRequestsToMyPublications = async (connection, userId) => {
  const actor = await connection('user_account').where('user_account.id', userId).first();
  if (!actor) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  let requests = [];
  if (actor.role === 'particular') {
    const user = await connection('particular').select('id').where('user_account_id', userId).first();
    requests = await connection('publication')
        .join('request', 'publication.id', '=', 'request.publication_id')
        .where('publication.particular_id', user.id)
        .andWhere('request.status', 'Pending')
        .andWhere('publication.transaction_status', 'In progress');
  } else if (actor.role === 'shelter') {
    const user = await connection('shelter').select('id').where('user_account_id', userId).first();
    requests = await connection('publication')
        .join('request', 'publication.id', '=', 'request.publication_id')
        .join('adoption', 'publication.id', '=', 'adoption.publication_id')
        .where('adoption.shelter_id', user.id)
        .andWhere('request.status', 'Pending')
        .andWhere('publication.transaction_status', 'In progress');
  }
  return requests;
};
