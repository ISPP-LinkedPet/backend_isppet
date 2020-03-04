exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('shelter').del()
      .then(function() {
      // Inserts seed entries
        return knex('shelter').insert([
          {id: 1, actor_id: 1},
          {id: 2, actor_id: 2},
          {id: 3, actor_id: 3},
        ]);
      });
};
