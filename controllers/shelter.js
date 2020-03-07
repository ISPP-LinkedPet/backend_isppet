const shelterService = require('../services/shelter');

exports.getShelters = async (req, res) => {
  try {
    const connection = req.connection;

    const shelter = await shelterService.getShelters(connection);
    return res.status(200).send(shelter);
  } catch (error) {
    console.log(JSON.stringify(error));
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};
