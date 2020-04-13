const particularService = require('../services/particular');

exports.getParticular = async (req, res) => {
  try {
    const connection = req.connection;

    const particularId = req.params.id;
    if (isNaN(particularId)) {
      return res.status(400).send({error: 'ID must be a number'});
    }

    const particular = await particularService.getParticular(
        connection,
        particularId,
    );
    return res.status(200).send({particular});
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
exports.hasRequestFrom = async (req, res) => {
  const connection = req.connection;

  try {
    // get params
    const particularId = req.params.id;

    // authorization
    const userId = req.user.id;

    const hasRequestFrom = await particularService.hasRequestFrom(
        connection,
        userId,
        particularId,
    );

    return res.status(200).send({hasRequestFrom});
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getParticularLogged = async (req, res) => {
  try {
    const connection = req.connection;

    const userId = req.user.id;

    const particular = await particularService.getParticularLogged(
        connection,
        userId,
    );
    return res.status(200).send({particular});
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getMyData = async (req, res) => {
  try {
    const connection = req.connection;

    const userId = req.user.id;

    const data = await particularService.getMyData(
        connection,
        userId,
    );

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=Mis_datos_LinkedPet.pdf',
      'Content-Length': data.length,
    });
    return res.end(data);
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.deleteParticular = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const userId = req.user.id;

    const particular = await particularService.deleteParticular(
        trx,
        userId,
    );

    await trx.commit();

    return res.status(200).send({particular});
  } catch (error) {
    // rollback
    await trx.rollback();

    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
