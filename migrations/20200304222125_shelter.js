exports.up = function(knex) {
  const table = 'shelter';

  knex.schema.hasTable(table).then(function(exists) {
    const res = knex.schema;

    if (exists) {
      res.dropTable(table);
    }

    return res.createTable(table, function(table) {
      table.increments().primary();
      table
          .integer('actor_id')
          .unsigned()
          .notNullable();
      table
          .foreign('actor_id')
          .references('id')
          .inTable('actor');
    });
  });
};

exports.down = function(knex) {
  // return knex.schema.dropTable('actor');
};
