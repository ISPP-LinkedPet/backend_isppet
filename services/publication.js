const PARTICULAR_CONTACT_FIELDS = [
  'name',
  'surname',
  'email',
  'address',
  'telephone',
];

const SHELTER_CONTACT_FIELDS = [
  'user_account.name',
  'email',
  'address',
  'telephone',
];

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

exports.getCreatedAndAcceptedRequests = async (connection, userId) => {
  const particular = await connection('particular').select('id').where('user_account_id', userId).first();
  if (!particular) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const requests = await connection('request')
      .select('*', 'request.id as requestId', 'request.particular_id as requestUserId')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .where('request.particular_id', particular.id)
      .where('request.status', 'Accepted');

  const res = [];
  for (const request of requests) {
    const contactData = await getContactDataOfPublication(connection, request.publication_id);
    request.contactData = contactData;
    request.publicationType = await isBreedingOrAdoption(connection, request.publication_id);
    res.push(request);
  }

  return res;
};

exports.getReceivedAndAcceptedRequests = async (connection, user) => {
  // id del shelter o del particular (no es el id de la cuenta de usuario)
  let userId;
  if (user.role === 'particular') {
    userId = await connection('particular').select('id').where('user_account_id', user.id).first();
  } else {
    userId = await connection('shelter').select('id').where('user_account_id', user.id).first();
  }
  if (!userId) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  let requests;
  if (user.role === 'particular') {
    requests = await getReceivedAndAcceptedRequestsParticular(connection, userId.id);
  } else {
    requests = await getReceivedAndAcceptedRequestsShelter(connection, userId.id);
  }

  return requests;
};

const getReceivedAndAcceptedRequestsParticular = async (connection, particularId) => {
  const requests = await connection('request')
      .select('*', 'request.id as requestId')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particularId)
      .where('request.status', 'Accepted');

  const res = [];
  for (const request of requests) {
    const publicationType = await isBreedingOrAdoption(connection, request.publication_id);
    request.publicationType = publicationType;
    const contactData = await getContactDataOfRequest(connection, request.requestId);
    request.contactData = contactData;
    res.push(request);
  }

  return res;
};

const getReceivedAndAcceptedRequestsShelter = async (connection, shelterId) => {
  const requests = await connection('request')
      .select('*', 'request.id as requestId')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('adoption.shelter_id', shelterId)
      .where('request.status', 'Accepted');

  const res = [];
  for (const request of requests) {
    request.publicationType = 'adoption';
    const contactData = await getContactDataOfRequest(connection, request.requestId);
    request.contactData = contactData;
    res.push(request);
  }

  return res;
};

const isBreedingOrAdoption = async (connection, publicationId) => {
  let publication;
  publication = await connection('publication')
      .join('breeding', 'breeding.publication_id', '=', 'publication.id')
      .where('publication.id', publicationId)
      .first();
  if (publication) {
    return 'breeding';
  }

  publication = await connection('publication')
      .join('adoption', 'adoption.publication_id', '=', 'publication.id')
      .where('publication.id', publicationId)
      .first();
  if (publication) {
    return 'adoption';
  }

  return 'none';
};
exports.isBreedingOrAdoption = isBreedingOrAdoption;

const isParticularOrShelterAdoption = (adoption) => {
  if (adoption.shelter_id === null) {
    return 'particular';
  } else {
    return 'shelter';
  }
};

// datos de contacto del usuario que creó la publicación
const getContactDataOfPublication = async (connection, publicationId) => {
  // Vemos si es adopción o crianza
  const publicationType = await isBreedingOrAdoption(connection, publicationId);

  if (publicationType === 'breeding') {
    return await connection('particular')
        .select(PARTICULAR_CONTACT_FIELDS)
        .join('publication', 'particular.id', '=', 'publication.particular_id')
        .join('user_account', 'particular.user_account_id', '=', 'user_account.id')
        .where('publication.id', publicationId)
        .first();
  } else if (publicationType === 'adoption') {
    // Comprobamos si la adopción la creó un particular o un refugio
    const adoption = await connection('adoption')
        .where('adoption.publication_id', publicationId)
        .first();
    const adoptionType = isParticularOrShelterAdoption(adoption);
    if (adoptionType === 'shelter') {
      return await connection('shelter')
          .select(SHELTER_CONTACT_FIELDS)
          .join('adoption', 'adoption.shelter_id', '=', 'shelter.id')
          .join('user_account', 'shelter.user_account_id', '=', 'user_account.id')
          .where('adoption.id', adoption.id)
          .first();
    } else {
      return await connection('particular')
          .select(PARTICULAR_CONTACT_FIELDS)
          .join('publication', 'particular.id', '=', 'publication.particular_id')
          .join('user_account', 'particular.user_account_id', '=', 'user_account.id')
          .where('publication.id', publicationId)
          .first();
    }
  } else {
    const error = new Error();
    error.status = 404;
    error.message = `Error with publication ${publicationId}`;
    throw error;
  }
};

const getContactDataOfRequest = async (connection, requestId) => {
  // las requests solo las pueden hacer los particulares
  return await connection('particular')
      .select(PARTICULAR_CONTACT_FIELDS)
      .join('user_account', 'particular.user_account_id', '=', 'user_account.id')
      .join('request', 'request.particular_id', '=', 'particular.id')
      .where('request.id', requestId).first();
};


