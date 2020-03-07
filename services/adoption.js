exports.getParticularAdoptions = async (connection) => {
  const adoptions = await connection('adoption').join('publication', 'adoption.publication_id', '=', 'publication.id')
      .join('particular', 'particular.publication_id', '=', 'publication.id')
      .where({'publication.transaction_status': 'Completed'});
  return adoptions;
};
