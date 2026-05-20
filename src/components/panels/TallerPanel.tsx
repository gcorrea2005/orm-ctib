import { useState, useEffect } from 'react'
import { useTaller, type Grupo } from '../../context/TallerContext'
import TimelineBar from '../TimelineBar'
import IFCViewer from '../IFCViewer'
import PlanosTallerPanel from './PlanosTallerPanel'
import CortePerforacionPanel from './CortePerforacionPanel'
import ArmadoPanel from './ArmadoPanel'
import SoldaduraPanel from './SoldaduraPanel'
import SandblastingPanel from './SandblastingPanel'
import PinturaPanel from './PinturaPanel'
import MontajePanel from './MontajePanel'
import EntregaPanel from './EntregaPanel'


interface Elemento {
  id: number
  parte: string
  perfil: string
  longitud: number
  cantidad: number
  peso: number
  pesoTotal: number
  observaciones?: string | null
  actividades?: any[]
}

export default function TallerPanel() {
  const { grupoes, grupoActual, setGrupoActual, addElemento, addGrupo, updateElemento, deleteElemento, deleteGrupo, updateGrupo, loading, updateActividad } = useTaller()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showNivelForm, setShowNivelForm] = useState(false)
  const [editingElement, setEditingElement] = useState<Elemento | null>(null)
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null)
  const [grupoForm, setGrupoForm] = useState({ nombre: '', descripcion: '', activoInformes: true })
  const [formData, setFormData] = useState({
    parte: '',
    perfil: '',
    longitud: 0,
    cantidad: 1,
    peso: 0,
    observaciones: ''
  })
  const [showLevelDropdown, setShowLevelDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActividad, setSelectedActividad] = useState<any>(null)
  const [visorIFC, setVisorIFC] = useState<{ path: string; nombre: string } | null>(null)
  const [visorPDF, setVisorPDF] = useState<{ path: string; nombre: string } | null>(null)
  const [showPlanosTaller, setShowPlanosTaller] = useState(false)
  const [showCortePerforacion, setShowCortePerforacion] = useState(false)
  const [showArmado, setShowArmado] = useState(false)
  const [showSoldadura, setShowSoldadura] = useState(false)
  const [showSandblasting, setShowSandblasting] = useState(false)
  const [showPintura, setShowPintura] = useState(false)
  const [showMontaje, setShowMontaje] = useState(false)
  const [showEntrega, setShowEntrega] = useState(false)
  const [selectedElemento, setSelectedElemento] = useState<Elemento | null>(null)

  // Filtrar elementos basado en búsqueda y ordenar por parte
  const filteredElements = (grupoActual?.elementos.filter(el => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      el.parte.toLowerCase().includes(term) ||
      el.perfil.toLowerCase().includes(term) ||
      (el.observaciones && el.observaciones.toLowerCase().includes(term))
    )
  }) || []).sort((a, b) => a.parte.localeCompare(b.parte))

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalElements = filteredElements.length
  const totalPages = Math.ceil(totalElements / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedElements = filteredElements.slice(startIndex, startIndex + pageSize)

  // Resetear página cuando cambia el grupo o búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [grupoActual?.id, searchTerm])

  const handleAddNivel = async () => {
    if (!grupoForm.nombre) return
    await addGrupo(grupoForm.nombre, grupoForm.descripcion || undefined, grupoForm.activoInformes)
    setGrupoForm({ nombre: '', descripcion: '', activoInformes: true })
    setShowNivelForm(false)
  }

  const handleEditGrupo = async () => {
    if (!editingGrupo) return
    await updateGrupo(editingGrupo.id, {
      nombre: grupoForm.nombre,
      descripcion: grupoForm.descripcion || undefined,
      activoInformes: grupoForm.activoInformes
    })
    setEditingGrupo(null)
    setGrupoForm({ nombre: '', descripcion: '', activoInformes: true })
    setShowNivelForm(false)
  }

  const handleDeleteNivel = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este grupo y todos sus elementos?')) return
    await deleteGrupo(id)
  }

  const openEditGrupo = (grupo: Grupo, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingGrupo(grupo)
    setGrupoForm({ nombre: grupo.nombre, descripcion: grupo.descripcion || '', activoInformes: grupo.activoInformes !== false })
    setShowNivelForm(true)
  }

  const handleAddElemento = async () => {
    if (!grupoActual) {
      alert('Selecciona un grupo primero')
      return
    }
    if (!formData.parte || !formData.perfil) {
      alert('Parte y Perfil son obligatorios')
      return
    }
    try {
      await addElemento(grupoActual.id, formData)
      setFormData({
        parte: '',
        perfil: '',
        longitud: 0,
        cantidad: 1,
        peso: 0,
        observaciones: ''
      })
      setShowAddForm(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      alert('Error al agregar elemento: ' + message)
    }
  }

  const handleEditElement = () => {
    if (!grupoActual || !editingElement || !formData.parte || !formData.perfil) return
    updateElemento(grupoActual.id, editingElement.id, formData)
    setEditingElement(null)
    setFormData({
      parte: '',
      perfil: '',
      longitud: 0,
      cantidad: 1,
      peso: 0,
      observaciones: ''
    })
  }

  const openEditForm = (el: Elemento) => {
    setEditingElement(el)
    setFormData({
      parte: el.parte,
      perfil: el.perfil,
      longitud: el.longitud,
      cantidad: el.cantidad,
      peso: el.peso,
      observaciones: el.observaciones || ''
    })
    setShowAddForm(false)
  }

  const openAddForm = () => {
    setEditingElement(null)
    setFormData({
      parte: '',
      perfil: '',
      longitud: 0,
      cantidad: 1,
      peso: 0,
      observaciones: ''
    })
    setShowAddForm(true)
  }

  const handleStageClick = (actividad: any) => {
    setSelectedActividad(actividad);
    if (actividad.tipo === 'planos_taller' || actividad.tipo === 'Planos') {
      setShowPlanosTaller(true);
    } else if (actividad.tipo === 'corte_perforacion' || actividad.tipo === 'Corte') {
      setShowCortePerforacion(true);
    } else if (actividad.tipo === 'armado' || actividad.tipo === 'Armado') {
      setShowArmado(true);
    } else if (actividad.tipo === 'soldadura' || actividad.tipo === 'Soldadura') {
      setShowSoldadura(true);
    } else if (actividad.tipo === 'sand_blasting' || actividad.tipo === 'Sandblasting') {
      setShowSandblasting(true);
    } else if (actividad.tipo === 'pintura' || actividad.tipo === 'Pintura') {
      setShowPintura(true);
    } else if (actividad.tipo === 'montaje' || actividad.tipo === 'Montaje') {
      setShowMontaje(true);
    } else if (actividad.tipo === 'entrega') {
      setShowEntrega(true);
    }
  };

  const handleSavePlanosTaller = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowPlanosTaller(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSaveCortePerforacion = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowCortePerforacion(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSaveArmado = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowArmado(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSaveSoldadura = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowSoldadura(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSaveSandblasting = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowSandblasting(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSavePintura = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowPintura(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSaveMontaje = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowMontaje(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSaveEntrega = async (actividadId: number, datos: string, estado?: string) => {
    try {
      const updateData: any = { datos };
      if (estado) updateData.estado = estado;
      await updateActividad(actividadId, updateData);
      setShowEntrega(false);
      setSelectedActividad(null);
      
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (loading) {
  return (
    <div className="panel">
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando datos del taller...</p>
      </div>
      </div>
    )
  }

return (
  <div className="panel">
    <div className="panel-header">
      <h2>Taller - Plano de Edificio</h2>
    </div>

    <div className="grupo-card" style={{
      background: 'var(--bg-card)',
      border: '2px solid var(--border-subtle)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }}>
        <div className="level-selector-compact">
          <div className="level-dropdown-header">
            <button 
              className="level-dropdown-btn"
              onClick={() => setShowLevelDropdown(!showLevelDropdown)}
            >
              <span className="level-dropdown-selected" style={{ width: '100%' }}>
                {grupoActual ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', overflow: 'hidden', width: '100%' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1em', whiteSpace: 'nowrap' }}>{grupoActual.nombre}</span>
                    {grupoActual.descripcion && (
                      <span style={{ fontSize: '0.85em', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {grupoActual.descripcion}
                      </span>
                    )}
                    <div style={{ fontSize: '0.8em', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                      <span style={{ color: '#3b82f6', fontWeight: '600' }}>📦 {grupoActual.elementos.length}</span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>🔩 {grupoActual.elementos.reduce((sum, el) => sum + el.cantidad, 0)}</span>
                      <span style={{ color: '#6366f1', fontWeight: '600' }}>⚖️ {grupoActual.elementos.reduce((sum, el) => sum + (el.peso * el.cantidad), 0).toFixed(1)} kg</span>
                    </div>
                  </div>
                ) : (
                  'Seleccionar grupo'
                )}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <button 
              className="btn-add-level-compact"
              onClick={() => { setEditingGrupo(null); setGrupoForm({ nombre: '', descripcion: '', activoInformes: true }); setShowNivelForm(true); }}
              title="Agregar grupo"
            >
              +
            </button>
          </div>

          {showLevelDropdown && (
            <div className="level-dropdown-list">
              {grupoes.map(grupo => (
                <div 
                  key={grupo.id} 
                  className={`level-dropdown-item ${grupoActual?.id === grupo.id ? 'active' : ''}`}
                  onClick={() => {
                    setGrupoActual(grupo)
                    setShowLevelDropdown(false)
                  }}
                >
                  <div className="level-item-info">
                    <span className="level-item-name">{grupo.nombre}</span>
                    {grupo.descripcion && (
                      <span className="level-item-desc" style={{ fontSize: '0.85em', color: '#666', display: 'block', marginTop: '2px' }}>
                        {grupo.descripcion}
                      </span>
                    )}
                    <div style={{ fontSize: '0.75em', color: '#888', marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{grupo.elementos.length} elem</span>
                      <span>{grupo.elementos.reduce((sum, el) => sum + el.cantidad, 0)} pz</span>
                      <span>{grupo.elementos.reduce((sum, el) => sum + (el.peso * el.cantidad), 0).toFixed(1)} kg</span>
                    </div>
                  </div>
                  <div className="level-item-actions">
                    <button 
                      className="level-action-icon"
                      onClick={(e) => { e.stopPropagation(); openEditGrupo(grupo, e); }}
                      title="Editar grupo"
                    >✏️</button>
                    <button 
                      className="level-action-icon delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteNivel(grupo.id, e); }}
                      title="Eliminar grupo"
                    >🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showNivelForm && (
          <div className="add-form" style={{ marginTop: '12px' }}>
            <h4>{editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}</h4>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Nombre (ej: N25)"
                value={grupoForm.nombre}
                onChange={e => setGrupoForm({ ...grupoForm, nombre: e.target.value.toUpperCase() })}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={grupoForm.descripcion}
                onChange={e => setGrupoForm({ ...grupoForm, descripcion: e.target.value })}
                rows={3}
                style={{ gridColumn: '1 / -1', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              ></textarea>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={grupoForm.activoInformes}
                  onChange={e => setGrupoForm({ ...grupoForm, activoInformes: e.target.checked })}
                />
                <span>Activo para informes</span>
              </label>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => { 
                setShowNivelForm(false); 
                setEditingGrupo(null);
                setGrupoForm({ nombre: '', descripcion: '', activoInformes: true });
              }}>Cancelar</button>
              <button className="btn-primary" onClick={editingGrupo ? handleEditGrupo : handleAddNivel}>
                {editingGrupo ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        )}

      </div>

          {(showAddForm || editingElement) && (
            <div className="add-form">
              <h4>{editingElement ? 'Editar Elemento' : 'Nuevo Elemento'} - {grupoActual?.nombre}</h4>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Parte (ID)"
                  value={formData.parte}
                  onChange={e => setFormData({ ...formData, parte: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Perfil (ej: W8x10)"
                  value={formData.perfil}
                  onChange={e => setFormData({ ...formData, perfil: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Longitud (mm)"
                  value={formData.longitud || ''}
                  onChange={e => setFormData({ ...formData, longitud: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={formData.cantidad || ''}
                  onChange={e => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Peso Unit. (kg)"
                  value={formData.peso || ''}
                  onChange={e => setFormData({ ...formData, peso: Number(e.target.value) })}
                />
                <input
                  type="text"
                  placeholder="Observaciones"
                  value={formData.observaciones}
                  onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => { setShowAddForm(false); setEditingElement(null) }}>Cancelar</button>
                <button className="btn-primary" onClick={editingElement ? handleEditElement : handleAddElemento}>
                  {editingElement ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </div>
          )}

          <div className="elements-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div className="search-box" style={{ flex: '1', marginRight: '10px' }}>
              <input
                type="text"
                placeholder="Buscar por parte, perfil u observaciones..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <button className="btn-primary" onClick={openAddForm}>
              + Agregar Elemento
            </button>
          </div>

          {filteredElements.length > 0 && (
            <div style={{ marginBottom: '10px', fontSize: '0.9em', color: '#666' }}>
              Mostrando {startIndex + 1}-{Math.min(startIndex + pageSize, totalElements)} de {totalElements} elementos (página {currentPage} de {totalPages || 1})
            </div>
          )}

          <div className="elements-table">
            <div className="cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
              {filteredElements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {searchTerm ? 'No se encontraron elementos que coincidan con la búsqueda.' : 'No hay elementos en este grupo. Agrega el primero.'}
                </div>
              ) : (
                paginatedElements.map((el) => (
                  <div key={el.id} className="elemento-card" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Efecto shimmer */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      animation: 'shimmer 3s infinite'
                    }} />
                    
                    {/* Header: Parte + Cantidad + Botones */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1em', color: 'white', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                        {el.parte}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="card-cantidad" style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.9em',
                          color: 'white',
                          fontWeight: '600'
                        }}>
                          {el.cantidad} pz
                        </span>
                        <span 
                          className="btn-icon edit" 
                          onClick={() => openEditForm(el)}
                          style={{ cursor: 'pointer', fontSize: '18px', opacity: 0.7, transition: 'opacity 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >✏️</span>
                        <span 
                          className="btn-icon delete" 
                          onClick={() => {
                            if (confirm('¿Eliminar este elemento?')) {
                              deleteElemento(grupoActual!.id, el.id)
                            }
                          }}
                          style={{ cursor: 'pointer', fontSize: '18px', opacity: 0.7, transition: 'opacity 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >🗑️</span>
                      </div>
                    </div>

                    {/* Campos 2x2 FLEXBOX */}
                    <div className="card-fields-flex" style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      justifyContent: 'space-between', 
                      gap: '8px 20px',
                      marginBottom: '0.5rem'
                    }}>
                      {/* Perfil */}
                      <div style={{ width: 'calc(50% - 10px)', display: 'flex', alignItems: 'center', gap: '8px', padding: '1px 0' }}>
                        <span style={{ fontSize: '0.65em', color: 'rgba(255,255,255,0.7)' }}>Perfil</span>
                        <span style={{ fontSize: '0.85em', color: 'white', fontWeight: '500' }}>{el.perfil}</span>
                      </div>
                      
                      {/* Longitud */}
                      <div style={{ width: 'calc(50% - 10px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right', gap: '8px', padding: '1px 0' }}>
                        <span style={{ fontSize: '0.65em', color: 'rgba(255,255,255,0.7)' }}>Long.</span>
                        <span style={{ fontSize: '0.85em', color: 'white', fontWeight: '500' }}>{el.longitud}</span>
                      </div>
                      
                      {/* Peso Unit */}
                      <div style={{ width: 'calc(50% - 10px)', display: 'flex', alignItems: 'center', gap: '8px', padding: '1px 0' }}>
                        <span style={{ fontSize: '0.65em', color: 'rgba(255,255,255,0.7)' }}>W/unit</span>
                        <span style={{ fontSize: '0.85em', color: 'white', fontWeight: '500' }}>{el.peso}</span>
                      </div>
                      
                      {/* Peso Total */}
                      <div style={{ width: 'calc(50% - 10px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right', gap: '8px', padding: '1px 0' }}>
                        <span style={{ fontSize: '0.65em', color: 'rgba(255,255,255,0.7)' }}>W/total</span>
                        <span style={{ fontSize: '0.85em', color: 'white', fontWeight: '500' }}>{(el.peso * el.cantidad).toFixed(1)}</span>
                      </div>
                    </div>

                    {/* TimelineBar */}
                    <div style={{ margin: '4px 0 2px 0', minHeight: '32px' }}>
                      {el.actividades && el.actividades.length > 0 ? (
                        <TimelineBar actividades={el.actividades} compact={false} lightText={true} onStageClick={(actividad) => { setSelectedElemento(el); handleStageClick(actividad); }} />
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8em' }}>N/A</span>
                      )}
                    </div>

                    {/* Botonera de archivos DWG / IFC / PDF */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      {(() => {
                        // IFC: Tekla exporta como {parte}_Qty_{cant}.ifc o b_{parte}_Qty_{cant}.ifc
                        const parteNorm = el.parte.replace(/\//g, '_').replace(/\s+/g, '_')
                        const parteNum = el.parte.replace(/[^0-9]/g, '')
                        const tienePrefijoB = el.parte.toLowerCase().startsWith('b')
                        const ifcFile = tienePrefijoB
                          ? `b_${parteNum}_Qty_${el.cantidad}.ifc`
                          : `${parteNum}_Qty_${el.cantidad}.ifc`
                        // DWG: por nivel del grupo
                        const nivel = grupoActual?.nombre || ''
                        const nivelNum = nivel.replace('N','').padStart(2,'0')
                        // PDF: puede ser b{num}, c{num}, o {num}
                        const partePDF = el.parte.toLowerCase().startsWith('c') ? `c${parteNum}` : el.parte.toLowerCase().startsWith('b') ? `b${parteNum}` : parteNum

                        const archivos = [
                          { label: 'DWG', icon: '📐', url: `/taller/DWG_files/${tienePrefijoB ? 'b_' + parteNum : parteNum}_Qty_${el.cantidad}.dwg` },
                          { label: 'IFC', icon: '🏗️', url: `/taller/IFC_files/${ifcFile}`, isIFC: true },
                          { label: 'PDF', icon: '📄', url: `/taller/PDF_files/${encodeURIComponent(partePDF + ' - STANDARD.pdf')}` },
                        ]

                        return archivos.map(btn => (
                          <button
                            key={btn.label}
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                const res = await fetch(btn.url, { method: 'HEAD' })
                                if (!res.ok) {
                                  alert(`Archivo no encontrado: ${btn.label}\n${btn.url}`)
                                  return
                                }
                                if ('isIFC' in btn && btn.isIFC) {
                                  setVisorIFC({ path: btn.url, nombre: `${el.parte} - ${el.perfil}` })
                                } else if (btn.label === 'PDF') {
                                  setVisorPDF({ path: btn.url, nombre: `${el.parte} - ${el.perfil}` })
                                } else {
                                  window.open(btn.url, '_blank')
                                }
                              } catch {
                                alert(`Error verificando archivo: ${btn.label}`)
                              }
                            }}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '6px 0',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.85)',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                              letterSpacing: '0.5px',
                              backdropFilter: 'blur(4px)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                              e.currentTarget.style.color = '#fff'
                              e.currentTarget.style.transform = 'translateY(-1px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                              e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                            title={`${btn.label} - ${el.parte}`}
                          >
                            <span style={{ fontSize: '12px' }}>{btn.icon}</span>
                            {btn.label}
                          </button>
                        ))
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '20px 0', fontSize: '0.9em' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '5px 10px', cursor: 'pointer' }}
              >
                ← Anterior
              </button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '5px 10px', cursor: 'pointer' }}
              >
                Siguiente →
              </button>
              <select 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '5px', marginLeft: '10px' }}
              >
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>
          )}
          {showPlanosTaller && selectedActividad && (
            <PlanosTallerPanel
              actividad={selectedActividad}
              elemento={selectedElemento ?? undefined}
              onSave={handleSavePlanosTaller}
              onClose={() => { setShowPlanosTaller(false); setSelectedActividad(null); setSelectedElemento(null); }}
            />
          )}
          {showCortePerforacion && selectedActividad && (
            <CortePerforacionPanel
              actividad={selectedActividad}
              onSave={handleSaveCortePerforacion}
              onClose={() => { setShowCortePerforacion(false); setSelectedActividad(null); }}
            />
          )}
          {showArmado && selectedActividad && (
            <ArmadoPanel
              actividad={selectedActividad}
              onSave={handleSaveArmado}
              onClose={() => { setShowArmado(false); setSelectedActividad(null); }}
            />
          )}
          {showSoldadura && selectedActividad && (
            <SoldaduraPanel
              actividad={selectedActividad}
              onSave={handleSaveSoldadura}
              onClose={() => { setShowSoldadura(false); setSelectedActividad(null); }}
            />
          )}
          {showSandblasting && selectedActividad && (
            <SandblastingPanel
              actividad={selectedActividad}
              onSave={handleSaveSandblasting}
              onClose={() => { setShowSandblasting(false); setSelectedActividad(null); }}
            />
          )}
          {showPintura && selectedActividad && (
            <PinturaPanel
              actividad={selectedActividad}
              onSave={handleSavePintura}
              onClose={() => { setShowPintura(false); setSelectedActividad(null); }}
            />
          )}
          {showMontaje && selectedActividad && (
            <MontajePanel
              actividad={selectedActividad}
              onSave={handleSaveMontaje}
              onClose={() => { setShowMontaje(false); setSelectedActividad(null); }}
            />
          )}
          {showEntrega && selectedActividad && (
            <EntregaPanel
              actividad={selectedActividad}
              onSave={handleSaveEntrega}
              onClose={() => { setShowEntrega(false); setSelectedActividad(null); }}
            />
          )}
          {visorIFC && (
            <IFCViewer
              filePath={visorIFC.path}
              fileName={visorIFC.nombre}
              onClose={() => setVisorIFC(null)}
            />
          )}
          {visorPDF && (
            <div style={{ position: 'fixed', inset: 0, background: '#0a0e14', zIndex: 999999, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'rgba(10,14,20,0.95)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', zIndex: 1000 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e6edf3' }}>
                  <span style={{ fontSize: 20 }}>📄</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{visorPDF.nombre}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a href={visorPDF.path} download style={{ textDecoration: 'none', fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4, background: '#667eea', color: '#fff', borderRadius: 6, fontWeight: 600 }}>
                    ⬇ Descargar
                  </a>
                  <button onClick={() => setVisorPDF(null)} style={{ padding: '6px 12px', background: '#da3633', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✕ Cerrar
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, background: '#21262d' }}>
                <embed src={visorPDF.path} type="application/pdf" style={{ width: '100%', height: '100%', border: 'none' }} />
              </div>
            </div>
          )}
        </div>
      )
    }
