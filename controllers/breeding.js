const breedingService = require('../services/breeding');

exports.getBreeding = async (req, res) => {
  const id = req.params.id;
  const connection = req.connection;
  try {
    const breeding = await breedingService.getBreeding(id, connection);
    return res.status(200).send(breeding);
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.getMyFavoriteBreedings = async (req, res) => {
  const connection = req.connection;
  try {
    const breedings = await breedingService.getMyFavoriteBreedings(req.user.id, connection);
    return res.status(200).send(breedings);
  } catch (error) {
    return res.status(400).send(error);
  }
};
