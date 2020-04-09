exports.getRandomAds = async (trx, numAds) => {
  const allAds = await trx('ad_suscription')
      .select('id', 'top_banner', 'lateral_banner', 'ad_type', 'redirect_to', 'view_count')
      .where('ad_suscription.active', true);

  if (!allAds.length) {
    const error = new Error();
    error.status = 404;
    error.message = 'No valid ads at the moment';
    throw error;
  }

  const ads = [];
  for (let i = 0; i < numAds; i++) {
    const ad = allAds[Math.floor(Math.random() * allAds.length)];
    if (ad.ad_type === 'CPM') {
      await trx('ad_suscription')
          .where('ad_suscription.id', ad.id)
          .update({view_count: ad.view_count + 1});
    }
    ads.push(ad);
  }

  return ads;
};

exports.addClick = async (trx, adId) => {
  const ad = await trx('ad_suscription')
      .select('id', 'click_count')
      .where('ad_suscription.id', adId)
      .first();

  if (!ad) {
    const error = new Error();
    error.status = 404;
    error.message = 'No ad with that id';
    throw error;
  }

  await trx('ad_suscription')
      .where('ad_suscription.id', ad.id)
      .update({click_count: ad.click_count + 1});

  return true;
};
