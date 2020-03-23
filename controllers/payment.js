const paymentService = require('../services/payment');

exports.createPaymentToMyself = async (req, res) => {
  try {
    const connection = req.connection;

    // authorization
    const userId = req.user.id;

    const {token, breedingId} = JSON.parse(req.body || {});
    if (!token || !breedingId) {
      return res.status(400).send({error: 'Token and breedingId must be provided '});
    }

    const payment = await paymentService.createPaymentToMyself(connection, token, userId, breedingId);
    return res.status(200).send(payment.status);
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

    // authorization
    const userId = req.user.id;

    const paymentId = req.params.paymentId;
    if (isNaN(paymentId) || !paymentId) {
      return res.status(400).send({error: 'Payment ID must be a number'});
    }

    const payment = await paymentService.confirmPaymentToMyself(connection, userId, breedingId);
    return res.status(200).send(payment.status);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
