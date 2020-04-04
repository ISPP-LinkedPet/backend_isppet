const administratorService = require('../services/administrator');

exports.banUser = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const userId = req.params.id;

    const user = await administratorService.banUser(trx, userId);

    // commit
    await trx.commit();

    return res.status(200).send(user);
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

exports.unbanUser = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const userId = req.params.id;

    const user = await administratorService.unbanUser(trx, userId);

    // commit
    await trx.commit();

    return res.status(200).send(user);
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

exports.getBanUsers = async (req, res) => {
  const connection = req.connection;

  try {
    // authorization
    const userId = req.user.id;
    // const role = req.user.role;

    const banUsers = await administratorService.getBanUsers(
        connection,
        userId,
    );

    return res.status(200).send(banUsers);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getUnbanUsers = async (req, res) => {
  const connection = req.connection;

  try {
    // authorization
    const userId = req.user.id;
    // const role = req.user.role;

    const unbanUsers = await administratorService.getUnbanUsers(
        connection,
        userId,
    );

    return res.status(200).send(unbanUsers);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.updateAd = async (req, res) => {
  const connection = req.connection;
  const trx = await connection.transaction();

  try {
    const user = await connection('administrator')
        .select('id')
        .where('user_account_id', req.user.id)
        .first();
    const role = req.user.role;
    const adData = req.body;
    const adPhotos = req.files;
    const adId = req.params.id;

    if (
      !adPhotos.top_banner ||
      !adPhotos.lateral_banner ||
      !adData.ad_type ||
      !adData.price ||
      !user.id
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const ad = await administratorService.updateAds(
        trx,
        adData,
        adPhotos,
        adId,
        role,
    );

    await trx.commit();
    return res.status(200).send({ad});
  } catch (error) {
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.createAd = async (req, res) => {
  const connection = req.connection;
  const trx = await connection.transaction();

  try {
    const user = await connection('administrator')
        .select('id')
        .where('user_account_id', req.user.id)
        .first();
    const role = req.user.role;
    const adData = req.body;
    const adPhotos = req.files;

    if (
      !adPhotos.top_banner ||
      !adPhotos.lateral_banner ||
      !adData.ad_type ||
      !adData.price ||
      !adData.vet_id ||
      !adData.active ||
      !user.id
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const ad = await administratorService.createAds(
        trx,
        adData,
        adPhotos,
        role,
    );

    await trx.commit();
    return res.status(200).send({ad});
  } catch (error) {
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.activateAd = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const adId = req.params.id;

    const ad = await administratorService.activateAd(trx, adId);

    // commit
    await trx.commit();

    return res.status(200).send(ad);
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

exports.deactivateAd = async (req, res) => {
  const connection = req.connection;

  // Create transaction
  const trx = await connection.transaction();

  try {
    const adId = req.params.id;

    const ad = await administratorService.deactivateAd(trx, adId);

    // commit
    await trx.commit();

    return res.status(200).send(ad);
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
