getLatAlt=function(address) {
  const https = require('https');

  const apiKey = '53125aca466345fd809c44468d122456';
  const url = 'https://api.opencagedata.com/geocode/v1/json?q='+
   address+'&key=' + apiKey+ '&language=es&pretty=1';
  https.get(url, (resp) => {
    let data = '';
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      return JSON.parse(data);
    });
  }).on('error', (err) => {
    console.log('Error: ' + err.message);
  });
};
exports.getVets = async (connection) => {
  const vets = await connection('vet');
  //const vetAndAddress = {};
  for (const vet of vets) {
    const address = getLatAlt(vet.adress);
    console.log(vet.adress);
    console.log(address);
  }
  return vets;
};
