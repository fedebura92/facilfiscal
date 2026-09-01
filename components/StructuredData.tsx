export default function StructuredData({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

export function breadcrumbJsonLd(items: { name:string; url:string }[]) {
  return {
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:items.map((item, index) => ({
      '@type':'ListItem', position:index + 1, name:item.name, item:item.url,
    })),
  }
}
