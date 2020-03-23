const reviewService = require('../services/review');

exports.getReview = async (req, res) => {
  try {
    const connection = req.connection;

    const reviewId = req.params.id;
    if (isNaN(reviewId)) {
      return res.status(400).send('ID must be a number');
    }

    const review = await reviewService.getReview(connection, reviewId);
    return res.status(200).send({review});
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
