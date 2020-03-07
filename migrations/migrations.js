exports.up = (knex) => {
  return (
    knex.schema
        .dropTableIfExists('shelter')
        .dropTableIfExists('administrator')
        .dropTableIfExists('adoption')
        .dropTableIfExists('breeding')
        .dropTableIfExists('request')
        .dropTableIfExists('publication')
        .dropTableIfExists('particular')
        .dropTableIfExists('moderator')
        .dropTableIfExists('vet')
        .dropTableIfExists('user_account')

    // user_account
        .createTable('user_account', function(table) {
          table.increments().primary();
          table.string('user_name', 100).notNullable();
          table.unique('user_name');
          table.enu('role', ['administrator', 'moderator', 'particular', 'vet', 'shelter']);
          table.string('password', 32).notNullable();
          table.boolean('activate').notNullable();
          table
              .timestamp('register_date')
              .defaultTo(knex.fn.now())
              .notNullable();
          table.string('name', 100).notNullable();
          table.string('email_adress', 500).notNullable();
          table.string('adress', 500).notNullable();
          table.integer('telephone').notNullable();
          table.string('optional_photo', 500).nullable();
        })

    // administrator
        .createTable('administrator', function(table) {
          table.increments().primary();
          table.string('surname', 200).notNullable();
          table
              .integer('user_account_id')
              .unsigned()
              .notNullable();
          table
              .foreign('user_account_id')
              .references('id')
              .inTable('user_account');
        })

    // particular
        .createTable('particular', function(table) {
          table.increments().primary();
          table.string('surname', 100);
          table
              .integer('user_account_id')
              .unsigned()
              .notNullable();
          table
              .foreign('user_account_id')
              .references('id')
              .inTable('user_account');
        })

    // publication
        .createTable('publication', function(table) {
          table.increments().primary();
          table.string('animal_photo', 1000).notNullable();
          table
              .timestamp('creation_date')
              .defaultTo(knex.fn.now())
              .notNullable();
          table.string('identification_photo', 200);
          table.string('vaccine_passport', 500);
          table.enu('document_status', ['In revision', 'Accepted', 'Rejected']);
          table.integer('age');
          table.enu('genre', ['Male', 'Female']);
          table.string('breed', 100);
          table.enu('transaction_status', ['In progress', 'Completed']);
          table.string('title', 500);
          table
              .integer('particular_id')
              .unsigned()
              .notNullable();
          table
              .foreign('particular_id')
              .references('id')
              .inTable('particular');
        })

    // request
        .createTable('request', function(table) {
          table.increments().primary();
          table.enu('status', ['Pending', 'Accepted', 'Rejected', 'Favorite']);
          table.boolean('is_favorite');
          table
              .integer('publication_id')
              .unsigned()
              .notNullable();
          table
              .foreign('publication_id')
              .references('id')
              .inTable('publication');
          table.unique('publication_id');
          table
              .integer('particular_id')
              .unsigned()
              .notNullable();
          table
              .foreign('particular_id')
              .references('id')
              .inTable('particular');
        })

    // moderator
        .createTable('moderator', function(table) {
          table.increments().primary();
          table.string('surname', 100);
          table
              .integer('user_account_id')
              .unsigned()
              .notNullable();
          table
              .foreign('user_account_id')
              .references('id')
              .inTable('user_account');
        })

    // breeding
        .createTable('breeding', function(table) {
          table.increments().primary();
          table.double('price').notNullable();
          table
              .integer('publication_id')
              .unsigned()
              .notNullable();
          table
              .foreign('publication_id')
              .references('id')
              .inTable('publication');
        })

    // adoption
        .createTable('adoption', function(table) {
          table.increments().primary();
          table.string('name');
          table.double('taxes').notNullable();
          table
              .integer('publication_id')
              .unsigned()
              .notNullable();
          table
              .foreign('publication_id')
              .references('id')
              .inTable('publication');
        })

    // shelter
        .createTable('shelter', function(table) {
          table.increments().primary();
          table
              .integer('user_account_id')
              .unsigned()
              .notNullable();
          table
              .foreign('user_account_id')
              .references('id')
              .inTable('user_account');
          table
              .integer('adoption_id')
              .unsigned()
              .notNullable();
          table
              .foreign('adoption_id')
              .references('id')
              .inTable('adoption');
          table.unique('adoption_id');
        })

    // vet
        .createTable('vet', function(table) {
          table.increments().primary();
          table.string('surname', 200).notNullable();
          table.boolean('is_premium');
          table
              .integer('user_account_id')
              .unsigned()
              .notNullable();
          table
              .foreign('user_account_id')
              .references('id')
              .inTable('user_account');
        })
  );
};

exports.down = (knex) => {};
