const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const USERS_FOLDER = path.join('images', 'users');
const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

exports.getUserLogin = async (connection, userName) =>{
  const rows = await connection('user_account')
      .select('user_account.id AS userId', 'user_account.role', 'user_account.password', 'user_account.activate')
      .where('user_account.user_name', userName);
  if (!rows.length) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found account';
    throw error;
  }
  if (rows[0].activate == 0) {
    const error = new Error();
    error.status = 400;
    error.message = 'Account desactivate';
    throw error;
  }

  return rows[0];
};

exports.register = async (trx, params) => {
  let photoName;
  try {
    // Check user_name
    const userNameCheck = await trx('user_account')
        .where('user_account.user_name', params.user_name)
        .first();
    if (userNameCheck) {
      const error = new Error();
      error.status = 400;
      error.message = 'User name already exists';
      throw error;
    }

    // Check user_name
    const emailCheck = await trx('user_account')
        .where('user_account.email', params.email)
        .first();
    if (emailCheck) {
      const error = new Error();
      error.status = 400;
      error.message = 'Email already exists';
      throw error;
    }

    // Check password
    if (params.password !== params.repeat_password) {
      const error = new Error();
      error.status = 400;
      error.message = 'Passwords do not match';
      throw error;
    }

    if (params.password.length < 8) {
      const error = new Error();
      error.status = 400;
      error.message = 'Password must have at least 8 characters';
      throw error;
    }

    if (params.files && params.files.optional_photo && !Array.isArray(params.files.optional_photo)) {
      photoName = path.join(
          USERS_FOLDER,
          `${uuidv4()}.${getExtension(
              params.files.optional_photo.name,
          )}`,
      );
      savePhoto(params.files.optional_photo, photoName);
    }

    const userData = {
      user_name: params.user_name,
      role: params.role,
      password: bcrypt.hashSync(params.password, 8),
      activate: 1, // activo por defecto
      register_date: new Date(),
      name: params.name,
      email: params.email,
      address: params.address,
      telephone: params.telephone,
      optional_photo: photoName || null,
    };

    // Particular
    if (params.role === 'particular') {
      // Check surname
      if (!params.surname) {
        const error = new Error();
        error.status = 400;
        error.message = 'A surname is required';
        throw error;
      }

      const userAccountId = await trx('user_account').insert(userData);
      const particularId = await trx('particular').insert({
        surname: params.surname,
        user_account_id: userAccountId,
      });

      return await trx('user_account')
          .select('*', 'user_account.id as userAccountId', 'particular.id as particularId')
          .join('particular', 'user_account.id', '=', 'particular.user_account_id')
          .where('particular.id', particularId)
          .first();
    }

    // Shelter
    if (params.role === 'shelter') {
      const userAccountId = await trx('user_account').insert(userData);
      const shelterId = await trx('shelter').insert({
        user_account_id: userAccountId,
      });

      const user = await trx('user_account')
          .select('*', 'user_account.id as userAccountId', 'shelter.id as shelterId')
          .join('shelter', 'user_account.id', '=', 'shelter.user_account_id')
          .where('shelter.id', shelterId)
          .first();
      delete user.password; // Quitamos la contraseña para no devolverla
      return user;
    }

    const error = new Error();
    error.status = 400;
    error.message = 'Role not allowed';
    throw error;
  } catch (error) {
    if (photoName) {
      fs.unlink(path.join('public', photoName), (err) => {
        // nothing to do
      });
    }
    throw error;
  }
};

const getExtension = (photo) => {
  const extension = photo.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    const error = new Error();
    error.status = 404;
    error.message = 'No valid extension';
    throw error;
  }
  return photo.split('.').pop();
};

const savePhoto = async (photo, photoRoute) => {
  await photo.mv(path.join('public', photoRoute));
};
