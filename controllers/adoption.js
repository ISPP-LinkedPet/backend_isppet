const adoptionService = require('../services/adoption');

exports.getParticularAdoptions = async (req, res) => {
  try {
    const page = req.query.page || 0;
    if (isNaN(page)) {
      return res.status(401).send('Invalid params');
    }

    const connection = req.connection;

    const adoption = await adoptionService.getParticularAdoptions(
        connection,
        page,
    );
    return res.status(200).send(adoption);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send(error.message);
    }
    return res.status(500).send(error);
  }
};
exports.getAdoption = async (req, res) => {
  try {
    const connection = req.connection;

    const adoptionId = req.params.id;
    if (isNaN(adoptionId)) {
      return res.status(400).send({error: 'ID must be a number'});
    }

    const adoption = await adoptionService.getAdoption(connection, adoptionId);
    return res.status(200).send({adoption});
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.createAdoption = async (req, res) => {
  const trx = await req.connection.transaction();

  try {
    const shelterId = req.user.id;
    console.log(shelterId);

    const adoptionData = req.body;
    console.log(adoptionData);
    const adoptionPhotos = req.files;
    console.log(adoptionPhotos);

    if (
      !adoptionPhotos.animal_photo ||
      !adoptionPhotos.identification_photo ||
      !adoptionData.title ||
      !adoptionPhotos.vaccine_passport ||
      !adoptionData.type ||
      !adoptionData.location ||
      !adoptionData.taxes ||
      !shelterId
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const adoption = await adoptionService.createAdoption(
        adoptionData,
        adoptionPhotos,
        shelterId,
        trx,
    );

    trx.commit();

    return res.status(200).send({adoption});
  } catch (error) {
    trx.rollback();

    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.updateAdoption = async (req, res) => {
  const connection = req.connection;
  const trx = await connection.transaction();

  try {
    const userId = req.user.id;
    const adoptionData = req.body;
    const adoptionPhotos = req.files;
    const adoptionId = req.params.id;

    if (
      !adoptionPhotos.animal_photo ||
      !adoptionPhotos.identification_photo ||
      !adoptionData.title ||
      !adoptionPhotos.vaccine_passport ||
      !adoptionData.type ||
      !adoptionData.location ||
      !adoptionData.taxes ||
      !userId
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const adoption = await adoptionService.updateAdoption(
        adoptionData,
        adoptionPhotos,
        adoptionId,
        userId,
        trx,
    );

    await trx.commit();
    return res.status(200).send({adoption});
  } catch (error) {
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
