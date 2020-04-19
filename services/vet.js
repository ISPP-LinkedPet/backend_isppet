const axios = require('axios');
const BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';
const API_KEY = '618ea96fc0f54c96a0698390953f0c79';

exports.getVets = async (connection) => {
  const vets = await connection('vet').orderBy('is_premium', 'desc');
  const addresses = vets.map((vet) => {
    if (!vet.latitude || !vet.longitude) {
      const address = encodeURI(vet.address);
      const url = `${BASE_URL}?q=${address}&key=${API_KEY}&language=es&pretty=1`;
      return axios({
        method: 'get',
        url,
      });
    };
  });

  await axios.all(addresses).then(
      axios.spread((...responses) => {
        responses.forEach((r, index) => {
          const vet = vets[index];
          if (!vet.latitude || !vet.longitude) {
            vet.latitude = r.data.results[0].geometry.lat;
            vet.longitude = r.data.results[0].geometry.lng;
            this.updateLatLong(connection, vet);
          };
        });
      }),
  );

  return vets;
};

exports.updateLatLong = async (connection, vet) => {
  const vetId = vet.id;

  if (!vet) {
    const error = new Error();
    error.status = 400;
    error.message = 'No vet with that ID';
    throw error;
  }

  try {
    await connection('vet')
        .where({'vet.id': vetId})
        .update(vet);

    await connection.commit();

    return await connection('vet')
        .where({'vet.id': vetId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.premiumTrue = async (vetId, trx) => {
  const vet = await trx('vet')
      .select('*')
      .where('vet.id', vetId)
      .first();
  if (!vet) {
    const error = new Error();
    error.status = 404;
    error.message = 'vet not found';
    throw error;
  }
  try {
    const vetData = {};
    vetData.is_premium = true;

    await trx('vet')
        .where({'vet.id': vetId})
        .update(vetData);
    return await trx('vet')
        .select('*', 'vet.id as id')
        .where({'vet.id': vetId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.premiumFalse = async (vetId, trx) => {
  const vet = await trx('vet')
      .select('*')
      .where('vet.id', vetId)
      .first();
  if (!vet) {
    const error = new Error();
    error.status = 404;
    error.message = 'vet not found';
    throw error;
  }
  try {
    const vetData = {};
    vetData.is_premium = false;

    await trx('vet')
        .where({'vet.id': vetId})
        .update(vetData);
    return await trx('vet')
        .select('*', 'vet.id as id')
        .where({'vet.id': vetId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};
