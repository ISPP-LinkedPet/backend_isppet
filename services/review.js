const REVIEW_FIELDS = [
  'review.id',
  'publication_id',
  'particular_id',
  'review_description',
  'star',
];

exports.getReview = async (connection, reviewId) => {
  const review = await connection('review')
      .select(REVIEW_FIELDS)
      .join('particular', 'review.particular_id', '=', 'particular.id')
      .where('review.id', reviewId)
      .first();

  if (!review) {
    const error = new Error();
    error.status = 400;
    error.message = 'No review with that ID';
    throw error;
  }

  return review;
};

exports.writeReview = async (reviewData, userId, trx) => {
  const particularId = await trx('particular')
      .select('id')
      .where('user_account_id', userId)
      .first();
  console.log(particularId);
  if (!particularId) {
    const error = new Error();
    error.status = 404;
    error.message = 'Not found user';
    throw error;
  }

  try {
    const reviewId = await trx('review').insert({
      publication_id: reviewData.publication_id,
      particular_id: particularId.id,
      star: reviewData.star,
      review_description: reviewData.review_description,
    });
    return await trx('review')
        .select('*', 'review.id as id')
        .where({'review.id': reviewId})
        .first();
  } catch (error) {
    console.err(error);
    throw error;
  }
};
