const REVIEW_FIELDS = [
  'review.id',
  'publication_id',
  'request_id',
  'review_description',
  'star',
];

exports.getReview = async (connection, reviewId) => {
  const review = await connection('review')
      .select(REVIEW_FIELDS)
      .join('publication', 'review.publication_id', '=', 'publication.id')
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
