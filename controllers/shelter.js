const shelterService = require('../services/shelter');

exports.getShelters = async (req, res) => {
  const connection = req.connection;
  try {
    const shelter = await shelterService.getShelters(connection);
    return res.status(200).json({shelter});
  } catch (error) {
    return res.status(400).json({error});
  }
};
