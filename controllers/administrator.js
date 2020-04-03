const administratorService = require('../services/administrator');

exports.banUser = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const userId = req.params.id;

    const user = await administratorService.banUser(trx, userId);

    // commit
    await trx.commit();

    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.unbanUser = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const userId = req.params.id;

    const user = await administratorService.unbanUser(trx, userId);

    // commit
    await trx.commit();

    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
