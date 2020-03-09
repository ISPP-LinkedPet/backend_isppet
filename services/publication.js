exports.getPublications = async (connection, actorId) => {
  try {
    const breedings = await connection('publication')
        .innerJoin('breeding', 'breeding.publication_id', '=', 'publication.id')
        .where('publication.particular_id', actorId);
    const adoptionsP = await connection('publication')
        .innerJoin('adoption', 'adoption.publication_id', '=', 'publication.id')
        .where('publication.particular_id', actorId);
    const adoptionsS = await connection('adoption')
        .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
        .where('adoption.shelter_id', actorId);
    const publications = [];
    publications.push(...breedings);
    publications.push(...adoptionsP);
    publications.push(...adoptionsS);
    if (!breedings || !adoptionsP || !adoptionsS) {
      const error = new Error();
      error.status = 400;
      error.message = 'No actor with that ID';
      throw error;
    }

    return publications;
  } catch (error) {
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
    throw error;
  }
};