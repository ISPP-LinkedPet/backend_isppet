const adoptionService = require('../services/adoption');


exports.getMyFavoriteAdoptions = async (req, res) => {
  const connection = req.connection;
  try {
    const adoptions = await adoptionService.getMyFavoriteAdoptions(req.user.id, connection);
    return res.status(200).send(adoptions);
  } catch (error) {
    return res.status(400).send(error);
  }
};
