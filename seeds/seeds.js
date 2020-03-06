exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('shelter').del();
  await knex('administrator').del();
  await knex('adoption').del();
  await knex('breeding').del();
  await knex('request').del();
  await knex('publication').del();
  await knex('particular').del();
  await knex('moderator').del();
  await knex('vet').del();
  await knex('actor').del();
  await knex('user_account').del();

  // user_account
  await knex('user_account').insert([
    {id: 1, user_name: 'ejemplo1', password: 'ejemplo1', activate: true},
    {id: 2, user_name: 'ejemplo2', password: 'ejemplo2', activate: true},
    {id: 3, user_name: 'ejemplo3', password: 'ejemplo3', activate: false},
    {id: 4, user_name: 'ejemplo4', password: 'ejemplo4', activate: true},
    {id: 5, user_name: 'ejemplo5', password: 'ejemplo5', activate: true},
    {id: 6, user_name: 'ejemplo6', password: 'ejemplo6', activate: false},
    {id: 7, user_name: 'ejemplo7', password: 'ejemplo7', activate: true},
    {id: 8, user_name: 'ejemplo8', password: 'ejemplo8', activate: true},
    {id: 9, user_name: 'ejemplo9', password: 'ejemplo9', activate: false},
    {id: 10, user_name: 'ejemplo10', password: 'ejemplo10', activate: true},
    {id: 11, user_name: 'ejemplo11', password: 'ejemplo11', activate: true},
    {id: 12, user_name: 'ejemplo12', password: 'ejemplo12', activate: false},
    {id: 13, user_name: 'ejemplo13', password: 'ejemplo13', activate: true},
    {id: 14, user_name: 'ejemplo14', password: 'ejemplo14', activate: true},
    {id: 15, user_name: 'ejemplo15', password: 'ejemplo15', activate: false},
    {id: 16, user_name: 'ejemplo16', password: 'ejemplo16', activate: true},
    {id: 17, user_name: 'ejemplo17', password: 'ejemplo17', activate: true},
    {id: 18, user_name: 'ejemplo18', password: 'ejemplo18', activate: false},
  ]);

  // actor
  await knex('actor').insert([
    // shelter
    {
      id: 1,
      name: 'Ejemplo1',
      email_adress: 'ejemplo1@gmail.com',
      adress: 'Calle ejemplo 1',
      telephone: '954695241',
      optional_photo: 'http://www.ejemplo1.com/',
      user_account_id: 1,
    },
    {
      id: 2,
      name: 'Ejemplo2',
      email_adress: 'ejemplo2@gmail.com',
      adress: 'Calle ejemplo 2',
      telephone: '954478512',
      optional_photo: null,
      user_account_id: 2,
    },
    {
      id: 3,
      name: 'Ejemplo3',
      email_adress: 'ejemplo3@gmail.com',
      adress: 'Calle ejemplo 3',
      telephone: '954896523',
      optional_photo: 'http://www.ejemplo3.com/',
      user_account_id: 3,
    },
    // administrator
    {
      id: 4,
      name: 'Ejemplo4',
      email_adress: 'ejemplo4@gmail.com',
      adress: 'Calle ejemplo 4',
      telephone: '541236987',
      optional_photo: 'http://www.ejemplo4.com/',
      user_account_id: 4,
    },
    {
      id: 5,
      name: 'Ejemplo5',
      email_adress: 'ejemplo5@gmail.com',
      adress: 'Calle ejemplo 5',
      telephone: '458963258',
      optional_photo: null,
      user_account_id: 5,
    },
    {
      id: 6,
      name: 'Ejemplo6',
      email_adress: 'ejemplo6@gmail.com',
      adress: 'Calle ejemplo 6',
      telephone: '496327851',
      optional_photo: 'http://www.ejemplo6.com/',
      user_account_id: 6,
    },
    // moderator
    {
      id: 7,
      name: 'Ejemplo7',
      email_adress: 'ejemplo7@gmail.com',
      adress: 'Calle ejemplo 7',
      telephone: '785194638',
      optional_photo: 'http://www.ejemplo7.com/',
      user_account_id: 7,
    },
    {
      id: 8,
      name: 'Ejemplo8',
      email_adress: 'ejemplo8@gmail.com',
      adress: 'Calle ejemplo 8',
      telephone: '824965327',
      optional_photo: null,
      user_account_id: 8,
    },
    {
      id: 9,
      name: 'Ejemplo9',
      email_adress: 'ejemplo9@gmail.com',
      adress: 'Calle ejemplo 9',
      telephone: '765285432',
      optional_photo: 'http://www.ejemplo9.com/',
      user_account_id: 9,
    },
    // particular
    {
      id: 10,
      name: 'Ejemplo10',
      email_adress: 'ejemplo10@gmail.com',
      adress: 'Calle ejemplo 10',
      telephone: '765823954',
      optional_photo: 'http://www.ejemplo10.com/',
      user_account_id: 10,
    },
    {
      id: 11,
      name: 'Ejemplo11',
      email_adress: 'ejemplo11@gmail.com',
      adress: 'Calle ejemplo 11',
      telephone: '496869357',
      optional_photo: null,
      user_account_id: 11,
    },
    {
      id: 12,
      name: 'Ejemplo12',
      email_adress: 'ejemplo12@gmail.com',
      adress: 'Calle ejemplo 12',
      telephone: '178523694',
      optional_photo: 'http://www.ejemplo12.com/',
      user_account_id: 12,
    },
    // user_account
    {
      id: 13,
      name: 'Ejemplo13',
      email_adress: 'ejemplo13@gmail.com',
      adress: 'Calle ejemplo 13',
      telephone: '645823956',
      optional_photo: 'http://www.ejemplo13.com/',
      user_account_id: 13,
    },
    {
      id: 14,
      name: 'Ejemplo14',
      email_adress: 'ejemplo14@gmail.com',
      adress: 'Calle ejemplo 14',
      telephone: '794658315',
      optional_photo: null,
      user_account_id: 14,
    },
    {
      id: 15,
      name: 'Ejemplo15',
      email_adress: 'ejemplo15@gmail.com',
      adress: 'Calle ejemplo 15',
      telephone: '359672184',
      optional_photo: 'http://www.ejemplo15.com/',
      user_account_id: 15,
    },

    // vet
    {
      id: 16,
      name: 'Ejemplo16',
      email_adress: 'ejemplo16@gmail.com',
      adress: 'Calle ejemplo 16',
      telephone: '751485326',
      optional_photo: 'http://www.ejemplo16.com/',
      user_account_id: 16,
    },
    {
      id: 17,
      name: 'Ejemplo17',
      email_adress: 'ejemplo17@gmail.com',
      adress: 'Calle ejemplo 17',
      telephone: '756318964',
      optional_photo: null,
      user_account_id: 17,
    },
    {
      id: 18,
      name: 'Ejemplo18',
      email_adress: 'ejemplo18@gmail.com',
      adress: 'Calle ejemplo 18',
      telephone: '486359625',
      optional_photo: 'http://www.ejemplo18.com/',
      user_account_id: 18,
    },
  ]);

  // administrator
  await knex('administrator').insert([
    {id: 1, surname: 'Ejemplo 4', actor_id: 4},
    {id: 2, surname: 'Ejemplo 5', actor_id: 5},
    {id: 3, surname: 'Ejemplo 6', actor_id: 6},
  ]);

  // particular
  await knex('particular').insert([
    {
      id: 1,
      surname: 'surname1',
      actor_id: 10,
    },
    {
      id: 2,
      surname: 'surname2',
      actor_id: 11,
    },
    {
      id: 3,
      surname: 'surname3',
      actor_id: 12,
    },
  ]);

  // publication
  await knex('publication').insert([
    // breeding
    {
      id: 1,
      animal_photo: 'http://www.ejemplo1.com/, http://www.ejemplo2.com/',
      identification_photo: 'http://www.ejemplo1.com/',
      vaccine_passport: 'Vaccine passport 1',
      document_status: 'Accepted',
      age: 8,
      genre: 'Male',
      breed: 'Doberman',
      transaction_status: 'In progress',
      title: 'Example breeding 1',
      particular_id: 1,
    },
    {
      id: 2,
      animal_photo: 'http://www.ejemplo3.com/',
      identification_photo: 'http://www.ejemplo2.com/',
      vaccine_passport: 'Vaccine passport 2',
      document_status: 'In revision',
      age: 3,
      genre: 'Female',
      breed: 'Bulldog Terrier',
      transaction_status: 'Completed',
      title: 'Example breeding 2',
      particular_id: 2,
    },
    {
      id: 3,
      animal_photo:
        'http://www.ejemplo4.com/, http://www.ejemplo5.com/, http://www.ejemplo6.com/',
      identification_photo: 'http://www.ejemplo3.com/',
      vaccine_passport: 'Vaccine passport 3',
      document_status: 'Rejected',
      age: 5,
      genre: 'Male',
      breed: 'Yorkshire Terrier',
      transaction_status: 'In progress',
      title: 'Example breeding 3',
      particular_id: 3,
    },

    // adoption
    {
      id: 4,
      animal_photo: 'http://www.ejemplo5.com/, http://www.ejemplo8.com/',
      identification_photo: 'http://www.ejemplo4.com/',
      vaccine_passport: 'Vaccine passport 4',
      document_status: 'Accepted',
      age: 6,
      genre: 'Male',
      breed: 'Maine Coon',
      transaction_status: 'Completed',
      title: 'Example adoption 1',
      particular_id: 1,
    },
    {
      id: 5,
      animal_photo: 'http://www.ejemplo7.com/',
      identification_photo: 'http://www.ejemplo1.com/',
      vaccine_passport: 'Vaccine passport 5',
      document_status: 'Accepted',
      age: 8,
      genre: 'Female',
      breed: 'Siamés',
      transaction_status: 'In progress',
      title: 'Example adoption 2',
      particular_id: 2,
    },
    {
      id: 6,
      animal_photo:
        'http://www.ejemplo9.com/, http://www.ejemplo1.com/, http://www.ejemplo2.com/',
      identification_photo: 'http://www.ejemplo6.com/',
      vaccine_passport: 'Vaccine passport 6',
      document_status: 'Accepted',
      age: 2,
      genre: 'Male',
      breed: 'Árabe',
      transaction_status: 'In progress',
      title: 'Example adoption 3',
      particular_id: 3,
    },
  ]);

  // request
  await knex('request').insert([
    {
      id: 1,
      status: 'Favorite',
      is_favorite: true,
      publication_id: 4,
      particular_id: 1,
    },
    {
      id: 2,
      status: 'Pending',
      is_favorite: false,
      publication_id: 5,
      particular_id: 2,
    },
    {
      id: 3,
      status: 'Accepted',
      is_favorite: false,
      publication_id: 6,
      particular_id: 3,
    },
  ]);

  // moderator
  await knex('moderator').insert([
    {id: 1, surname: 'surname1', actor_id: 7},
    {id: 2, surname: 'surname2', actor_id: 8},
    {id: 3, surname: 'surname3', actor_id: 9},
  ]);

  // breeding
  await knex('breeding').insert([
    {id: 1, price: 5.5, publication_id: 1},
    {id: 2, price: 69, publication_id: 2},
    {id: 3, price: 44.1, publication_id: 3},
  ]);

  // adoption
  await knex('adoption').insert([
    {
      id: 1,
      name: 'Niko',
      taxes: 390,
      publication_id: 4,
    },
    {
      id: 2,
      name: 'Kiwi',
      taxes: 210,
      publication_id: 5,
    },
    {
      id: 3,
      name: 'Toby',
      taxes: 870,
      publication_id: 6,
    },
  ]);

  // shelter
  await knex('shelter').insert([
    {id: 1, actor_id: 1, adoption_id: 1},
    {id: 2, actor_id: 2, adoption_id: 2},
    {id: 3, actor_id: 3, adoption_id: 3},
  ]);

  // vet
  await knex('vet').insert([
    {
      id: 1,
      surname: 'Vet1',
      is_premium: true,
      actor_id: 16,
    },
    {
      id: 2,
      surname: 'Vet2',
      is_premium: false,
      actor_id: 17,
    },
    {
      id: 3,
      surname: 'Vet3',
      is_premium: false,
      actor_id: 18,
    },
  ]);
};
