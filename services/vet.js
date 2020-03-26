const axios = require('axios');
const BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';
const API_KEY = '53125aca466345fd809c44468d122456';

exports.getVets = async (connection) => {
  const vets = await connection('vet').orderBy('is_premium', 'desc');
  const addresses = vets.map((vet) => {
    const address = encodeURI(vet.address);
    const url = `${BASE_URL}?q=${address}&key=${API_KEY}&language=es&pretty=1`;
    return axios({
      method: 'get',
      url,
    });
  });

  await axios.all(addresses).then(axios.spread((...responses) => {
    responses.forEach((r, index) => {
      const vet = vets[index];
      vet.latitude = r.data.results[0].geometry.lat;
      vet.longitude = r.data.results[0].geometry.lng;
    });
  }));

  return vets;
};
