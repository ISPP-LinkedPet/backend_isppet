const vetService = require('../services/vet');

exports.getVets = async (req, res) => {
  try {
    const connection = req.connection;
    const vet = await vetService.getVets(connection);
    return res.status(200).send(vet);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};
