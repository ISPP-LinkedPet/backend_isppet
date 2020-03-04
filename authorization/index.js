const jwt = require('jsonwebtoken');

exports.user = (req, res, next) => {
  try {
    // get token
    const token = req.headers.authorization;

    // verify token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(500).send('Invalid token');
  }
};
