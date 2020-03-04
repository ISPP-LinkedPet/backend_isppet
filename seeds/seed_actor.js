exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('actor').del()
      .then(function() {
      // Inserts seed entries
        return knex('actor').insert([
          {id: 1, name: 'Ejemplo1', email_adress: 'ejemplo1@gmail.com', adress: 'Calle ejemplo 1', telephone: '954695241', optional_photo: 'http://www.ejemplo1.com/%27%7D'},
          {id: 2, name: 'Ejemplo2', email_adress: 'ejemplo2@gmail.com', adress: 'Calle ejemplo 2', telephone: '954478512', optional_photo: null},
          {id: 3, name: 'Ejemplo3', email_adress: 'ejemplo3@gmail.com', adress: 'Calle ejemplo 3', telephone: '954896523', optional_photo: 'http://www.ejemplo3.com/%27%7D'},
        ]);
      });
};
