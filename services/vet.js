const axios = require('axios');
const BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';
const API_KEY = '53125aca466345fd809c44468d122456';

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
          };
        });
      }),
  );

  return vets;
};

exports.premiumTrue = async (vetId, trx) => {
  const vet = await trx('vet')
      .select('*')
      .where('vet.id', vetId)
      .first();
  if (!vet) {
    const error = new Error();
    error.status = 404;
    error.message = 'Veterinario no encontrado';
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
    error.message = 'Veterinario no encontrado';
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
