const breedingService = require('../services/breeding');

exports.getBreeding = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const breadingId = req.params.id || 0;
    if (isNaN(breadingId)) {
      return res.status(400).send('ID must be a number');
    }

    const breeding = await breedingService.getBreeding(connection, breadingId);

    return res.status(200).send(breeding);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.createBreading = async (req, res) => {
  try {
    const connection = req.connection;

    // body
    const breedingData = req.body;
    if (
      !breedingData.animal_photo || !breedingData.identification_photo ||
      !breedingData.age || !breedingData.genre || !breedingData.breed ||
      !breedingData.title || !breedingData.vaccine_passport || !breedingData.price
    ) {
      return res.status(400).send('Params invalid');
    }

    // create transaction
    const trx = await connection.transaction();

    const breeding = await breedingService.createBreeding(
      breedingData,
      trx,
    );

    // commit
    trx.commit();

    return res.status(200).send(breeding);
  } catch (error) {
    console.log(error);
    // rollback
    trx.rollback();
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.getMyFavoriteBreedings = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;
    const role = req.user.role;

    const breedings = await breedingService.getMyFavoriteBreedings(connection, userId);

    return res.status(200).send(breedings);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.getPendingBreedings = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;
    const role = req.user.role;

    const breedings = await breedingService.getPendingBreedings(connection, userId);

    return res.status(200).send(breedings);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};
