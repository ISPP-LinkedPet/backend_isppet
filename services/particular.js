const pdf = require('html-pdf');

const REVIEW_FIELDS = [
  'user_account_id',
  'particular.id',
  'surname',
  'user_account.name',
  'user_account.user_name',
  'user_account.role',
  'user_account.name',
  'user_account.register_date',
  'user_account.address',
  'user_account.optional_photo',
  'user_account.email',
  'user_account.telephone',
];

exports.getParticular = async (connection, particularId) => {
  const particular = await connection('particular')
      .select(REVIEW_FIELDS)
      .join('user_account', 'particular.user_account_id', '=', 'user_account.id')
      .where('particular.id', particularId)
      .first();

  if (!particular) {
    const error = new Error();
    error.status = 400;
    error.message = 'No particulars with that ID';
    throw error;
  }

  return particular;
};

exports.getParticularLogged = async (connection, userId) => {
  const particular = await connection('particular')
      .select(REVIEW_FIELDS)
      .join('user_account', 'particular.user_account_id', '=', 'user_account.id')
      .where('particular.user_account_id', userId)
      .first();

  if (!particular) {
    const error = new Error();
    error.status = 400;
    error.message = 'No particulars with that ID';
    throw error;
  }

  return particular;
};

exports.hasRequestFrom = async (connection, userId, particularId) => {
  let hasRequest = false;
  const particular = await connection('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (particular == undefined) {
    const error = new Error();
    error.status = 404;
    error.message = 'Particular no encontrado';
    throw error;
  }

  const request = await connection('request')
      .select('*')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.status', 'Pending')
      .andWhere('request.particular_id', particularId);

  const request1 = await connection('request')
      .select('*')
      .join('publication', 'request.publication_id', '=', 'publication.id')
      .where('publication.particular_id', particular.id)
      .andWhere('request.status', 'Accepted')
      .andWhere('request.particular_id', particularId);

  if (request.length || request1.length) {
    hasRequest = true;
  }

  return hasRequest;
};


exports.getMyData = async (connection, userId) => {
  const userData = await connection('particular')
      .select('name', 'surname', 'email', 'address', 'telephone')
      .join('user_account', 'particular.user_account_id', '=', 'user_account.id')
      .where('particular.user_account_id', userId).first();
  const breedingsData = await connection('particular')
      .select('breed', 'genre', 'type', 'birth_date', 'location', 'pedigree', 'price')
      .join('publication', 'particular.id', '=', 'publication.particular_id')
      .join('breeding', 'publication.id', '=', 'breeding.publication_id')
      .where('particular.user_account_id', userId);
  const adoptionsData = await connection('particular')
      .select('breed', 'genre', 'type', 'birth_date', 'location', 'pedigree', 'name', 'taxes')
      .join('publication', 'particular.id', '=', 'publication.particular_id')
      .join('adoption', 'publication.id', '=', 'adoption.publication_id')
      .where('particular.user_account_id', userId);
  const petsData = await connection('particular')
      .select('breed', 'genre', 'type', 'birth_date', 'pedigree')
      .join('pet', 'particular.id', '=', 'pet.particular_id')
      .where('particular.user_account_id', userId);

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
                      <td>${userData.surname}</td>
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

  if (breedingsData) {
    pdfFile += `<tr class="heading">
                        <td colspan="2">Crianzas:</td>
                    </tr>`;
    breedingsData.forEach((breeding) => {
      pdfFile += `<tr class="item">
                        <td>Raza:</td>
                        <td>${breeding.breed || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Género:</td>
                        <td>${breeding.genre || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Tipo:</td>
                        <td>${breeding.type || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Fecha de nacimiento:</td>
                        <td>${breeding.birth_date ? breeding.birth_date.toLocaleDateString() : 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Localización:</td>
                        <td>${breeding.location}</td>
                    </tr>
                    <tr class="item">
                        <td>Pedigree:</td>
                        <td>${breeding.pedigree === 1 ? 'Sí' : 'No'}</td>
                    </tr>
                    <tr class="item">
                        <td>Precio:</td>
                        <td>${breeding.price} €</td>
                    </tr>
                    <tr class="item">
                        <td class="separator" colspan="2"></td>
                    </tr>
                    <tr class="item">
                        <td colspan="2"></td>
                    </tr>`;
    });
  }
  if (adoptionsData) {
    pdfFile += `<tr class="heading">
                        <td colspan="2">Adopciones:</td>
                    </tr>`;
    adoptionsData.forEach((adoption) => {
      pdfFile += `<tr class="item">
                        <td>Raza:</td>
                        <td>${adoption.breed || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Género:</td>
                        <td>${adoption.genre || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Tipo:</td>
                        <td>${adoption.type || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Fecha de nacimiento:</td>
                        <td>${adoption.birth_date ? adoption.birth_date.toLocaleDateString() : 'Pendiente de validación'}</td>
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
  if (petsData) {
    pdfFile += `<tr class="heading">
                        <td colspan="2">Mascotas:</td>
                    </tr>`;
    petsData.forEach((pet) => {
      pdfFile += `<tr class="item">
                        <td>Raza:</td>
                        <td>${pet.breed || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Género:</td>
                        <td>${pet.genre || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Tipo:</td>
                        <td>${pet.type || 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Fecha de nacimiento:</td>
                        <td>${pet.birth_date ? pet.birth_date.toLocaleDateString() : 'Pendiente de validación'}</td>
                    </tr>
                    <tr class="item">
                        <td>Pedigree:</td>
                        <td>${pet.pedigree === 1 ? 'Sí' : 'No'}</td>
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

exports.deleteParticular = async (trx, userId) => {
  const particular = await trx('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();

  if (!particular) {
    const error = new Error();
    error.status = 400;
    error.message = 'No particulars with that ID';
    throw error;
  }

  await trx('user_account')
      .where('user_account.id', userId)
      .del();

  return true;
};
