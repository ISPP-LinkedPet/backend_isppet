const breedingService = require('../services/breeding');

exports.getBreeding = async (req, res) => {
  try {
    const connection = req.connection;

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

    // breed, age, pedigree and genre not required during creation
    if (
      !breedingPhotos.animal_photo ||
      !breedingPhotos.identification_photo ||
      !breedingData.title ||
      !breedingPhotos.vaccine_passport ||
      !breedingData.price ||
      !breedingData.location ||
      !breedingData.type ||
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

exports.getMyInterestedBreedings = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;
    // const role = req.user.role;

    const breedings = await breedingService.getMyInterestedBreedings(
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

exports.getPendingBreedings = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;

    const breedings = await breedingService.getPendingBreedings(connection, userId);

    return res.status(200).send(breedings);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.getBreedingsOffers = async (req, res) => {
  const connection = req.connection;
  try {
    // query
    const breedingParams = req.query;

    // authorization
    const userId = req.user.id;

    const breedings = await breedingService.getBreedingsOffers(breedingParams, connection, userId);

    return res.status(200).send(breedings);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};


exports.imInterested = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    // params
    const breedingId = req.params.id;
    if (!breedingId) {
      return res.status(404).send('Miss params');
    }

    // authorization
    const userId = req.user.id;

    const request = await breedingService.imInterested(userId, breedingId, trx);

    // commit
    await trx.commit();

    // Ver el formato en el que mandar los mensajes
    return res.status(200).send(request);
  } catch (error) {
    // rollback
    await trx.rollback();

    if (error.status && error.message) return res.status(error.status).send({error: error.message});
    return res.status(500).send({error});
  }
};
