exports.getPublications = async (connection, actorId) => {
  try {
    const publications = await connection('publication')
        .innerJoin('publication', 'breeding.publication_id', '=', 'publication.id')
        .where('publication.id', publicationId)
        .first();

    if (!publications) {
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
