const userService = require('../services/user');


exports.getUser = async (req, res) => {
  const connection = req.connection;

  try {
    // authorization
    const userId = req.user.id;

    const user = await userService.getUser(
        connection,
        userId,
    );

    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
