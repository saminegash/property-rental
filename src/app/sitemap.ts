import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myethioproperties.com';

  const routes = [
    '',
    '/properties',
    '/properties/rent',
    '/properties/sale',
    '/properties/apartments',
    '/properties/houses',
    '/properties/villas',
    '/properties/land',
    '/cars',
    '/cars/rent',
    '/cars/sale',
    '/cars/with-driver',
    '/cars/without-driver',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/refund',
    '/report',
    '/safety',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
