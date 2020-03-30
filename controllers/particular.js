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
