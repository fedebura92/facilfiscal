'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

export default function AdSenseLoader() {
  const pathname = usePathname()

  // Keep account verification in the root metadata, but do not load ad code on the privacy policy.
  if (pathname === '/privacidad') return null

  return (
    <Script
      id="google-adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9093787015793158"
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  )
}
