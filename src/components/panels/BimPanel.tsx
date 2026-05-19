import { useState, useEffect, useRef } from 'react'
import { Eye, Download, Search, Building2, Box, Upload, Trash2, Edit3, Check, X, AlertTriangle } from 'lucide-react'
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
  const [subiendo, setSubiendo] = useState(false)
  const [renombrando, setRenombrando] = useState<string | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cargarArchivos = () => {
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
  }

  useEffect(() => { cargarArchivos() }, [])

  const mostrarMensaje = (tipo: 'ok' | 'error', texto: string) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      mostrarMensaje('error', 'Solo se permiten archivos .ifc')
      return
    }

    setSubiendo(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/bim/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        mostrarMensaje('ok', `"${data.filename}" subido correctamente`)
        cargarArchivos()
      } else {
        mostrarMensaje('error', data.error || 'Error al subir')
      }
    } catch {
      mostrarMensaje('error', 'Error de conexión')
    } finally {
      setSubiendo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleEliminar = async (filename: string) => {
    try {
      const res = await fetch(`/api/bim/${encodeURIComponent(filename)}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        mostrarMensaje('ok', `"${filename}" eliminado`)
        setConfirmandoEliminar(null)
        cargarArchivos()
      } else {
        mostrarMensaje('error', data.error || 'Error al eliminar')
      }
    } catch {
      mostrarMensaje('error', 'Error de conexión')
    }
  }

  const handleRenombrar = async (oldName: string) => {
    if (!nuevoNombre.trim()) return
    try {
      const res = await fetch('/api/bim/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: nuevoNombre.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        mostrarMensaje('ok', `Renombrado a "${data.newName}"`)
        setRenombrando(null)
        setNuevoNombre('')
        cargarArchivos()
      } else {
        mostrarMensaje('error', data.error || 'Error al renombrar')
      }
    } catch {
      mostrarMensaje('error', 'Error de conexión')
    }
  }

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
  }

  if (visorIFC) {
    return <IFCViewer filePath={visorIFC.path} fileName={visorIFC.nombre} onClose={() => setVisorIFC(null)} />
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Box size={24} color="#667eea" />
          <div>
            <h2 style={{ margin: 0 }}>BIM - Modelos IFC</h2>
            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>Modelos 3D de la estructura</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ifc"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <button
          className="btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={subiendo}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Upload size={16} /> {subiendo ? 'Subiendo...' : 'Subir IFC'}
        </button>
      </div>

      {mensaje && (
        <div style={{
          background: mensaje.tipo === 'ok' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(218, 54, 51, 0.15)',
          border: `1px solid ${mensaje.tipo === 'ok' ? '#2ea043' : '#da3633'}`,
          borderRadius: '8px',
          padding: '10px 16px',
          marginBottom: '1rem',
          color: mensaje.tipo === 'ok' ? '#3fb950' : '#f85149',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {mensaje.tipo === 'ok' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {mensaje.texto}
        </div>
      )}

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

      <div style={{ overflowX: 'auto' }}>
        <table className="informe-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Modelo</th>
              <th style={{ width: '80px' }}>Tipo</th>
              <th style={{ width: '80px' }}>Tamaño</th>
              <th style={{ width: '300px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                  <Building2 size={48} color="#30363d" />
                  <p style={{ color: '#8b949e', marginTop: '0.5rem' }}>
                    {busqueda ? `No se encontraron modelos con "${busqueda}"` : 'No hay archivos IFC'}
                  </p>
                </td>
              </tr>
            ) : (
              filtrados.map(archivo => (
                <tr key={archivo.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="#667eea" />
                    {renombrando === archivo.nombre ? (
                      <input
                        autoFocus
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenombrar(archivo.nombre)
                          if (e.key === 'Escape') { setRenombrando(null); setNuevoNombre('') }
                        }}
                        style={{
                          background: '#161b22',
                          border: '1px solid #667eea',
                          color: '#e6edf3',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          width: '200px'
                        }}
                      />
                    ) : (
                      archivo.codigo
                    )}
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
                    {renombrando === archivo.nombre ? (
                      <>
                        <button
                          className="btn-primary"
                          style={{ background: '#2ea043', padding: '6px 10px', fontSize: '12px', marginRight: '4px' }}
                          onClick={() => handleRenombrar(archivo.nombre)}
                          title="Guardar"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="btn-primary"
                          style={{ background: '#30363d', padding: '6px 10px', fontSize: '12px' }}
                          onClick={() => { setRenombrando(null); setNuevoNombre('') }}
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : confirmandoEliminar === archivo.nombre ? (
                      <>
                        <span style={{ color: '#f85149', fontSize: '0.8rem', marginRight: '8px' }}>¿Eliminar?</span>
                        <button
                          className="btn-primary"
                          style={{ background: '#da3633', padding: '6px 10px', fontSize: '12px', marginRight: '4px' }}
                          onClick={() => handleEliminar(archivo.nombre)}
                          title="Confirmar eliminar"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="btn-primary"
                          style={{ background: '#30363d', padding: '6px 10px', fontSize: '12px' }}
                          onClick={() => setConfirmandoEliminar(null)}
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-primary"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '6px 10px',
                            fontSize: '12px',
                            marginRight: '4px'
                          }}
                          onClick={() => setVisorIFC({ path: archivo.path, nombre: archivo.nombre })}
                          title="Visualizar 3D"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-primary"
                          style={{ background: '#1f6feb', padding: '6px 10px', fontSize: '12px', marginRight: '4px' }}
                          onClick={() => descargarArchivo(archivo.path, archivo.nombre)}
                          title="Descargar"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          className="btn-primary"
                          style={{ background: '#30363d', padding: '6px 10px', fontSize: '12px', marginRight: '4px' }}
                          onClick={() => { setRenombrando(archivo.nombre); setNuevoNombre(archivo.codigo) }}
                          title="Renombrar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn-primary"
                          style={{ background: '#da3633', padding: '6px 10px', fontSize: '12px' }}
                          onClick={() => setConfirmandoEliminar(archivo.nombre)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8b949e', fontSize: '0.85rem' }}>
        Mostrando {filtrados.length} de {archivos.length} modelos
      </div>
    </div>
  )
}
