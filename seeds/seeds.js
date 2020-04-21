/* eslint-disable max-len */
exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex.raw(`SET FOREIGN_KEY_CHECKS = 0;`);
  await knex('shelter').del();
  await knex('adoption').del();
  await knex('administrator').del();
  await knex('breeding').del();
  await knex('review').del();
  await knex('request').del();
  await knex('publication').del();
  await knex('particular').del();
  await knex('moderator').del();
  await knex('ad_suscription').del();
  await knex('vet').del();
  await knex('user_account').del();
  await knex('pet').del();
  await knex.raw(`SET FOREIGN_KEY_CHECKS = 1;`);

  // user_account
  await knex('user_account').insert([
    {
      id: 1,
      user_name: 'admin',
      password: '$2y$12$tXf2LZPRnf7Qs9KhmnUbKei0ipe4QVaANIgQ3Ai63b4f0bmK5REi2', // administrator
      role: 'administrator',
      activate: true,
      name: 'Admin',
      email: 'linkedpet2020@gmail.com',
      address: 'Escuela Técnica Superior de Ingeniería Informática, Universidad de Sevilla, 41012 Sevilla',
      telephone: '954556817',
      optional_photo: null,
    },
    {
      id: 2,
      user_name: 'validator',
      password: '$2y$12$H1orqC6jOUV2/sQeXXSNr.CYXEDf5CyO5wCO08ODkimwq.QUQ5XCK', // validator
      role: 'moderator',
      activate: true,
      name: 'Validator',
      email: 'linkedpet2020@gmail.com',
      address: 'Escuela Técnica Superior de Ingeniería Informática, Universidad de Sevilla, 41012 Sevilla',
      telephone: '954556817',
      optional_photo: null,
    },
  ]);

  // administrator
  await knex('administrator').insert([
    {id: 1, surname: 'Admin', user_account_id: 1},
  ]);

  // moderator
  await knex('moderator').insert([
    {id: 1, surname: 'Validator', user_account_id: 2},
  ]);
};
