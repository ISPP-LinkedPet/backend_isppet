const breedingService = require('../services/breeding');

exports.getBreeding = async (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) {
    return res.status(400).json({error: 'ID must be a number'});
  }

  try {
    const connection = req.connection;
    const breeding = await breedingService.getBreeding(id, connection);
    if (breeding) {
      return res.status(200).json({breeding});
    } else {
      return res.status(400).json({error: 'No breeding with that ID'});
    }
  } catch (error) {
    return res.status(400).json({error});
  }
};

exports.createBreading = async (req, res) => {
  const breedingData = req.body;

  try {
    const connection = req.connection;
    const breeding = await breedingService.createBreeding(
        breedingData,
        connection,
    );
    if (breeding) {
      return res.status(200).json({breeding});
    } else {
      return res.status(400).json({error: 'Wrong data'});
    }
  } catch (error) {
    return res.status(400).json({error});
  }
};
