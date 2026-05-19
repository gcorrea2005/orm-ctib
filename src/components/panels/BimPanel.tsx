import { useState, useEffect } from 'react'
import { Eye, Download, Search, Building2, Box } from 'lucide-react'
import IFCViewer from '../IFCViewer'

interface BimFile {
  id: number
  nombre: string
  codigo: string
  path: string
  tamano: string
}

export default function BimPanel() {
  const [archivos, setArchivos] = useState<BimFile[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [visorIFC, setVisorIFC] = useState<{ path: string; nombre: string } | null>(null)

  useEffect(() => {
    fetch('/api/bim-files')
      .then(res => {
        if (!res.ok) throw new Error('Error cargando lista IFC')
        return res.json()
      })
      .then(data => setArchivos(data))
      .catch(err => {
        console.error('Error cargando lista IFC:', err)
        setArchivos([])
      })
  }, [])

  const filtrados = archivos.filter(a =>
    a.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const descargarArchivo = (path: string, nombre: string) => {
    fetch(path)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = nombre
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      })
      .catch(err => {
        console.error('Error descargando IFC:', err)
      })
  }

  // Si el visor está abierto, mostrarlo fullscreen
  if (visorIFC) {
    return <IFCViewer filePath={visorIFC.path} fileName={visorIFC.nombre} onClose={() => setVisorIFC(null)} />
  }

  return (
    <div className="panel">
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Box size={24} color="#667eea" />
          <div>
            <h2 style={{ margin: 0 }}>BIM - Modelos IFC</h2>
            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>Modelos 3D de la estructura</span>
          </div>
        </div>
      </div>

      {/* Banner informativo */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.08)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderLeft: '4px solid #667eea',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Building2 size={20} color="#667eea" />
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#8b949e' }}>
          <strong style={{ color: '#e6edf3' }}>VISUALIZAR 3D</strong> para ver online o <strong style={{ color: '#e6edf3' }}>DESCARGAR</strong> para abrir en Revit, Tekla, ArchiCAD.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <span className="stat-value">{archivos.length}</span>
          <span className="stat-label">Modelos IFC</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{archivos.filter(a => a.codigo.startsWith('N')).length}</span>
          <span className="stat-label">Niveles</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{archivos.filter(a => a.codigo.startsWith('CTIB')).length}</span>
          <span className="stat-label">Combinados</span>
        </div>
      </div>

      {/* Buscador */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '8px 12px',
        marginBottom: '1.5rem'
      }}>
        <Search size={16} color="#8b949e" />
        <input
          type="text"
          placeholder="Buscar modelos IFC..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e6edf3',
            outline: 'none',
            width: '100%',
            fontSize: '0.9rem'
          }}
        />
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{filtrados.length} archivos</span>
      </div>

      {/* Tabla de archivos */}
      <div style={{ overflowX: 'auto' }}>
        <table className="informe-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Modelo</th>
              <th style={{ width: '80px' }}>Tipo</th>
              <th style={{ width: '80px' }}>Tamaño</th>
              <th style={{ width: '220px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                  <Building2 size={48} color="#30363d" />
                  <p style={{ color: '#8b949e', marginTop: '0.5rem' }}>No hay archivos IFC</p>
                </td>
              </tr>
            ) : (
              filtrados.map(archivo => (
                <tr key={archivo.id} style={{ cursor: 'pointer' }} onClick={() => setVisorIFC({ path: archivo.path, nombre: archivo.nombre })}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="#667eea" />
                    {archivo.codigo}
                  </td>
                  <td>
                    <span style={{
                      background: 'rgba(102, 126, 234, 0.15)',
                      color: '#667eea',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      .IFC
                    </span>
                  </td>
                  <td style={{ color: '#8b949e', fontSize: '0.85rem' }}>{archivo.tamano}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '6px 12px',
                        fontSize: '12px',
                        marginRight: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={(e) => { e.stopPropagation(); setVisorIFC({ path: archivo.path, nombre: archivo.nombre }) }}
                      title="Visualizar modelo IFC en 3D"
                    >
                      <Eye size={14} /> VISUALIZAR 3D
                    </button>
                    <button
                      className="btn-primary"
                      style={{
                        background: '#1f6feb',
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={(e) => { e.stopPropagation(); descargarArchivo(archivo.path, archivo.nombre) }}
                      title="Descargar archivo IFC"
                    >
                      <Download size={14} /> DESCARGAR
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contador */}
      <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8b949e', fontSize: '0.85rem' }}>
        Mostrando {filtrados.length} de {archivos.length} modelos
      </div>
    </div>
  )
}
