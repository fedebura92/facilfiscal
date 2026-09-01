import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:'Mi Panel',
  robots:{ index:false, follow:false, nocache:true },
}

export default function MiPanelLayout({ children }:{ children:React.ReactNode }) {
  return children
}
