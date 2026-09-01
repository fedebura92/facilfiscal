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

export function calculatorJsonLd(name:string, description:string, path:string) {
  return {
    '@context':'https://schema.org', '@type':'WebApplication', name, description,
    applicationCategory:'FinanceApplication', operatingSystem:'Web',
    url:`https://www.facilfiscal.com.ar${path}`,
    offers:{ '@type':'Offer', price:'0', priceCurrency:'ARS' },
  }
}

export function faqJsonLd(items:{ question:string; answer:string }[]) {
  return { '@context':'https://schema.org', '@type':'FAQPage', mainEntity:items.map(item => ({
    '@type':'Question', name:item.question, acceptedAnswer:{ '@type':'Answer', text:item.answer },
  })) }
}
