exports.getPublications = async (connection, actorId) => {
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
      breedings = await connection('publication')
          .innerJoin('breeding', 'breeding.publication_id', '=', 'publication.id')
          .where('publication.particular_id', particular.id);
      adoptionsP = await connection('publication')
          .innerJoin('adoption', 'adoption.publication_id', '=', 'publication.id')
          .where('publication.particular_id', particular.id);
      publications.push(...breedings);
      publications.push(...adoptionsP);
    } else if (actor.role === 'shelter') {
      const shelter = await connection('shelter').where('shelter.user_account_id', actor.id).first();
      adoptionsS = await connection('adoption')
          .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
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
  try {
    const breedings = await connection('publication')
        .innerJoin('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where('publication.document_status', status);
    const adoptions = await connection('publication')
        .innerJoin('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where('publication.document_status', status);
    const publications = [];
    publications.push(...breedings);
    publications.push(...adoptions);
    console.log(publications);
    if (!breedings || !adoptions) {
      const error = new Error();
      error.status = 400;
      error.message = 'No publication in revision';
      throw error;
    }

    return publications;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
