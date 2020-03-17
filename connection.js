// database
module.exports = () => {
  const knex = require('knex')({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_SCHEMA,
    },
    pool: {
      min: 0,
      max: 5,
      idleTimeoutMillis: 5000,
    },
  });
  return knex;
};
