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

    // authorization
    const userId = req.user.id;

    const paymentId = req.params.id;
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
