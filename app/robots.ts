import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/unsubscribe'],
    },
    sitemap: 'https://facilfiscal.com.ar/sitemap.xml',
  }
}
