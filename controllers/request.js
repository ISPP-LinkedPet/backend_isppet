const requestService = require('../services/request');

exports.rejectRequest = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    // authorization
    const userId = req.user.id;

    // parameters
    const requestId = req.params.id;
    if (!requestId || isNaN(requestId)) {
      return res.status(400).send('Invalid params');
    }

    const request = await requestService.rejectRequest(trx, requestId, userId);

    // commit
    await trx.commit();

    return res.status(200).send(request);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send(error);
  }
};

exports.acceptRequest = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    // authorization
    const userId = req.user.id;

    // parameters
    const requestId = req.params.id;
    const publicationId = req.params.publicationId;

    if (!requestId || isNaN(requestId) || !publicationId || isNaN(publicationId)) {
      return res.status(400).send('Invalid params');
    }

    const request = await requestService.acceptRequest(trx, requestId, userId, publicationId);

    // commit
    await trx.commit();

    return res.status(200).send(request);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send(error);
  }
};
