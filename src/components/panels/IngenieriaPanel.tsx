import { useState, useEffect } from 'react'
import { Eye, Download, X, FileText, Search, Building2 } from 'lucide-react'
import { DB_PLANOS_CTIB } from '../../data/planos_ctib'

interface PlanoInfo {
  id: number
  codigo: string
  descripcion: string
  path: string
  categoria: string
}

export default function IngenieriaPanel() {
  const [docs, setDocs] = useState<PlanoInfo[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [visorPDF, setVisorPDF] = useState<PlanoInfo | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')

  useEffect(() => {
    // Cargar PDFs usando import.meta.glob (Vite)
    const archivos = import.meta.glob('/public/ctib/*.pdf')
    const docsList = Object.keys(archivos).map((ruta, i) => {
      const nombre = ruta.split('/').pop() || ''
      const codigo = nombre.replace('.pdf', '')
      const descripcion = DB_PLANOS_CTIB[codigo] || 'SIN REGISTRO'

      // Determinar categoría por el código
      let categoria = 'OTROS'
      if (codigo.includes('_PLA_')) categoria = 'PLANTAS'
      else if (codigo.includes('_ELE_')) categoria = 'ELEVACIONES'
      else if (codigo.includes('_SEC_')) categoria = 'CORTES'
      else if (codigo.includes('_DSP_')) categoria = 'DESPIECES'
      else if (codigo.includes('_DET_')) categoria = 'DETALLES'
      else if (codigo.includes('_PCO_')) categoria = 'PROCESO CONST.'
      else if (codigo.includes('_ENE_')) categoria = 'NO ESTRUCTURALES'
      else if (codigo.includes('_GEN_')) categoria = 'GENERALES'

      return {
        id: i,
        codigo,
        descripcion,
        path: `/ctib/${nombre}`,
        categoria
      }
    })
    setDocs(docsList)
  }, [])

  // Filtrar por búsqueda y categoría
  const filtrados = docs.filter(d => {
    const matchBusqueda = d.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                          d.codigo.toLowerCase().includes(busqueda.toLowerCase())
    const matchCategoria = filtroCategoria === 'todos' || d.categoria === filtroCategoria
    return matchBusqueda && matchCategoria
  })

  // Obtener categorías únicas para el filtro
  const categorias = ['todos', ...new Set(docs.map(d => d.categoria))]

  // Contar por categoría
  const conteoCategoria = docs.reduce((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Visor PDF fullscreen
  if (visorPDF) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0e14',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header del visor */}
        <div style={{
          background: 'rgba(10, 14, 20, 0.95)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #30363d',
          flexWrap: 'wrap',
          gap: '0.5rem',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e6edf3' }}>
            <FileText size={20} color="#667eea" />
            <div>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{visorPDF.codigo}</span>
              <span style={{ color: '#8b949e', marginLeft: '0.5rem', fontSize: '0.8rem' }}>{visorPDF.descripcion}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <a
              href={visorPDF.path}
              download
              className="btn-primary"
              style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Download size={14} /> Descargar
            </a>
            <button
              className="btn-primary"
              style={{ background: '#da3633', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setVisorPDF(null)}
            >
              <X size={18} /> Cerrar
            </button>
          </div>
        </div>

        {/* Visor PDF nativo */}
        <div style={{ flex: 1, background: '#21262d', display: 'flex', flexDirection: 'column' }}>
          <embed
            src={visorPDF.path}
            type="application/pdf"
            style={{ flex: 1, width: '100%', border: 'none' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} color="#667eea" />
          <div>
            <h2 style={{ margin: 0 }}>Ingeniería CTIB</h2>
            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>Planos Técnicos Estructurales</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <span className="stat-value">{docs.length}</span>
          <span className="stat-label">Total Planos</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{conteoCategoria['PLANTAS'] || 0}</span>
          <span className="stat-label">Plantas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{conteoCategoria['DESPIECES'] || 0}</span>
          <span className="stat-label">Despieces</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{conteoCategoria['DETALLES'] || 0}</span>
          <span className="stat-label">Detalles</span>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por código o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            color: '#e6edf3',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'todos' ? `Todas (${docs.length})` : `${cat} (${conteoCategoria[cat] || 0})`}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de planos */}
      <div style={{ overflowX: 'auto' }}>
        <table className="informe-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th style={{ width: '280px' }}>Identificador</th>
              <th>Descripción del Plano</th>
              <th style={{ width: '120px' }}>Categoría</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                  No se encontraron planos con "{busqueda}"
                </td>
              </tr>
            ) : (
              filtrados.map((doc, idx) => (
                <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => setVisorPDF(doc)}>
                  <td style={{ color: '#8b949e', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td style={{ fontFamily: 'monospace', color: '#667eea', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {doc.codigo}
                  </td>
                  <td style={{ fontWeight: '600' }}>{doc.descripcion}</td>
                  <td>
                    <span style={{
                      background: 'rgba(102, 126, 234, 0.15)',
                      color: '#667eea',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {doc.categoria}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-primary"
                      onClick={(e) => { e.stopPropagation(); setVisorPDF(doc) }}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} /> Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contador de resultados */}
      <div style={{ marginTop: '1rem', textAlign: 'center', color: '#8b949e', fontSize: '0.85rem' }}>
        Mostrando {filtrados.length} de {docs.length} planos
      </div>
    </div>
  )
}
