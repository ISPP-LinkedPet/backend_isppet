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

exports.makeVetPremium = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const vetId = req.body.vetId;
    if (!vetId) {
      return res.status(400).send({error: 'Vet id must be provided '});
    }

    await administratorService.makeVetPremium(trx, vetId);

    // commit
    await trx.commit();

    return res.status(200).send('Update successful');
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

exports.cancelVetPremium = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const vetId = req.body.vetId;
    if (!vetId) {
      return res.status(400).send({error: 'Vet id must be provided '});
    }

    await administratorService.cancelVetPremium(trx, vetId);

    // commit
    await trx.commit();

    return res.status(200).send('Update successful');
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
