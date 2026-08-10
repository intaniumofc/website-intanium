export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://irisofc.my.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
