exports.getParticularAdoptions = async (connection, page) => {
  const adoptions = await connection('adoption')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .innerJoin('particular', 'particular.id', '=', 'publication.particular_id')
      .where('publication.transaction_status', 'Completed')
      .limit(10).offset(10*page);

  return adoptions;
};
