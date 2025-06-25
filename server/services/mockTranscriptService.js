const mockTranscript = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return `Bonjour, je suis Sherine, directrice de casting chez Riviera Connection. Aujourd'hui, j'aimerais en savoir un peu plus sur votre profil pour un projet à venir.Bonjour, pouvez-vous vous présenter rapidement ?Bonjour, je m'appelle Thomas Durand, j'ai 27 ans. Je travaille actuellement comme assistant de production dans une société de films publicitaires à Lyon.Quelle est votre expérience dans le milieu artistique ?J'ai travaillé pendant deux ans comme régisseur sur des courts métrages indépendants, puis j'ai rejoint une boîte de production où j'ai été en charge de la logistique et du planning sur une dizaine de tournages.Quelles sont vos disponibilités ?Je suis disponible à partir du 15 juillet, à temps plein, sans contrainte particulière.Et niveau prétentions salariales ?Je cherche autour de 1800 euros net mensuels, mais je suis ouvert à discussion selon le projet.Merci Thomas, on revient vers vous très vite.`;
};

export default mockTranscript;
