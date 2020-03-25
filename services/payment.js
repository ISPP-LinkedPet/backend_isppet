const stripe = require('stripe')(process.env.STRIPE_API_KEY, {
  maxNetworkRetries: 2,
});
const rp = require('request-promise-native');

exports.createPaymentToMyself = async (connection, token, userId, breedingId, returnUrl) => {
  // obtengo la breeding, y la publication
  const breeding = await connection('breeding').where('breeding.id', breedingId).first();
  const publication = await connection('publication').join('breeding', 'breeding.publication_id', '=', 'publication.id').where('breeding.id', breedingId).first();
  if (!breeding || !publication) {
    const error = new Error();
    error.status = 404;
    error.message = 'Breeding / publication not found';
    throw error;
  }

  // Realizo el pago
  const paymentCreate = await stripe.paymentMethods.create({
    type: 'card',
    card: {token},
  });

  const payment = await stripe.paymentIntents.create({
    amount: Number(breeding.price),
    currency: 'eur',
    payment_method: paymentCreate.id,
    payment_method_types: ['card'],
    confirm: true,
    return_url: returnUrl + `?breedingId=${breedingId}`,
  });

  // Obtengo el estado del pago
  if (payment.status === 'succeeded') {
    // si todo va bien, la publication pasa a ' In progress '
    await connection('publication').where('id', publication.id).update({transaction_status: 'In progress'});
  }

  return payment; // succeeded,requires_action,requires_source

};

exports.confirmPaymentToMyself = async (connection, userId, paymentId, breedingId) => {

  const breeding = await connection('breeding').where('breeding.id', breedingId).first();
  const publication = await connection('publication').join('breeding', 'breeding.publication_id', '=', 'publication.id').where('breeding.id', breedingId).first();
  if (!breeding || !publication) {
    const error = new Error();
    error.status = 404;
    error.message = 'Breeding / publication not found';
    throw error;
  }

  // Compruebo el pago
  const payment = await stripe.paymentIntents.retrieve(paymentId);

  if (payment.status !== 'succeeded') {
    const error = new Error();
    error.status = 404;
    error.message = 'Payment not success';
    throw error;
  }

  // TODO: por ahora no se hace nada, cuando se añada la nueva db cambiar estado a 'inPayment'
  await connection('publication').where('id', publication.id).update({transaction_status: 'In progress'});

  return payment; // succeeded,requires_action,requires_source
};

exports.payUser = async () => {
  let options = {
    method: 'POST',
    uri: 'https://AUySj4xr_LUAZYzmtCIGU7ny4xiHwIaZwRV3B4v9K281Aqu-Vj38CGPwqgOAoWiXsESiqj6hZF1nuZYy:EDKcubqJ6hn4D9UvKWjj1WmSKCmb6utCij_sjxYHsiTtrDNkeFjxiBCm789t5xlWkGnHuhfacEjKGEPz@api.sandbox.paypal.com/v1/oauth2/token',
    form: {
      grant_type: 'client_credentials',
    },
    json: true,
  };
  let result = await rp(options);

  options = {
    method: 'POST',
    uri: 'https://api.sandbox.paypal.com/v1/payments/payouts',
    body: {
      'sender_batch_header': {
        'sender_batch_id': new Date().getTime(),
      },
      'items': [
        {
          'recipient_type': 'EMAIL',
          'amount': {
            'value': '9.87',
            'currency': 'EUR',
          },
          'receiver': 'receiver@example.com',
        },
      ],
    },
    headers: {
      'Authorization': 'Bearer ' + result.access_token,
    },
    json: true,
  };
  result = await rp(options);

  return result;
};
