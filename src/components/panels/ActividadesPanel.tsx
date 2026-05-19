import { useState } from 'react'

interface Actividad {
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

interface ActividadesPanelProps {
  actividades: Actividad[]
  onUpdateActividad: (actividadId: number, data: any) => void
}

const TIPO_LABELS: { [key: string]: string } = {
  'bim': 'INFO',
  'planos_taller': 'Planos de Taller',
  'corte_perforacion': 'Corte y Perforación',
  'armado': 'Armado',
  'soldadura': 'Soldadura',
  'sand_blasting': 'Sand-blasting',
  'pintura': 'Pintura',
  'almacenamiento': 'Almacenamiento',
  'montaje': 'Montaje',
  'entrega': 'Entrega'
}

const ESTADO_COLORS: { [key: string]: string } = {
  'pendiente': '#fbbf24',
  'en_proceso': '#60a5fa',
  'completado': '#34d399'
}

const ESTADO_LABELS: { [key: string]: string } = {
  'pendiente': 'Pendiente',
  'en_proceso': 'En Proceso',
  'completado': 'Completado'
}

export default function ActividadesPanel({ actividades, onUpdateActividad }: ActividadesPanelProps) {
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null)
  const [newEstado, setNewEstado] = useState('')
  const [newObservaciones, setNewObservaciones] = useState('')

  const handleUpdate = (actividad: Actividad) => {
    setEditingActividad(actividad)
    setNewEstado(actividad.estado)
    setNewObservaciones(actividad.observaciones || '')
  }

  const handleSave = () => {
    if (!editingActividad) return

    const updateData: any = {}
    
    if (newEstado !== editingActividad.estado) {
      updateData.estado = newEstado
      if (newEstado === 'en_proceso' && !editingActividad.fechaInicio) {
        updateData.fechaInicio = new Date().toISOString()
      }
      if (newEstado === 'completado' && !editingActividad.fechaFin) {
        updateData.fechaFin = new Date().toISOString()
      }
    }
    
    if (newObservaciones !== (editingActividad.observaciones || '')) {
      updateData.observaciones = newObservaciones
    }

    onUpdateActividad(editingActividad.id, updateData)
    setEditingActividad(null)
  }

  return (
    <div className="actividades-panel">
      <div className="actividades-header">
        <h3>Seguimiento de Actividades</h3>
      </div>

      <div className="actividades-timeline">
        {actividades.map((actividad, index) => (
          <div key={actividad.id} className={`actividad-item ${actividad.estado}`}>
            <div className="actividad-orden">{index + 1}</div>
            <div className="actividad-content">
              <div className="actividad-header">
                <h4>{TIPO_LABELS[actividad.tipo] || actividad.tipo}</h4>
                <span 
                  className="estado-badge"
                  style={{ backgroundColor: ESTADO_COLORS[actividad.estado] }}
                >
                  {ESTADO_LABELS[actividad.estado] || actividad.estado}
                </span>
              </div>
              
              <div className="actividad-details">
                {actividad.fechaInicio && (
                  <span className="detail-item">
                    <strong>Inicio:</strong> {new Date(actividad.fechaInicio).toLocaleDateString()}
                  </span>
                )}
                {actividad.fechaFin && (
                  <span className="detail-item">
                    <strong>Fin:</strong> {new Date(actividad.fechaFin).toLocaleDateString()}
                  </span>
                )}
                {actividad.observaciones && (
                  <span className="detail-item">
                    <strong>Obs:</strong> {actividad.observaciones}
                  </span>
                )}
              </div>

              <button 
                className="btn-icon edit"
                onClick={() => handleUpdate(actividad)}
                title="Actualizar estado"
              >
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingActividad && (
        <div className="modal-overlay" onClick={() => setEditingActividad(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Actualizar: {TIPO_LABELS[editingActividad.tipo]}</h3>
            
            <div className="form-group">
              <label>Estado:</label>
              <select 
                value={newEstado} 
                onChange={e => setNewEstado(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Observaciones:</label>
              <textarea 
                value={newObservaciones}
                onChange={e => setNewObservaciones(e.target.value)}
                placeholder="Agregar observaciones..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setEditingActividad(null)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
