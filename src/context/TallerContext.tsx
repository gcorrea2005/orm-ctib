import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../lib/api'

export interface MetalElement {
  id: number
  parte: string
  perfil: string
  longitud: number
  cantidad: number
  peso: number
  observaciones?: string | null
  actividades?: Actividad[]
}

export interface Actividad {
  id: number
  elementoId: number
  tipo: string
  orden: number
  estado: string
  fechaInicio: string | null
  fechaFin: string | null
  observaciones: string | null
  createdAt: string
  updatedAt: string
}

export interface Grupo {
  id: number
  nombre: string
  descripcion?: string | null
  activoInformes?: boolean
  elementos: MetalElement[]
}

interface TallerContextType {
  grupoes: Grupo[]
  grupoActual: Grupo | null
  setGrupoActual: (grupo: Grupo | null) => void
  addGrupo: (nombre: string, descripcion?: string, activoInformes?: boolean) => Promise<void>
  deleteGrupo: (id: number) => Promise<void>
  updateGrupo: (id: number, data: { nombre?: string; descripcion?: string; activoInformes?: boolean }) => Promise<void>
  addElemento: (grupoId: number, elemento: Omit<MetalElement, 'id'>) => Promise<void>
  updateElemento: (grupoId: number, elementoId: number, data: Partial<MetalElement>) => Promise<void>
  deleteElemento: (grupoId: number, elementoId: number) => Promise<void>
  getActividades: (elementoId: number) => Promise<Actividad[]>
  updateActividad: (actividadId: number, data: Partial<Actividad>) => Promise<void>
  refreshGrupoes: () => Promise<void>
  loading: boolean
}

const TallerContext = createContext<TallerContextType | undefined>(undefined)

export function TallerProvider({ children }: { children: ReactNode }) {
  const [grupoes, setGrupoes] = useState<Grupo[]>([])
  const [grupoActual, setGrupoActual] = useState<Grupo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGrupoes()
  }, [])

  const loadGrupoes = async () => {
    try {
      const data = await api.getGrupoes()
      setGrupoes(data)
      if (data.length > 0) {
        setGrupoActual(data[0])
      }
    } catch (error) {
      console.error('Error loading grupoes:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGrupo = async (nombre: string, descripcion?: string, activoInformes?: boolean) => {
    const created = await api.createGrupo(nombre, descripcion, activoInformes)
    setGrupoes(prev => [...prev, created])
  }

  const deleteGrupo = async (id: number) => {
    await api.deleteGrupo(id)
    setGrupoes(prev => prev.filter(n => n.id !== id))
    if (grupoActual?.id === id) {
      setGrupoActual(null)
    }
  }

  const updateGrupo = async (id: number, data: { nombre?: string; descripcion?: string; activoInformes?: boolean }) => {
    const updated = await api.updateGrupo(id, data)
    setGrupoes(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n))
    if (grupoActual?.id === id) {
      setGrupoActual(prev => prev ? { ...prev, ...updated } : null)
    }
  }

  const refreshGrupoes = async () => {
    const data = await api.getGrupoes()
    setGrupoes(data)
  }

  const getActividades = async (elementoId: number) => {
    return await api.getActividades(elementoId)
  }

  const updateActividad = async (actividadId: number, data: Partial<Actividad>) => {
    const updated = await api.updateActividad(actividadId, data)
    
    setGrupoes(prev => prev.map(n => ({
      ...n,
      elementos: n.elementos.map(el => {
        if (el.actividades) {
          return {
            ...el,
            actividades: el.actividades.map(act => 
              act.id === actividadId ? { ...act, ...updated } : act
            )
          }
        }
        return el
      })
    })))

    if (grupoActual) {
      setGrupoActual({
        ...grupoActual,
        elementos: grupoActual.elementos.map(el => {
          if (el.actividades) {
            return {
              ...el,
              actividades: el.actividades.map(act => 
                act.id === actividadId ? { ...act, ...updated } : act
              )
            }
          }
          return el
        })
      })
    }
  }

  const addElemento = async (grupoId: number, elemento: Omit<MetalElement, 'id'>) => {
    const created = await api.createElemento(grupoId, elemento)

    setGrupoes(prev => prev.map(n => {
      if (n.id === grupoId) {
        return { ...n, elementos: [...n.elementos, created] }
      }
      return n
    }))

    if (grupoActual?.id === grupoId) {
      setGrupoActual(prev => prev ? { ...prev, elementos: [...prev.elementos, created] } : null)
    }
  }

  const updateElemento = async (grupoId: number, elementoId: number, data: Partial<MetalElement>) => {
    await api.updateElemento(elementoId, data)

    setGrupoes(prev => prev.map(n => {
      if (n.id === grupoId) {
        return {
          ...n,
          elementos: n.elementos.map(el => el.id === elementoId ? { ...el, ...data } : el)
        }
      }
      return n
    }))

    if (grupoActual?.id === grupoId) {
      setGrupoActual(prev => prev ? {
        ...prev,
        elementos: prev.elementos.map(el => el.id === elementoId ? { ...el, ...data } : el)
      } : null)
    }
  }

  const deleteElemento = async (grupoId: number, elementoId: number) => {
    await api.deleteElemento(elementoId)

    setGrupoes(prev => prev.map(n => {
      if (n.id === grupoId) {
        return { ...n, elementos: n.elementos.filter(el => el.id !== elementoId) }
      }
      return n
    }))

    if (grupoActual?.id === grupoId) {
      setGrupoActual(prev => prev ? {
        ...prev,
        elementos: prev.elementos.filter(el => el.id !== elementoId)
      } : null)
    }
  }

  return (
    <TallerContext.Provider value={{
      grupoes,
      grupoActual,
      setGrupoActual,
      addGrupo,
      deleteGrupo,
      updateGrupo,
      addElemento,
      updateElemento,
      deleteElemento,
      getActividades,
      updateActividad,
      refreshGrupoes,
      loading
    }}>
      {children}
    </TallerContext.Provider>
  )
}

export function useTaller() {
  const context = useContext(TallerContext)
  if (!context) throw new Error('useTaller must be used within TallerProvider')
  return context
}