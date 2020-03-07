const adoptionService = require('../services/adoption');

exports.getParticularAdoptions = async (req, res) => {
  try {
    const connection = req.connection;

    const adoption = await adoptionService.getParticularAdoptions(connection);
    return res.status(200).send(adoption);
  } catch (error) {
    console.log(JSON.stringify(error));
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};
