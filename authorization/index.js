const jwt = require('jsonwebtoken');

permission = (req, res, next, role) => {
  try {
    // get token
    const token = req.headers.authorization.replace('Bearer ', '');

    // verify token
    const user = jwt.verify(token, process.env.JWT_SECRET); // payload
    if (user.role != role) {
      res.status(500).send('User not allow');
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send('Invalid token');
  }
};

exports.vet = (req, res, next) => permission(req, res, next, 'vet');
exports.administrator = (req, res, next) => permission(req, res, next, 'administrator');
exports.moderator = (req, res, next) => permission(req, res, next, 'moderator');
exports.particular = (req, res, next) => permission(req, res, next, 'particular');
exports.shelter = (req, res, next) => permission(req, res, next, 'shelter');
