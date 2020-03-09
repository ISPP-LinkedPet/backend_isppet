const adoptionService = require('../services/adoption');

exports.getParticularAdoptions = async (req, res) => {
  try {
    const page = req.query.page || 0;
    if (isNaN(page)) {
      return res.status(401).send('Invalid params');
    }

    const connection = req.connection;

    const adoption = await adoptionService.getParticularAdoptions(connection, page);
    return res.status(200).send(adoption);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.createAdoption = async (req, res) => {
  const connection = req.connection;
  const trx = await connection.transaction();
  try {
    const shelterId = req.user.id;

    const adoptionData = req.body;
    const adoptionPhotos = req.files;

    console.log({adoptionData});
    console.log({adoptionPhotos});

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
      return res.status(400).send({error: 'Invalid params'});
    }

    const adoption = await adoptionService.createAdoption(adoptionData, adoptionPhotos, shelterId, trx);

    console.log('Error');

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
