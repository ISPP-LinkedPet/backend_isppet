const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const TOP_BANNER = path.join('images', 'top_banner');
const LATERAL_BANNER = path.join('images', 'lateral_banner');
const USERS_FOLDER = path.join('images', 'users');
const ALLOWED_EXTENSIONS = ['jpg', 'png', 'jpeg'];

exports.banUser = async (connection, userId) => {
  const user = await this.getUserAccount(connection, userId);

  if (!user) {
    const error = new Error();
    error.status = 400;
    error.message = 'No user with that ID';
    throw error;
  }

  if (!user.activate) {
    const error = new Error();
    error.status = 400;
    error.message = 'This user has already been banned';
    throw error;
  }

  try {
    user.activate = false;
    await connection('user_account')
        .where({'user_account.id': userId})
        .update(user);

    return await connection('user_account')
        .where({'user_account.id': userId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.getUserAccount = async (connection, userId) => {
  const res = await connection('user_account')
      .where({'user_account.id': userId})
      .first();

  return res;
};

exports.unbanUser = async (connection, userId) => {
  const user = await this.getUserAccount(connection, userId);

  if (!user) {
    const error = new Error();
    error.status = 400;
    error.message = 'No user with that ID';
    throw error;
  }

  if (user.activate) {
    const error = new Error();
    error.status = 400;
    error.message = 'This user has already been unbanned';
    throw error;
  }

  try {
    user.activate = true;
    await connection('user_account')
        .where({'user_account.id': userId})
        .update(user);

    return await connection('user_account')
        .where({'user_account.id': userId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.getUserAccount = async (connection, userId) => {
  const res = await connection('user_account')
      .where({'user_account.id': userId})
      .first();

  return res;
};

exports.getBanUsers = async (connection, userId) => {
  const user = await connection('administrator')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const banUsers = await connection('user_account').where({
    'user_account.activate': false,
  });
  return banUsers;
};

exports.getUnbanUsers = async (connection, userId) => {
  const user = await connection('administrator')
      .select('id')
      .where('user_account_id', userId)
      .first();
  if (!user) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  const unbanUsers = await connection('user_account').where({
    'user_account.activate': true,
  });
  return unbanUsers;
};

exports.updateAds = async (connection, adData, adPhotos, adId, role) => {
  const ad = await connection('ad_suscription')
      .where('ad_suscription.id', adId)
      .first();

  if (!ad) {
    const error = new Error();
    error.status = 404;
    error.message = 'Ad not found';
    throw error;
  }

  if (role != 'administrator') {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not edit an ad because you are not an administrator';
    throw error;
  }

  const allPhotos = [];
  const topBanner = [];
  const lateralBanner = [];

  try {
    if (adPhotos.top_banner) {
      const photoName = path.join(
          TOP_BANNER,
          `${uuidv4()}.${getExtension(adPhotos.top_banner.name)}`,
      );
      savePhoto(adPhotos.top_banner, photoName);
      topBanner.push(photoName);
    }

    allPhotos.push(...topBanner);

    if (adPhotos.lateral_banner) {
      const photoName = path.join(
          LATERAL_BANNER,
          `${uuidv4()}.${getExtension(adPhotos.lateral_banner.name)}`,
      );
      savePhoto(adPhotos.lateral_banner, photoName);
      lateralBanner.push(photoName);
    }

    allPhotos.push(...lateralBanner);

    const data = {
      top_banner: topBanner.join(','),
      lateral_banner: lateralBanner.join(','),
      ad_type: adData.ad_type,
      price: adData.price,
      redirect_to: adData.redirect_to || null,
    };

    await connection('ad_suscription')
        .where('ad_suscription.id', adId)
        .update(data);

    return await connection('ad_suscription')
        .where('ad_suscription.id', adId)
        .first();
  } catch (error) {
    // Borramos las fotos guardadas en caso de error
    allPhotos.forEach((photo) => {
      fs.unlink(path.join('public', photo), (err) => {
        // nothing to do
      });
    });
    throw error;
  }
};

exports.createAds = async (connection, adData, adPhotos, role) => {
  if (role != 'administrator') {
    const error = new Error();
    error.status = 404;
    error.message = 'You can not create an ad because you are not an administrator';
    throw error;
  }

  const allPhotos = [];
  const topBanner = [];
  const lateralBanner = [];

  try {
    if (adPhotos.top_banner) {
      const photoName = path.join(
          TOP_BANNER,
          `${uuidv4()}.${getExtension(adPhotos.top_banner.name)}`,
      );
      savePhoto(adPhotos.top_banner, photoName);
      topBanner.push(photoName);
    }

    allPhotos.push(...topBanner);

    if (adPhotos.lateral_banner) {
      const photoName = path.join(
          LATERAL_BANNER,
          `${uuidv4()}.${getExtension(adPhotos.lateral_banner.name)}`,
      );
      savePhoto(adPhotos.lateral_banner, photoName);
      lateralBanner.push(photoName);
    }

    allPhotos.push(...lateralBanner);

    const data = {
      top_banner: topBanner.join(','),
      lateral_banner: lateralBanner.join(','),
      ad_type: adData.ad_type,
      price: adData.price,
      redirect_to: adData.redirect_to || null,
      vet_id: adData.vet_id,
      active: adData.active,
    };

    const adId = await connection('ad_suscription').insert(data);

    return await connection('ad_suscription')
        .where('ad_suscription.id', adId)
        .first();
  } catch (error) {
    // Borramos las fotos guardadas en caso de error
    allPhotos.forEach((photo) => {
      fs.unlink(path.join('public', photo), (err) => {
        // nothing to do
      });
    });
    throw error;
  }
};

const savePhoto = async (photo, photoRoute) => {
  await photo.mv(path.join('public', photoRoute));
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

exports.activateAd = async (connection, adId) => {
  const ad = await this.getAd(connection, adId);

  if (!ad) {
    const error = new Error();
    error.status = 400;
    error.message = 'No ad with that ID';
    throw error;
  }

  if (ad.active) {
    const error = new Error();
    error.status = 400;
    error.message = 'This ad is already in active status.';
    throw error;
  }

  try {
    ad.active = true;
    await connection('ad_suscription')
        .where({'ad_suscription.id': adId})
        .update(ad);

    return await connection('ad_suscription')
        .where({'ad_suscription.id': adId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.deactivateAd = async (connection, adId) => {
  const ad = await this.getAd(connection, adId);

  if (!ad) {
    const error = new Error();
    error.status = 400;
    error.message = 'No ad with that ID';
    throw error;
  }

  if (!ad.active) {
    const error = new Error();
    error.status = 400;
    error.message = 'This ad is already in a deactivated state.';
    throw error;
  }

  try {
    ad.active = false;
    await connection('ad_suscription')
        .where({'ad_suscription.id': adId})
        .update(ad);

    return await connection('ad_suscription')
        .where({'ad_suscription.id': adId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};

exports.getAd = async (connection, adId) => {
  const res = await connection('ad_suscription')
      .where({'ad_suscription.id': adId})
      .first();

  return res;
};

exports.makeVetPremium = async (trx, vetId) => {
  const vet = await trx('vet').where('vet.id', vetId).andWhere('vet.is_premium', 0).first();
  if (!vet) {
    const error = new Error();
    error.status = 400;
    error.message = 'This vet is already premium';
    throw error;
  }

  const makeVetPremium = await trx('vet').where('vet.id', vetId).update({is_premium: 1});
  if (!makeVetPremium) {
    const error = new Error();
    error.status = 403;
    error.message = 'Not make premium';
    throw error;
  }
};

exports.cancelVetPremium = async (trx, vetId) => {

  const vet = await trx('vet').where('vet.id', vetId).andWhere('vet.is_premium', 1).first();
  if (!vet) {
    const error = new Error();
    error.status = 403;
    error.message = 'This vet is not premium, so you cannot cancel';
    throw error;
  }

  const cancelVetPremium = await trx('vet').where('vet.id', vetId).update({is_premium: 0});
  if (!cancelVetPremium) {
    const error = new Error();
    error.status = 403;
    error.message = 'Not cancel';
    throw error;
  }
};

exports.registerShelter = async (trx, params) => {
  let photoName;
  try {
    // Check user_name
    const error = new Error();
    const userNameCheck = await trx('user_account')
        .where('user_account.user_name', params.user_name)
        .first();
    if (userNameCheck) {
      error.status = 400;
      error.message = 'El nombre de usuario introducido ya existe';
      throw error;
    }

    // Check user_name
    const emailCheck = await trx('user_account')
        .where('user_account.email', params.email)
        .first();
    if (emailCheck) {
      error.status = 400;
      error.message = 'El email introducido ya existe';
      throw error;
    }

    // Check password
    if (params.password !== params.repeat_password) {
      error.status = 400;
      error.message = 'La contraseña no coincide con la verificación';
      throw error;
    }

    if (params.password.length < 8) {
      error.status = 400;
      error.message = 'La contraseña debe tener una longitud de al menos 8 caracteres';
      throw error;
    }

    if (params.files && params.files.optional_photo && !Array.isArray(params.files.optional_photo)) {
      photoName = path.join(
          USERS_FOLDER,
          `${uuidv4()}.${getExtension(params.files.optional_photo.name)}`,
      );
      savePhoto(params.files.optional_photo, photoName);
    }

    const userData = {
      user_name: params.user_name,
      role: 'shelter',
      password: bcrypt.hashSync(params.password, 8),
      activate: 1, // activo por defecto
      register_date: new Date(),
      name: params.name,
      email: params.email,
      address: params.address,
      telephone: params.telephone,
      optional_photo: photoName || null,
    };

    // Shelter
    const userAccountId = await trx('user_account').insert(userData);
    const shelterId = await trx('shelter').insert({ user_account_id: userAccountId });
    console.log(shelterId);

    const user = await trx('user_account')
        .select('*', 'user_account.id as userAccountId', 'shelter.id as shelterId')
        .join('shelter', 'user_account.id', '=', 'shelter.user_account_id')
        .where('shelter.id', shelterId)
        .first();
    delete user.password; // Quitamos la contraseña para no devolverla

    return user;
  } catch (error) {
    if (photoName) {
      fs.unlink(path.join('public', photoName), (err) => {
        // nothing to do
      });
    }
    throw error;
  }
};

