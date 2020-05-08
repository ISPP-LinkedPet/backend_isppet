const petService = require('../services/pet');

exports.createPet = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const particularId = req.user.id;
    const role = req.user.role;

    // file
    const petPhotos = req.files;

    const petData = req.body;
    if (role === 'particular' || role === 'shelter') {
      if (
        !petPhotos.animal_photo ||
      !petPhotos.identification_photo ||
      !petPhotos.vaccine_passport ||
      !petData.name
      ) {
        return res.status(400).send({error: 'Parámetros inválidos'});
      }
    } else {
      if (
        !petPhotos.animal_photo ||
        !petPhotos.identification_photo ||
        !petPhotos.vaccine_passport ||
        !petData.name ||
        !petData.genre ||
        !petData.type ||
        !petData.birth_date ||
        !petData.pedigree ||
        !petData.breed
      ) {
        return res.status(400).send({error: 'Parámetros inválidos'});
      }
    }

    const pet = await petService.createPet(
        petData,
        petPhotos,
        particularId,
        role,
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
    const role = req.user.role;

    const pet = await petService.editPet(
        petData,
        petPhotos,
        petId,
        userId,
        role,
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
      return res.status(400).send({error: 'Parámetros inválidos'});
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
    const breeding = req.query.breeding;
    if (isNaN(particularId)) {
      return res.status(400).send('ID must be a number');
    }
    if (!breeding) {
      return res.status(400).send('The type of the list of animals to be returned must be indicated');
    }

    const pet = await petService.getPetsByParticularId(connection, particularId, breeding);

    return res.status(200).send(pet);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.deletePet = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const petId = req.params.id;

    const particularId = req.user.id;

    const role = req.user.role;

    const pet = await petService.deletePet(petId, particularId, role, trx);

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

exports.getCanDelete = async (req, res) => {
  const connection = req.connection;

  try {
    // authorization
    const userId = req.user.id;
    const petId = req.params.id;
    const role = req.user.role;

    const pet = await petService.getCanDelete(
        connection,
        userId,
        petId,
        role,
    );

    return res.status(200).send(pet);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getPetsByShelterId = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const shelterId = req.params.id;
    if (isNaN(shelterId)) {
      return res.status(400).send('ID must be a number');
    }

    const pet = await petService.getPetsByShelterId(connection, shelterId);

    return res.status(200).send(pet);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
