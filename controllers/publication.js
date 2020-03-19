const publicationService = require('../services/publication');

exports.getPublicationsByActorId = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const actorId = req.params.id;
    if (isNaN(actorId)) {
      return res.status(400).send('ID must be a number');
    }

    const publication = await publicationService.getPublicationsByActorId(connection, actorId);

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

    if (!['Accepted', 'In revision', 'Rejected'].includes(status)) { // TODO: resivar si faltan estados, estos estados corresponden a la documentación
      return res.status(404).send('Status not available');
    }

    const publication = await publicationService.getPublicationsStatus(connection, status);

    return res.status(200).send(publication);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.getPublication = async (req, res) => {
  try {
    const connection = req.connection;

    const publicationId = req.params.id;
    if (isNaN(publicationId)) {
      return res.status(400).send({error: 'ID must be a number'});
    }

    const publication = await publicationService.getPublication(connection, publicationId);
    return res.status(200).send({publication});
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getAcceptedRequestListByActorId = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;

    const acceptedRequestList = await publicationService.getacceptedRequestListByActorId(connection, userId);

    return res.status(200).send(acceptedRequestList);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.getRejectedRequestListByActorId = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;

    const rejectedRequestList = await publicationService.getRejectedRequestListByActorId(connection, userId);

    return res.status(200).send(rejectedRequestList);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};

exports.getRequestsToMyPublications = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;

    const requests = await publicationService.getRequestsToMyPublications(
        connection,
        userId,
    );

    return res.status(200).send(requests);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send(error.message);
    }
    return res.status(500).send(error);
  }
};
