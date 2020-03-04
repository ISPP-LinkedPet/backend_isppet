exports.getUser = async (req, res) => {
  const connection = req.connection;

  const data = await connection('user').select('id').limit(10).offset(0);

  return res.status(200).send(data);
};

exports.addUser = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    await trx('user').insert({name: 'p'});

    const rows = await trx('user').where('id', 1);
    if (rows.length) {
      return res.status(403).send('duplicate-value');
    }

    // transaction commit
    await trx.commit;

    res.status(200).send('Created successful');
  } catch (error) {
    console.log(error);
    // transaction rollback
    await trx.rollback;

    return res.status(500).send('Internal error');
  }
};
