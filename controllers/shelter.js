const shelterService = require('../services/shelter');

exports.getShelters = async (req, res) => {
  try {
    const page = req.query.page || 0;
    if (isNaN(page)) {
      return res.status(401).send('Invalid params');
    }

    const connection = req.connection;

    const shelter = await shelterService.getShelters(connection, page);
    return res.status(200).send(shelter);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getShelter = async (req, res) => {
  try {
    const connection = req.connection;

    const shelterId = req.params.id;
    if (isNaN(shelterId)) {
      return res.status(400).send({error: 'ID must be a number'});
    }

    const shelter = await shelterService.getShelter(connection, shelterId);
    return res.status(200).send({shelter});
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getMyData = async (req, res) => {
  try {
    const connection = req.connection;

    const userId = 1;

    const data = await shelterService.getMyData(
        connection,
        userId,
    );

    res.contentType('application/pdf').send(data);

    // Esto es si se quiere descargar en vez de ver en el navegador
    // res.writeHead(200, {
    //   'Content-Type': 'application/pdf',
    //   'Content-Disposition': 'attachment; filename=Mis_datos_LinkedPet.pdf',
    //   'Content-Length': data.length,
    // });
    // return res.end(data);
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
