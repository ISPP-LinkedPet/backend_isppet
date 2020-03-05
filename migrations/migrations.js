exports.up = (knex) => {
  return knex.schema
      .dropTableIfExists('request')
      .dropTableIfExists('shelter')
      .dropTableIfExists('administrator')
      .dropTableIfExists('publication')
      .dropTableIfExists('actor')
      .dropTableIfExists('user_account')

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
      })
      
      // administrator
      .createTable('administrator', function(table) {
        table.increments().primary();
        table.string('surname', 200).notNullable();
        table.integer('actor_id').unsigned().notNullable();
        table.foreign('actor_id').references('id').inTable('actor');
      })
      
      // user_account
      .createTable('user_account', function(table) {
        table.increments().primary();
        table.string('user_name', 100).notNullable();
        table.unique('user_name');
        table.string('password', 32).notNullable();
        table.boolean('activate').notNullable();
        table.timestamp('register_date').defaultTo(knex.fn.now()).notNullable();
      })
      
      // request
      .createTable('request', function(table) {
        table.increments().primary();
        table.enu('status', ['In revision', 'Accepted', 'Rejected', 'In progress', 'Completed']);
      })
      
      //publication
      .createTable('publication', function(table) {
        table.increments().primary();
        table.string('animal_photo', 1000).notNullable();
        table.timestamp('creation_date').defaultTo(knex.fn.now()).notNullable();
        table.string('identification_photo', 200);
        table.string('location', 500).notNullable();
        table.string('vaccine_passport', 500);
      });
};

exports.down = (knex) => {
};
