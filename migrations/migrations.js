exports.up = knex => {
  return (
    knex.schema
      .dropTableIfExists("shelter")
      .dropTableIfExists("administrator")
      .dropTableIfExists("adoption")
      .dropTableIfExists("breeding")
      .dropTableIfExists("particular")
      .dropTableIfExists("request")
      .dropTableIfExists("publication")
      .dropTableIfExists("moderator")
      .dropTableIfExists("vet")
      .dropTableIfExists("actor")
      .dropTableIfExists("user_account")

      // user_account
      .createTable("user_account", function(table) {
        table.increments().primary();
        table.string("user_name", 100).notNullable();
        table.unique("user_name");
        table.string("password", 32).notNullable();
        table.boolean("activate").notNullable();
        table
          .timestamp("register_date")
          .defaultTo(knex.fn.now())
          .notNullable();
      })

      // actor
      .createTable("actor", function(table) {
        table.increments().primary();
        table.string("name", 100).notNullable();
        table.string("email_adress", 500).notNullable();
        table.string("adress", 500).notNullable();
        table.integer("telephone").notNullable();
        table.string("optional_photo", 500).nullable();
        table
          .integer("user_account_id")
          .unsigned()
          .notNullable();
        table
          .foreign("user_account_id")
          .references("id")
          .inTable("user_account");
        table.unique("user_account_id");
      })

      // administrator
      .createTable("administrator", function(table) {
        table.increments().primary();
        table.string("surname", 200).notNullable();
        table
          .integer("actor_id")
          .unsigned()
          .notNullable();
        table
          .foreign("actor_id")
          .references("id")
          .inTable("actor");
      })

      //publication
      .createTable("publication", function(table) {
        table.increments().primary();
        table.string("animal_photo", 1000).notNullable();
        table
          .timestamp("creation_date")
          .defaultTo(knex.fn.now())
          .notNullable();
        table.string("identification_photo", 200);
        table.string("vaccine_passport", 500);
        table.enu("document_status", ["In revision", "Accepted", "Rejected"]);
        table.integer("age");
        table.enu("genre", ["Male", "Female"]);
        table.string("breed", 100);
        table.enu("transaction_status", ["In progress", "Completed"]);
        table.string("title", 500);
      })

      // request
      .createTable("request", function(table) {
        table.increments().primary();
        table.enu("status", [
          "Pending",
          "Accepted",
          "Rejected",
          "Favorite"
        ]);
        table.boolean("is_favorite");
        table
          .integer("publication_id")
          .unsigned()
          .notNullable();
        table
          .foreign("publication_id")
          .references("id")
          .inTable("publication");
        table.unique("publication_id");
      })

      // particular
      .createTable("particular", function(table) {
        table.increments().primary();
        table.string("surname", 100);
        table
          .integer("actor_id")
          .unsigned()
          .notNullable();
        table
          .foreign("actor_id")
          .references("id")
          .inTable("actor");
        table
          .integer("publication_id")
          .unsigned()
          .notNullable();
        table
          .foreign("publication_id")
          .references("id")
          .inTable("publication");
        table.unique("publication_id");
        table
          .integer("request_id")
          .unsigned()
          .notNullable();
        table
          .foreign("request_id")
          .references("id")
          .inTable("request");
        table.unique("request_id");
      })

      // moderator
      .createTable("moderator", function(table) {
        table.increments().primary();
        table.string("surname", 100);
        table
          .integer("actor_id")
          .unsigned()
          .notNullable();
        table
          .foreign("actor_id")
          .references("id")
          .inTable("actor");
      })

      // breeding
      .createTable("breeding", function(table) {
        table.increments().primary();
        table.double("price").notNullable();
        table
          .integer("publication_id")
          .unsigned()
          .notNullable();
        table
          .foreign("publication_id")
          .references("id")
          .inTable("publication");
      })

      // adoption
      .createTable("adoption", function(table) {
        table.increments().primary();
        table.string("name");
        table.double("taxes").notNullable();
        table
          .integer("publication_id")
          .unsigned()
          .notNullable();
        table
          .foreign("publication_id")
          .references("id")
          .inTable("publication");
      })

      // shelter
      .createTable("shelter", function(table) {
        table.increments().primary();
        table
          .integer("actor_id")
          .unsigned()
          .notNullable();
        table
          .foreign("actor_id")
          .references("id")
          .inTable("actor");
        table
          .integer("adoption_id")
          .unsigned()
          .notNullable();
        table
          .foreign("adoption_id")
          .references("id")
          .inTable("adoption");
        table.unique("adoption_id");
      })

      // vet
      .createTable("vet", function(table) {
        table.increments().primary();
        table.string("surname", 200).notNullable();
        table.boolean("is_premium");
        table
          .integer("actor_id")
          .unsigned()
          .notNullable();
        table
          .foreign("actor_id")
          .references("id")
          .inTable("actor");
      })
  );
};

exports.down = knex => {};
