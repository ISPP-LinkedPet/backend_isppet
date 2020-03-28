exports.getRandomAds = async (trx) => {
  const ads = await trx('ad_suscription')
      .select('id', 'top_banner', 'lateral_banner', 'ad_type', 'redirect_to', 'view_count')
      .where('ad_suscription.active', true);

  if (!ads.length) {
    const error = new Error();
    error.status = 404;
    error.message = 'No valid ads at the moment';
    throw error;
  }

  const topAd = ads[Math.floor(Math.random() * ads.length)];
  const lateralAds = [ads[Math.floor(Math.random() * ads.length)], ads[Math.floor(Math.random() * ads.length)]];

  for (const ad of [topAd, ...lateralAds]) {
    if (ad.ad_type === 'CPM') {
      await trx('ad_suscription')
          .where('ad_suscription.id', ad.id)
          .update({view_count: ad.view_count + 1});
    }
  }

  return {
    topAd,
    lateralAds,
  };
};
