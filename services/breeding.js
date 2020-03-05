exports.getBreeding = async (id, connection) => {
  const breeding = await connection('breeding').where({id});
  return breeding;
};
