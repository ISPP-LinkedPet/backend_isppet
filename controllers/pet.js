const petService = require('../services/pet');

exports.createPet = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const particularId = req.user.id;

    // file
    const petPhotos = req.files;

    const petData = req.body;

    if (
      !petPhotos.animal_photo ||
      !petPhotos.identification_photo ||
      !petPhotos.vaccine_passport ||
      !petData.name
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const pet = await petService.createPet(
        petData,
        petPhotos,
        particularId,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send(pet);
  } catch (error) {
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.editPet = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const userId = req.user.id;
    const petPhotos = req.files;
    const petId = req.params.id;
    const petData = req.body;

    const pet = await petService.editPet(
        petData,
        petPhotos,
        petId,
        userId,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send(pet);
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

exports.getPet = async (req, res) => {
  try {
    const connection = req.connection;

    const petId = req.params.id;
    if (isNaN(petId)) {
      return res.status(400).send({error: 'ID must be a number'});
    }

    const pet = await petService.getPet(connection, petId);
    return res.status(200).send(pet);
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getPetsInRevision = async (req, res) => {
  try {
    const connection = req.connection;

    const pets = await petService.getPetsInRevision(connection);
    return res.status(200).send(pets);
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.acceptPet = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const petData = req.body;
    const petId = req.params.id;

    if (
      !petData.genre ||
      !petData.type ||
      !petData.birth_date ||
      !petData.pedigree ||
      !petData.breed
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const pet = await petService.acceptPet(
        petData,
        petId,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send(pet);
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

exports.rejectPet = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const petId = req.params.id;


    const pet = await petService.rejectPet(
        petId,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send(pet);
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
exports.getPetsByParticularId = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const particularId = req.params.id;
    if (isNaN(particularId)) {
      return res.status(400).send('ID must be a number');
    }

    const pet = await petService.getPetsByParticularId(connection, particularId);

    return res.status(200).send(pet);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
