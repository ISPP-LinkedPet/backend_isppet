const vetService = require('../services/vet');

exports.getVets = async (req, res) => {
  try {
    const connection = req.connection;
    const vet = await vetService.getVets(connection);
    return res.status(200).send(vet);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
exports.premiumTrue = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const vetId = req.params.id;

    const vet = await vetService.premiumTrue(vetId, trx);

    // commit
    await trx.commit();

    return res.status(200).send(vet);
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
exports.premiumFalse = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const vetId = req.params.id;

    const vet = await vetService.premiumFalse(vetId, trx);

    // commit
    await trx.commit();

    return res.status(200).send(vet);
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
