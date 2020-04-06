exports.up = (knex) => {
  return (
    knex.schema
        .raw(`SET FOREIGN_KEY_CHECKS = 0;`)
        .dropTableIfExists('adoption')
        .dropTableIfExists('shelter')
        .dropTableIfExists('administrator')
        .dropTableIfExists('breeding')
        .dropTableIfExists('review')
        .dropTableIfExists('request')
        .dropTableIfExists('publication')
        .dropTableIfExists('particular')
        .dropTableIfExists('moderator')
        .dropTableIfExists('ad_suscription')
        .dropTableIfExists('vet')
        .dropTableIfExists('user_account')
        .dropTableIfExists('pet')
        .raw(`SET FOREIGN_KEY_CHECKS = 1;`)

    // user_account
        .createTable('user_account', function(table) {
          table.increments().primary();
          table
              .string('user_name', 100)
              .notNullable()
              .unique('user_name');
          table.enu('role', [
            'administrator',
            'moderator',
            'particular',
            'shelter',
          ]);
          table.string('password', 70).notNullable();
          table.boolean('activate').notNullable();
          table
              .timestamp('register_date')
              .defaultTo(knex.fn.now())
              .notNullable();
          table.string('name', 100).notNullable();
          table.string('email', 500).notNullable();
          table.string('address', 500).notNullable();
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
          table
              .enu('document_status', ['In revision', 'Accepted', 'Rejected'])
              .notNullable();
          table.date('birth_date');
          table.enu('genre', ['Male', 'Female']);
          table.string('breed', 100);
          table
              .enu('transaction_status', ['Offered', 'In payment', 'In progress', 'Awaiting payment', 'Completed', 'Reviewed'])
              .notNullable();
          table.string('type', 100);
          table.string('location', 500).notNullable();
          table.boolean('pedigree');
          table.integer('particular_id').unsigned();
          table
              .foreign('particular_id')
              .references('id')
              .inTable('particular');
        })

    // request
        .createTable('request', function(table) {
          table.increments().primary();
          table.enu('status', ['Pending', 'Accepted', 'Rejected']);
          table
              .integer('publication_id')
              .unsigned()
              .notNullable();
          table
              .foreign('publication_id')
              .references('id')
              .inTable('publication')
              .onDelete('CASCADE');
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
    // review
        .createTable('review', function(table) {
          table.increments().primary();
          table.integer('star').unsigned();
          table.string('review_description');
          table
              .integer('particular_id')
              .unsigned()
              .notNullable();
          table
              .foreign('particular_id')
              .references('id')
              .inTable('particular');
          table
              .integer('publication_id')
              .unsigned()
              .notNullable();
          table
              .foreign('publication_id')
              .references('id')
              .inTable('publication')
              .onDelete('CASCADE');
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
        })

    // adoption
        .createTable('adoption', function(table) {
          table.increments().primary();
          table.string('name').notNullable();
          table.double('taxes');
          table
              .integer('publication_id')
              .unsigned()
              .notNullable();
          table
              .foreign('publication_id')
              .references('id')
              .inTable('publication')
              .onDelete('CASCADE');
          table.integer('shelter_id').unsigned();
          table
              .foreign('shelter_id')
              .references('id')
              .inTable('shelter');
        })

    // vet
        .createTable('vet', function(table) {
          table.increments().primary();
          table.string('name', 100).notNullable();
          table.string('surname', 200).notNullable();
          table.string('email', 500).notNullable();
          table.string('url', 500);
          table.string('address', 500).notNullable();
          table.string('latitude', 500);
          table.string('longitude', 500);
          table.integer('telephone').notNullable();
          table.string('optional_photo', 500).nullable();
          table.boolean('is_premium');
        })

    // ad_suscription
        .createTable('ad_suscription', function(table) {
          table.increments().primary();
          table.integer('vet_id').unsigned().notNullable();
          table.foreign('vet_id').references('id').inTable('vet');
          table.string('top_banner', 500).notNullable();
          table.string('lateral_banner', 500).notNullable();
          table.enu('ad_type', ['DXC', 'CPM']).notNullable();
          table.double('price').notNullable();
          table.string('redirect_to', 500);
          table.boolean('active').notNullable();
          table.integer('view_count').unsigned().defaultTo(0);
          table.integer('click_count').unsigned().defaultTo(0);
        })

    // pet
        .createTable('pet', function(table) {
          table.increments().primary();
          table.string('animal_photo', 1000).notNullable();
          table.string('identification_photo', 200);
          table.string('vaccine_passport', 500);
          table.date('birth_date');
          table.enu('genre', ['Male', 'Female']);
          table.string('breed', 100);
          table.string('name', 100).notNullable();
          table.string('type', 100);
          table.boolean('pedigree');
          table
              .enu('pet_status', ['In revision', 'Accepted', 'Rejected'])
              .notNullable();
          table.integer('particular_id').unsigned();
          table
              .foreign('particular_id')
              .references('id')
              .inTable('particular');
        })
        // breeding
        .createTable('breeding', function(table) {
          table.increments().primary();
          table.double('price').notNullable();
          table.string('codenumber');
          table
              .integer('publication_id')
              .unsigned()
              .notNullable();
          table
              .integer('pet_id')
              .unsigned();
          table
              .foreign('pet_id')
              .references('id')
              .inTable('pet');
          table
              .foreign('publication_id')
              .references('id')
              .inTable('publication')
              .onDelete('CASCADE');
        })
  );
};

exports.down = (knex) => {};
