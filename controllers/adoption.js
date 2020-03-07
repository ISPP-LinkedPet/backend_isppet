const adoptionService = require('../services/adoption');

exports.getParticularAdoptions = async (req, res) => {
  const connection = req.connection;
  try {
    const adoption = await adoptionService.getParticularAdoptions(connection);
    return res.status(200).json({adoption});
  } catch (error) {
    return res.status(400).json({error});
  }
};
