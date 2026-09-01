'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CATEGORIAS_MONO, VIGENCIA_MONTOS } from '@/lib/data'
import type { CategoriaMonotributo } from '@/lib/types'

type FiscalDataContextValue = {
  categorias: CategoriaMonotributo[]
  vigencia: string
  fuenteUrl: string
  origen: 'supabase_validado' | 'fallback_verificado'
}

const fallback: FiscalDataContextValue = {
  categorias: CATEGORIAS_MONO,
  vigencia: VIGENCIA_MONTOS,
  fuenteUrl: 'https://www.arca.gob.ar/monotributo/categorias.asp',
  origen: 'fallback_verificado',
}

const FiscalDataContext = createContext<FiscalDataContextValue>(fallback)

export function FiscalDataProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/datos-fiscales', { signal:controller.signal })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
      .then(data => {
        if (!Array.isArray(data.categorias) || data.categorias.length !== 11) return
        setValue({
          categorias:data.categorias,
          vigencia:data.vigente_desde ? `Vigente desde el ${data.vigente_desde.split('-').reverse().join('/')} — Fuente: ${data.fuente_nombre || 'ARCA'}` : VIGENCIA_MONTOS,
          fuenteUrl:data.fuente_url || fallback.fuenteUrl,
          origen:data.origen === 'supabase_validado' ? 'supabase_validado' : 'fallback_verificado',
        })
      })
      .catch(error => {
        if (error?.name !== 'AbortError') console.warn('[datos-fiscales] Se usa el fallback verificado.', error)
      })
    return () => controller.abort()
  }, [])

  const stable = useMemo(() => value, [value])
  return <FiscalDataContext.Provider value={stable}>{children}</FiscalDataContext.Provider>
}

export function useFiscalData() {
  return useContext(FiscalDataContext)
}
