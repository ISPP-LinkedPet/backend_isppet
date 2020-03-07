const adoptionService = require('../services/adoption');

exports.getParticularAdoptions = async (req, res) => {
  try {
    const page = req.query.page || 0;
    if (isNaN(page)) {
      return res.status(401).send('Invalid params');
    }

    const connection = req.connection;

    const adoption = await adoptionService.getParticularAdoptions(connection, page);
    return res.status(200).send(adoption);
  } catch (error) {
    console.log(JSON.stringify(error));
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};
