const jwt = require('jsonwebtoken');

permission = (req, res, next, roles) => {
  try {
    // get token
    const token = req.headers.authorization.replace('Bearer ', '');
    // verify token
    const user = jwt.verify(token, process.env.JWT_SECRET); // payload

    if (!roles.includes(user.role)) {
      res.status(403).send('User role not allow');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};

// a user with a specific role
exports.vet = (req, res, next) => permission(req, res, next, ['vet']);
exports.administrator = (req, res, next) =>
  permission(req, res, next, ['administrator']);
exports.moderator = (req, res, next) =>
  permission(req, res, next, ['moderator']);
exports.particular = (req, res, next) =>
  permission(req, res, next, ['particular']);
exports.shelter = (req, res, next) => permission(req, res, next, ['shelter']);

// every body register
exports.all = (req, res, next) =>
  permission(req, res, next, [
    'administrator',
    'particular',
    'moderator',
    'shelter',
  ]);

// few specific role
exports.shelter_particular = (req, res, next) =>
  permission(req, res, next, ['shelter', 'particular']);
