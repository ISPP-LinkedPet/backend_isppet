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

exports.getPendingAdoptions = async (req, res) => {
  const connection = req.connection;

  try {

    // authorization
    const userId = req.user.id;
    const role = req.user.role;

    const adoptions = await adoptionService.getPendingAdoptions(connection, userId);

    return res.status(200).send(adoptions);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.createAdoption = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const shelterId = req.user.id;

    const adoptionData = req.body;
    const adoptionPhotos = req.files;

    if (
      !adoptionPhotos.animal_photo ||
      !adoptionPhotos.identification_photo ||
      !adoptionData.title ||
      !adoptionPhotos.vaccine_passport ||
      !adoptionData.type ||
      !adoptionData.location ||
      !adoptionData.pedigree ||
      !shelterId
    ) {
      return res.status(400).send('Invalid params');
    }

    const adoption = await adoptionService.createAdoption(
        adoptionData,
        adoptionPhotos,
        shelterId,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send({adoption});
  } catch (error) {
    // rollback
    await trx.rollback();

    if (error.status && error.message) res.status(error.status).send({error: error.message});
    return res.status(500).send({error});
  }
};
