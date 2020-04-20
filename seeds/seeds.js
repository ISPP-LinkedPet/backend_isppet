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
  await knex('vet').del();
  await knex('user_account').del();
  await knex('pet').del();
  await knex.raw(`SET FOREIGN_KEY_CHECKS = 1;`);

  // user_account
  await knex('user_account').insert([
    // shelter
    {
      id: 1,
      user_name: 'admin',
      password: '200ceb26807d6bf99fd6f4f0d1ca54d4', // administrator
      role: 'administrator',
      activate: true,
      name: 'Admin',
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
};
