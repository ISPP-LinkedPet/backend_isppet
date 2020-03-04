
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del().then(() => {
    // Inserts seed entries
    return knex('users').insert([
      {id: 1},
      {id: 2},
      {id: 3},
    ]);
  });
};
