exports.up = function(knex) {
  const table = 'actor';

  knex.schema.hasTable(table).then(function(exists) {
    const res = knex.schema;

    if (exists) {
      res.dropTable(table);
    }

    return res.createTable(table, function(table) {
      table.increments().primary();
      table.string('name', 100).notNullable();
      table.string('email_adress', 500).notNullable();
      table.string('adress', 500).notNullable();
      table.integer('telephone').notNullable();
      table.string('optional_photo', 500).nullable();
    });
  });
};

exports.down = function(knex) {
  // return knex.schema.dropTable('actor');
};
