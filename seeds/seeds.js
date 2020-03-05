exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('request').del();
  await knex('shelter').del();
  await knex('administrator').del();
  await knex('publication').del();
  await knex('actor').del();
  await knex('user_account').del();

  // actor
  await knex('actor').insert([
    // shelter
    {id: 1, name: 'Ejemplo1', email_adress: 'ejemplo1@gmail.com', adress: 'Calle ejemplo 1', telephone: '954695241', optional_photo: 'http://www.ejemplo1.com/'},
    {id: 2, name: 'Ejemplo2', email_adress: 'ejemplo2@gmail.com', adress: 'Calle ejemplo 2', telephone: '954478512', optional_photo: null},
    {id: 3, name: 'Ejemplo3', email_adress: 'ejemplo3@gmail.com', adress: 'Calle ejemplo 3', telephone: '954896523', optional_photo: 'http://www.ejemplo3.com/'},
    // administrator
    {id: 4, name: 'Ejemplo4', email_adress: 'ejemplo4@gmail.com', adress: 'Calle ejemplo 4', telephone: '541236987', optional_photo: 'http://www.ejemplo4.com/'},
    {id: 5, name: 'Ejemplo5', email_adress: 'ejemplo5@gmail.com', adress: 'Calle ejemplo 5', telephone: '458963258', optional_photo: null},
    {id: 6, name: 'Ejemplo6', email_adress: 'ejemplo6@gmail.com', adress: 'Calle ejemplo 6', telephone: '496327851', optional_photo: 'http://www.ejemplo6.com/'},
    // moderator
    {id: 7, name: 'Ejemplo7', email_adress: 'ejemplo7@gmail.com', adress: 'Calle ejemplo 7', telephone: '785194638', optional_photo: 'http://www.ejemplo7.com/'},
    {id: 8, name: 'Ejemplo8', email_adress: 'ejemplo8@gmail.com', adress: 'Calle ejemplo 8', telephone: '824965327', optional_photo: null},
    {id: 9, name: 'Ejemplo9', email_adress: 'ejemplo9@gmail.com', adress: 'Calle ejemplo 9', telephone: '765285432', optional_photo: 'http://www.ejemplo9.com/'},
    // particular
    {id: 10, name: 'Ejemplo10', email_adress: 'ejemplo10@gmail.com', adress: 'Calle ejemplo 10', telephone: '765823954', optional_photo: 'http://www.ejemplo10.com/'},
    {id: 11, name: 'Ejemplo11', email_adress: 'ejemplo11@gmail.com', adress: 'Calle ejemplo 11', telephone: '496869357', optional_photo: null},
    {id: 12, name: 'Ejemplo12', email_adress: 'ejemplo12@gmail.com', adress: 'Calle ejemplo 12', telephone: '178523694', optional_photo: 'http://www.ejemplo12.com/'},
    // user_account
    {id: 13, name: 'Ejemplo13', email_adress: 'ejemplo13@gmail.com', adress: 'Calle ejemplo 13', telephone: '645823956', optional_photo: 'http://www.ejemplo13.com/'},
    {id: 14, name: 'Ejemplo14', email_adress: 'ejemplo14@gmail.com', adress: 'Calle ejemplo 14', telephone: '794658315', optional_photo: null},
    {id: 15, name: 'Ejemplo15', email_adress: 'ejemplo15@gmail.com', adress: 'Calle ejemplo 15', telephone: '359672184', optional_photo: 'http://www.ejemplo15.com/'},
  ]);

  // shelter
  await knex('shelter').insert([
    {id: 1, actor_id: 1},
    {id: 2, actor_id: 2},
    {id: 3, actor_id: 3},
  ]);

  // administrator
  await knex('administrator').insert([
    {id: 1, surname: 'Ejemplo 4', actor_id: 4},
    {id: 2, surname: 'Ejemplo 5', actor_id: 5},
    {id: 3, surname: 'Ejemplo 6', actor_id: 6},
  ]);

  // user_account
  await knex('user_account').insert([
    {id: 1, user_name: 'ejemplo1', password: 'ejemplo1', activate: true},
    {id: 2, user_name: 'ejemplo2', password: 'ejemplo2', activate: true},
    {id: 3, user_name: 'ejemplo3', password: 'ejemplo3', activate: false},
  ]);

  // request
  await knex('request').insert([
    {id: 1, status: 'Accepted'},
    {id: 2, status: 'In progress'},
    {id: 3, status: 'Completed'},
  ]);

  // publication
  await knex('publication').insert([
    {id: 1, animal_photo: 'http://www.ejemplo1.com/, http://www.ejemplo2.com/', identification_photo: 'http://www.ejemplo1.com/', location: 'Calle ejemplo 1', vaccine_passport: 'Vaccine passport 1'},
    {id: 2, animal_photo: 'http://www.ejemplo3.com/', identification_photo: 'http://www.ejemplo2.com/', location: 'Calle ejemplo 2', vaccine_passport: 'Vaccine passport 2'},
    {id: 3, animal_photo: 'http://www.ejemplo4.com/, http://www.ejemplo5.com/, http://www.ejemplo6.com/', identification_photo: 'http://www.ejemplo3.com/', location: 'Calle ejemplo 3', vaccine_passport: 'Vaccine passport 3'},
  ]);
};
