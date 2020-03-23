const stripe = require('stripe')(process.env.STRIPE_API_KEY, {
  maxNetworkRetries: 2,
});

exports.createPaymentToMyself = async (connection, token, userId, breedingId) => {
  // obtengo la breeding
  const breeding = await connection('breeding').where('breeding.id', breedingId).first();
  if (!breeding) {
    const error = new Error();
    error.status = 404;
    error.message = 'Breeding not found';
    throw error;
  }

  // Realizo el pago
  const paymentCreate = await stripe.paymentMethods.create({
    type: 'card',
    card: {token},
  });

  const payment = await stripe.paymentIntents.create({
    amount: breeding.price,
    currency: 'eur',
    payment_method: paymentCreate.id,
    payment_method_types: ['card'],
    confirm: true,
    return_url: ``,
  });

  // Obtengo el estado del pago
  if (payment.status === 'succeeded') {
    // TODO: por ahora no se hace nada, cuando se añada la nueva db cambiar estado a "inPayment"
  }

  return payment; // succeeded,requires_action,requires_source

};

exports.confirmPaymentToMyself = async (connection, paymentId) => {
  // Compruebo el pago
  const payment = await stripe.paymentIntents.retrieve(paymentId);

  if (payment.status !== 'succeeded') {
    const error = new Error();
    error.status = 404;
    error.message = 'Payment not success';
    throw error;
  }

  // TODO: por ahora no se hace nada, cuando se añada la nueva db cambiar estado a "inPayment"

  return payment; // succeeded,requires_action,requires_source

};
