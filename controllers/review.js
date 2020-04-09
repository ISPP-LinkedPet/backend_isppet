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

exports.writeReview = async (req, res) => {
  const connection = req.connection;

  // create transaction
  const trx = await connection.transaction();

  try {
    const reviewData = req.body;
    const userId = req.user.id;

    const review = await reviewService.writeReview(
        reviewData,
        userId,
        trx,
    );

    // commit
    await trx.commit();

    return res.status(200).send(review);
  } catch (error) {
    console.log(error);
    // rollback
    await trx.rollback();
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};

exports.getReviewsByParticularId = async (req, res) => {
  try {
    const connection = req.connection;

    // params
    const particularId = req.params.id;
    if (isNaN(particularId)) {
      return res.status(400).send('ID must be a number');
    }

    const review = await reviewService.getReviewsByParticularId(connection, particularId);

    return res.status(200).send(review);
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res.status(error.status).send({error: error.message});
    }
    return res.status(500).send({error});
  }
};
