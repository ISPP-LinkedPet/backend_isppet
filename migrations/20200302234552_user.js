exports.up = function(knex) {
  const table = 'users';

  knex.schema.hasTable(table).then(function(exists) {
    const res = knex.schema;

    if (exists) {
      res.dropTable(table);
    }

    return res.createTable(table, function(table) {
      table.increments();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('updated_a3t').defaultTo(knex.fn.now());
    });
  });
};

exports.down = function(knex) {
};
