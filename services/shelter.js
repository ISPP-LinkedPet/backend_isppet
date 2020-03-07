exports.getShelters = async (connection) => {
  const shelters = await connection('shelter').join('actor', 'shelter.actor_id', '=', 'actor.id')
      .join('adoption', 'shelter.adoption_id', '=', 'adoption.id').join('publication', 'adoption.publication_id', '=', 'publication.id');
  return shelters;
};
