exports.up = (knex) => {
  return knex.schema
      .dropTableIfExists('shelter')
      .dropTableIfExists('actor')

      // actor
      .createTable('actor', function(table) {
        table.increments().primary();
        table.string('name', 100).notNullable();
        table.string('email_adress', 500).notNullable();
        table.string('adress', 500).notNullable();
        table.integer('telephone').notNullable();
        table.string('optional_photo', 500).nullable();
      })

      // shelter
      .createTable('shelter', function(table) {
        table.increments().primary();
        table.integer('actor_id').unsigned().notNullable();
        table.foreign('actor_id').references('id').inTable('actor');
      });
};

exports.down = (knex) => {
};
