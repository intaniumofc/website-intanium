export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://website-IRIS.vercel.app';

  const routes = [
    '',
    '/about-iris',
    '/about-intan',
    '/schedule',
    '/merchandise',
    '/news',
    '/gallery',
    '/fanart',
    '/mading',
    '/denger-intan',
    '/esport',
    '/games',
    '/games/gosok-intan',
    '/games/menangkap-kecoa',
    '/photobooth',
    '/recaps',
    '/milestone',
    '/join',
  ];

  const currentDate = new Date().toISOString();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/schedule' || route === '/news' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : (route === '/schedule' || route === '/merchandise' || route === '/news' ? 0.8 : 0.6),
  }));
}
