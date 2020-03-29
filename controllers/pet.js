const petService = require('../services/pet');

exports.createPet = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const particularId = req.user.id;

    // file
    const petPhotos = req.files;

    if (
      !petPhotos.animal_photo ||
      !petPhotos.identification_photo ||
      !petPhotos.vaccine_passport
    ) {
      return res.status(400).send({error: 'Invalid params'});
    }

    const pet = await petService.createPet(
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

    const pet = await petService.editPet(
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
