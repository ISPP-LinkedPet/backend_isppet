const pdf = require('html-pdf');

exports.getShelters = async (connection, page) => {
  const shelters = await connection('shelter').select('*')
      .innerJoin('user_account', 'shelter.user_account_id', '=', 'user_account.id')
      .innerJoin('adoption', 'shelter.adoption_id', '=', 'adoption.id')
      .innerJoin('publication', 'adoption.publication_id', '=', 'publication.id')
      .limit(10).offset(10*page);

  return shelters;
};

exports.getShelter = async (connection, shelterId) => {
  const shelter = await connection('shelter')
      .innerJoin('user_account', 'shelter.user_account_id', '=', 'user_account.id')
      .where('shelter.id', shelterId)
      .first();

  if (!shelter) {
    const error = new Error();
    error.status = 400;
    error.message = 'No shelters with that ID';
    throw error;
  }

  return shelter;
};


exports.getMyData = async (connection, userId) => {
  const userData = await connection('shelter')
      .select('name', 'user_name', 'email', 'address', 'telephone')
      .join('user_account', 'shelter.user_account_id', '=', 'user_account.id')
      .where('shelter.user_account_id', userId).first();
  const adoptionsData = await connection('shelter')
      .select('breed', 'genre', 'type', 'birth_date', 'location', 'pedigree', 'name', 'taxes')
      .join('adoption', 'shelter.id', '=', 'adoption.shelter_id')
      .join('publication', 'publication.id', '=', 'adoption.publication_id')
      .where('shelter.user_account_id', userId);

  const today = new Date();
  let pdfFile = `
  <!doctype html>
  <html>
     <head>
        <meta charset="utf-8">
        <title>Datos</title>
        <style>
           .invoice-box {
           max-width: 800px;
           margin: auto;
           padding: 30px;
           border: 1px solid #eee;
           box-shadow: 0 0 10px rgba(0, 0, 0, .15);
           font-size: 16px;
           line-height: 24px;
           font-family: 'Helvetica Neue', 'Helvetica',
           color: #555;
           }
           .margin-top {
           margin-top: 50px;
           }
           .justify-center {
           text-align: center;
           }
           .invoice-box table {
           width: 100%;
           line-height: inherit;
           text-align: left;
           }
           .invoice-box table td {
           padding: 5px;
           vertical-align: top;
           }
           .invoice-box table tr td:nth-child(2) {
           text-align: right;
           }
           .invoice-box table tr.top table td {
           padding-bottom: 20px;
           }
           .invoice-box table tr.top table td.title {
           font-size: 45px;
           line-height: 45px;
           color: #333;
           }
           .invoice-box table tr.information table td {
           padding-bottom: 40px;
           }
           .invoice-box table tr.heading td {
           background: #eee;
           border-bottom: 1px solid #ddd;
           font-weight: bold;
           }
           .separator {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            }
           .invoice-box table tr.details td {
           padding-bottom: 20px;
           }
           .invoice-box table tr.item td {
           border-bottom: 1px solid #eee;
           }
           .invoice-box table tr.item.last td {
           border-bottom: none;
           }
           .invoice-box table tr.total td:nth-child(2) {
           border-top: 2px solid #eee;
           font-weight: bold;
           }
           @media only screen and (max-width: 600px) {
           .invoice-box table tr.top table td {
           width: 100%;
           display: block;
           text-align: center;
           }
           .invoice-box table tr.information table td {
           width: 100%;
           display: block;
           text-align: center;
           }
           }
        </style>
     </head>
     <body>
        <div class="invoice-box">
           <table cellpadding="0" cellspacing="0">
              <tr class="top">
                 <td colspan="2">
                    <table>
                       <tr>
                          <td>
                             Fecha de creación: ${`${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}.`}
                          </td>
                       </tr>
                    </table>
                 </td>
              </tr>`;


  pdfFile += `<tr class="heading">
                      <td colspan="2">Usuario:</td>
                  </tr>
                  <tr class="item">
                      <td>Nombre:</td>
                      <td>${userData.name}</td>
                  </tr>
                  <tr class="item">
                      <td>Alias:</td>
                      <td>${userData.user_name}</td>
                  </tr>
                  <tr class="item">
                      <td>Email:</td>
                      <td>${userData.email}</td>
                  </tr>
                  <tr class="item">
                      <td>Dirección:</td>
                      <td>${userData.address}</td>
                  </tr>
                  <tr class="item">
                      <td>Teléfono:</td>
                      <td>${userData.telephone}</td>
                  </tr>
                    <tr class="item">
                        <td colspan="2"></td>
                    </tr>`;

  if (adoptionsData) {
    pdfFile += `<tr class="heading">
                        <td colspan="2">Adopciones:</td>
                    </tr>`;
    adoptionsData.forEach((adoption) => {
      pdfFile += `<tr class="item">
                        <td>Raza:</td>
                        <td>${adoption.breed}</td>
                    </tr>
                    <tr class="item">
                        <td>Género:</td>
                        <td>${adoption.genre}</td>
                    </tr>
                    <tr class="item">
                        <td>Tipo:</td>
                        <td>${adoption.type}</td>
                    </tr>
                    <tr class="item">
                        <td>Fecha de nacimiento:</td>
                        <td>${adoption.birth_date.toLocaleDateString()}</td>
                    </tr>
                    <tr class="item">
                        <td>Localización:</td>
                        <td>${adoption.location}</td>
                    </tr>
                    <tr class="item">
                        <td>Pedigree:</td>
                        <td>${adoption.pedigree === 1 ? 'Sí' : 'No'}</td>
                    </tr>
                    <tr class="item">
                        <td>Nombre:</td>
                        <td>${adoption.name}</td>
                    </tr>
                    <tr class="item">
                        <td>Impuestos:</td>
                        <td>${adoption.taxes} €</td>
                    </tr>
                    <tr class="item">
                        <td class="separator" colspan="2"></td>
                    </tr>
                    <tr class="item">
                        <td colspan="2"></td>
                    </tr>`;
    });
  }
  pdfFile += `</table >
        </div >
     </body >
  </html>`;

  const data = await crearPdf(pdfFile);

  return data;
};

const crearPdf = async (pdfFile) => {
  return new Promise((resolve, reject) => {
    pdf.create(pdfFile, {}).toBuffer((error, res) => {
      if (error) {
        const error = new Error();
        error.status = 400;
        error.message = 'Error generando el PDF';
        reject(error);
      }
      resolve(res);
    });
  });
};
