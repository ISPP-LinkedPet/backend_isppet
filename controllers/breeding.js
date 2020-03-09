const breedingService = require('../services/breeding');

exports.getBreeding = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const breedingId = req.params.id;
    if (isNaN(breedingId)) {
      return res.status(400).send({error: 'ID must be a number'});
    }

    const breeding = await breedingService.getBreeding(connection, breedingId);
    return res.status(200).send({breeding});
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.createBreading = async (req, res) => {
  const trx = await req.connection.transaction();

  try {
    const particularId = req.user.id;
    const breedingData = req.body;
    const breedingPhotos = req.files;

    // breed, age and genre not required during creation
    if (
      !breedingPhotos.animal_photo ||
      !breedingPhotos.identification_photo ||
      !breedingData.title ||
      !breedingPhotos.vaccine_passport ||
      !breedingData.price ||
      !particularId
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const breeding = await breedingService.createBreeding(breedingData, breedingPhotos, particularId, trx);
    trx.commit();
    return res.status(200).send({breeding});
  } catch (error) {
    trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getMyFavoriteBreedings = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;
    const role = req.user.role;

    const breedings = await breedingService.getMyFavoriteBreedings(
        connection,
        userId,
    );

    return res.status(200).send(breedings);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send(error.message);
    }
    return res.status(500).send(error);
  }
};

exports.imInterested = async (req, res) => {
  const connection = req.connection;
  const trx = await connection.transaction();

  try {
    // authorization
    const userId = req.user.id;
    const breedingId = req.params.id;

    const request = await breedingService.imInterested(userId, breedingId, trx);
    trx.commit();

    // Ver el formato en el que mandar los mensajes
    return res.status(200).send(request);
  } catch (error) {
    trx.rollback();

    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }

    return res.status(500).send({error});
  }
};
