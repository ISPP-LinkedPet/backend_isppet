const authService = require('../services/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const connection = req.connection;

    const {
      userName,
      password,
    } = req.body;
    if (userName == undefined || password == undefined) {
      return res.status(400).send('Bad params');
    }

    const user = await authService.getUserLogin(connection, userName);

    // bcrypt
    const correctPassword = bcrypt.compareSync(password, user.password);
    if (!correctPassword) {
      return res.status(404).send('Incorrect password');
    }

    // jwt, role and userId
    const access_token = jwt.sign({id: user.userId, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});

    return res.status(200).send({access_token});
  } catch (error) {
    console.log(error);
    if (error.status && error.message) return res.status(error.status).send(error.message);
    return res.status(500).send(error);
  }
};
