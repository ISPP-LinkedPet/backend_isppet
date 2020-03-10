const publicationService = require('../services/publication');

exports.getPublication = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const actorId = req.params.id;
    if (isNaN(actorId)) {
      return res.status(400).send('ID must be a number');
    }

    const publication = await publicationService.getPublications(connection, actorId);

    return res.status(200).send(publication);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};


exports.getPublicationStatus = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const status = req.params.status;
    // || req.params.status;
    const publication = await publicationService.getPublicationsStatus(connection, status);
    return res.status(200).send(publication);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};
