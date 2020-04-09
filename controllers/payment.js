const paymentService = require('../services/payment');

exports.createPaymentToMyself = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;

    const {token, breedingId, returnUrl} = req.body;
    if (!token || !breedingId || !returnUrl) {
      return res.status(400).send({error: 'Token, breedingId and returnUrl must be provided '});
    }

    const payment = await paymentService.createPaymentToMyself(connection, token, userId, breedingId, returnUrl);
    return res.status(200).send({status: payment.status, url: payment.next_action != null ? payment.next_action.redirect_to_url.url : null});
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.confirmPaymentToMyself = async (req, res) => {
  try {
    const connection = req.connection;

    // body
    const {paymentId, breedingId} = req.body;
    if (!paymentId || !breedingId) {
      return res.status(400).send({error: 'Invalid data'});
    }

    // authorization
    const userId = req.user.id;

    const payment = await paymentService.confirmPaymentToMyself(connection, userId, paymentId, breedingId);

    return res.status(200).send({status: payment.status});
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.payUser = async (req, res) => {
  try {
    const connection = req.connection;

    // body
    const breedingId = req.body.breedingId;
    if (!breedingId) {
      return res.status(400).send({error: 'Invalid data'});
    }

    // authorization
    const userId = req.user.id;

    const result = await paymentService.payUser(connection, userId, breedingId);

    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};