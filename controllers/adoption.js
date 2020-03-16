const adoptionService = require('../services/adoption');

exports.getParticularAdoptions = async (req, res) => {
  const connection = req.connection;

  try {
    const page = req.query.page || 0;
    if (isNaN(page)) {
      return res.status(401).send('Invalid params');
    }

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

exports.getPendingAdoptions = async (req, res) => {
  const connection = req.connection;

  try {
    // authorization
    const userId = req.user.id;
    // const role = req.user.role;

    const adoptions = await adoptionService.getPendingAdoptions(
        connection,
        userId,
    );

    return res.status(200).send(adoptions);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send(error.message);
    }
    return res.status(500).send(error);
  }
};

exports.createAdoption = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const userId = req.user.id;
    const role = req.user.role;
    const adoptionData = req.body;
    const adoptionPhotos = req.files;

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
      return res.status(400).send('Invalid params');
    }

    const adoption = await adoptionService.createAdoption(
        adoptionData,
        adoptionPhotos,
        userId,
        role,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send({adoption});
  } catch (error) {
    // rollback
    await trx.rollback();

    if (error.status && error.message) {
      res.status(error.status).send({error: error.message});
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
      !adoptionData.taxes
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
    return res.status(200).send(adoption);
  } catch (error) {
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.acceptAdoption = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const adoptionData = req.body;
    const adoptionId = req.params.id;

    const adoption = await adoptionService.acceptAdoption(adoptionData, adoptionId, trx);

    // commit
    await trx.commit();

    return res.status(200).send(adoption);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) return res.status(error.status).send({error: error.message});
    return res.status(500).send(error);
  }
};

exports.rejectAdoption = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const adoptionId = req.params.id;

    const adoption = await adoptionService.rejectaAdoption(adoptionId, trx);

    // commit
    await trx.commit();

    return res.status(200).send(adoption);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) return res.status(error.status).send({error: error.message});
    return res.status(500).send(error);
  }
};
