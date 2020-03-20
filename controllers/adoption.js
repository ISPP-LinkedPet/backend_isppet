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
    let user = null;
    const role = req.user.role;
    const adoptionData = req.body;
    const adoptionPhotos = req.files;

    if (role === 'shelter') {
      user = await connection('shelter')
          .select('id')
          .where('user_account_id', req.user.id)
          .first();
    } else if (role === 'particular') {
      user = await connection('particular')
          .select('id')
          .where('user_account_id', req.user.id)
          .first();
    }

    if (
      !adoptionPhotos.animal_photo ||
      !adoptionData.type ||
      !adoptionData.location ||
      !adoptionData.pedigree ||
      !adoptionData.birth_date ||
      !adoptionData.genre ||
      !adoptionData.breed ||
      !adoptionData.name ||
      !user.id
    ) {
      return res.status(400).send('Invalid params');
    }

    const adoption = await adoptionService.createAdoption(
        adoptionData,
        adoptionPhotos,
        user.id,
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
    let user = null;
    const role = req.user.role;
    const adoptionData = req.body;
    const adoptionPhotos = req.files;
    const adoptionId = req.params.id;

    if (role === 'shelter') {
      user = await connection('shelter')
          .select('id')
          .where('user_account_id', req.user.id)
          .first();
    } else if (role === 'particular') {
      user = await connection('particular')
          .select('id')
          .where('user_account_id', req.user.id)
          .first();
    }

    if (
      !adoptionPhotos.animal_photo ||
      !adoptionData.type ||
      !adoptionData.location ||
      !adoptionData.pedigree ||
      !adoptionData.birth_date ||
      !adoptionData.genre ||
      !adoptionData.breed ||
      !adoptionData.name ||
      !user.id
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const adoption = await adoptionService.updateAdoption(
        adoptionData,
        adoptionPhotos,
        adoptionId,
        user.id,
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

exports.acceptAdoption = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const adoptionData = req.body;
    const adoptionId = req.params.id;

    const adoption = await adoptionService.acceptAdoption(
        adoptionData,
        adoptionId,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send(adoption);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send(error);
  }
};

exports.rejectAdoption = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const adoptionId = req.params.id;

    const adoption = await adoptionService.rejectAdoption(adoptionId, trx);

    // commit
    await trx.commit();

    return res.status(200).send(adoption);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send(error);
  }
};

exports.imInterested = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    // params
    const adoptionId = req.params.id;
    if (!adoptionId) {
      return res.status(404).send('Miss params');
    }

    // authorization
    const userId = req.user.id;

    const request = await adoptionService.imInterested(userId, adoptionId, trx);

    // commit
    await trx.commit();

    // Ver el formato en el que mandar los mensajes
    return res.status(200).send(request);
  } catch (error) {
    console.log(error);

    // rollback
    await trx.rollback();

    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getAdoptionsOffers = async (req, res) => {
  const connection = req.connection;
  try {
    // query
    const adoptionParams = req.query;

    // authorization
    const userId = req.user.id;

    const adoptions = await adoptionService.getAdoptionsOffers(
        adoptionParams,
        connection,
        userId,
    );

    return res.status(200).send(adoptions);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

exports.getAdoptions = async (req, res) => {
  const connection = req.connection;

  try {
    const page = req.query.page || 0;
    if (isNaN(page)) {
      return res.status(401).send('Invalid params');
    }

    const adoptions = await adoptionService.getAdoptions(connection, page);

    return res.status(200).send(adoptions);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send(error.message);
    }
    return res.status(500).send(error);
  }
};