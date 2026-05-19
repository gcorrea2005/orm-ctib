import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

interface Stock {
  id: number
  nombre: string
  descripcion: string | null
  productos: {
    id: number
    perfil: string
    cantidad: number
    largo: number
    ancho: number
    peso: number
    comentarios: string | null
  }[]
}

export default function InformeAlmacenPanel() {
  const { user } = useAuth()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoInforme, setTipoInforme] = useState<'resumen' | 'detallado' | 'productos'>('resumen')
  const [stockSeleccionado, setStockSeleccionado] = useState<number | 'todos'>('todos')

  useEffect(() => {
    loadStocks()
  }, [])

  const loadStocks = async () => {
    try {
      const data = await api.getStocks()
      setStocks(data)
    } catch (error) {
      console.error('Error loading stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const generarMarkdown = () => {
    const titulo = 'INFORME DE ALMACÉN'
    const fecha = new Date().toLocaleDateString('es-CO', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })
    const hora = new Date().toLocaleTimeString('es-CO')

    const stocksFiltrados = stockSeleccionado === 'todos' 
      ? stocks 
      : stocks.filter(s => s.id === stockSeleccionado)

    const totalProductos = stocksFiltrados.reduce((sum, s) => sum + s.productos.length, 0)
    const totalPiezas = stocksFiltrados.reduce((sum, s) => 
      sum + s.productos.reduce((p, prod) => p + prod.cantidad, 0), 0
    )
    const totalPeso = stocksFiltrados.reduce((sum, s) => 
      sum + s.productos.reduce((p, prod) => p + prod.peso, 0), 0
    )

    const nombreUsuario = user?.name || user?.email || 'Usuario'

    let md = `# ${titulo}\n\n`
    md += `**Elaborado por:** ${nombreUsuario}  \n`
    md += `**Fecha:** ${fecha}  \n`
    md += `**Hora:** ${hora}  \n`
    md += `**Stock:** ${stockSeleccionado === 'todos' ? 'Todos' : stocks.find(s => s.id === stockSeleccionado)?.nombre}\n\n`
    md += `---\n\n`

    if (tipoInforme === 'resumen') {
      md += `## Resumen General\n\n`
      md += `| STOCK | Productos | Piezas | Peso (kg) |\n`
      md += `|-------|-----------|--------|----------|\n`

      stocksFiltrados.forEach(s => {
        const pzas = s.productos.reduce((p, prod) => p + prod.cantidad, 0)
        const peso = s.productos.reduce((p, prod) => p + prod.peso, 0).toFixed(2)
        md += `| ${s.nombre} | ${s.productos.length} | ${pzas} | ${peso} |\n`
      })

      md += `| **TOTAL** | **${totalProductos}** | **${totalPiezas}** | **${totalPeso.toFixed(2)}** |\n`

    } else if (tipoInforme === 'detallado') {
      md += `## Informe Detallado\n\n`

      stocksFiltrados.forEach(s => {
        const prods = s.productos.length
        const pzas = s.productos.reduce((p, prod) => p + prod.cantidad, 0)
        const peso = s.productos.reduce((p, prod) => p + prod.peso, 0)

        md += `### ${s.nombre}\n\n`
        md += `**Descripción:** ${s.descripcion || 'Sin descripción'}\n\n`
        md += `*Productos: ${prods} | Piezas: ${pzas} | Peso: ${peso.toFixed(2)} kg*\n\n`

        if (prods > 0) {
          md += `| ID | Perfil | Cantidad | Largo | Ancho | Peso |\n`
          md += `|---|--------|----------|-------|-------|------|\n`

          s.productos.forEach(p => {
            md += `| ${p.id} | ${p.perfil} | ${p.cantidad} | ${p.largo}mm | ${p.ancho}mm | ${p.peso}kg |\n`
          })

          const conNotas = s.productos.filter(p => p.comentarios)
          if (conNotas.length > 0) {
            md += `\n**Observaciones:**\n`
            conNotas.forEach(p => {
              md += `- ${p.perfil}: ${p.comentarios}\n`
            })
          }
        } else {
          md += `_Sin productos_\n`
        }
        md += `\n---\n\n`
      })

      md += `## Resumen Total\n\n`
      md += `- **Total Stocks:** ${stocksFiltrados.length}\n`
      md += `- **Total Productos:** ${totalProductos}\n`
      md += `- **Total Piezas:** ${totalPiezas}\n`
      md += `- **Peso Total:** ${totalPeso.toFixed(2)} kg\n`

    } else if (tipoInforme === 'productos') {
      md += `## Inventario de Productos\n\n`

      const todosProductos = stocksFiltrados.flatMap(s => 
        s.productos.map(p => ({ ...p, stock: s.nombre }))
      ).sort((a, b) => a.perfil.localeCompare(b.perfil))

      md += `| # | Perfil | Cantidad | Largo | Ancho | Peso | Stock |\n`
      md += `|---|--------|----------|-------|-------|------|-------|\n`

      todosProductos.forEach((p, i) => {
        md += `| ${i + 1} | ${p.perfil} | ${p.cantidad} | ${p.largo}mm | ${p.ancho}mm | ${p.peso}kg | ${p.stock} |\n`
      })

      md += `\n**Resumen:**\n`
      md += `- Total items: ${todosProductos.length}\n`
      md += `- Total piezas: ${totalPiezas}\n`
      md += `- Peso total: ${totalPeso.toFixed(2)} kg\n`
    }

    md += `\n---\n**⬡** CTIB - Bogotá | **Sistema de Gestión BIM** | v1.0 | ✨ AI Powered`

    return md
  }

  const descargarInforme = () => {
    const contenido = generarMarkdown()
    const blob = new Blob([contenido], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe-almacen-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderVistaPrevia = () => {
    const stocksFiltrados = stockSeleccionado === 'todos' 
      ? stocks 
      : stocks.filter(s => s.id === stockSeleccionado)

    const totalProductos = stocksFiltrados.reduce((sum, s) => sum + s.productos.length, 0)
    const totalPiezas = stocksFiltrados.reduce((sum, s) => 
      sum + s.productos.reduce((p, prod) => p + prod.cantidad, 0), 0
    )
    const totalPeso = stocksFiltrados.reduce((sum, s) => 
      sum + s.productos.reduce((p, prod) => p + prod.peso, 0), 0
    )

    return (
      <div className="informe-preview">
        <div className="preview-header">
          <h4>Vista Previa</h4>
          <button className="btn-primary" onClick={descargarInforme}>
            📥 Descargar .md
          </button>
        </div>
        <div className="preview-body">
          <h2 className="informe-title">INFORME DE ALMACÉN</h2>
          <p className="informe-meta">
            <span>👤 {user?.name || user?.email || 'Usuario'}</span>
            <span>📅 {new Date().toLocaleDateString('es-CO')}</span>
            <span>🕐 {new Date().toLocaleTimeString('es-CO')}</span>
            <span>📦 {stockSeleccionado === 'todos' ? 'Todos los Stocks' : stocks.find(s => s.id === stockSeleccionado)?.nombre}</span>
          </p>

          {tipoInforme === 'resumen' && (
            <div className="informe-section">
              <h3>Resumen General</h3>
              <table className="informe-table center">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Productos</th>
                    <th>Piezas</th>
                    <th>Peso (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {stocksFiltrados.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.nombre}</strong></td>
                      <td>{s.productos.length}</td>
                      <td>{s.productos.reduce((p, prod) => p + prod.cantidad, 0)}</td>
                      <td>{s.productos.reduce((p, prod) => p + prod.peso, 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>TOTAL</strong></td>
                    <td><strong>{totalProductos}</strong></td>
                    <td><strong>{totalPiezas}</strong></td>
                    <td><strong>{totalPeso.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tipoInforme === 'detallado' && (
            <div className="informe-section">
              <h3>Informe Detallado</h3>
              {stocksFiltrados.map(s => {
                const pzas = s.productos.reduce((p, prod) => p + prod.cantidad, 0)
                const peso = s.productos.reduce((p, prod) => p + prod.peso, 0)
                return (
                  <div key={s.id} className="stock-detalle">
                    <div className="stock-header-info">
                      <h4>{s.nombre}</h4>
                      <p>{s.descripcion || 'Sin descripción'}</p>
                      <span className="stock-badge">
                        {s.productos.length} productos | {pzas} piezas | {peso.toFixed(2)} kg
                      </span>
                    </div>
                    {s.productos.length > 0 ? (
                      <table className="informe-table center">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Perfil</th>
                            <th>Cant</th>
                            <th>Largo (mm)</th>
                            <th>Ancho (mm)</th>
                            <th>Peso (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.productos.map(p => (
                            <tr key={p.id}>
                              <td>#{p.id}</td>
                              <td><strong>{p.perfil}</strong></td>
                              <td>{p.cantidad}</td>
                              <td>{p.largo}</td>
                              <td>{p.ancho}</td>
                              <td>{p.peso}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="empty">Sin productos</p>
                    )}
                    {s.productos.some(p => p.comentarios) && (
                      <div className="observaciones">
                        <strong>Observaciones:</strong>
                        {s.productos.filter(p => p.comentarios).map(p => (
                          <p key={p.id}>• {p.perfil}: {p.comentarios}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <div className="informe-total">
                <span>Total: {totalProductos} productos | {totalPiezas} piezas | {totalPeso.toFixed(2)} kg</span>
              </div>
            </div>
          )}

          {tipoInforme === 'productos' && (
            <div className="informe-section">
              <h3>Inventario de Productos</h3>
              {(() => {
                const todosProductos = stocksFiltrados.flatMap(s => 
                  s.productos.map(p => ({ ...p, stock: s.nombre }))
                ).sort((a, b) => a.perfil.localeCompare(b.perfil))

                return (
                  <table className="informe-table center">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Perfil</th>
                        <th>Cant</th>
                        <th>Largo (mm)</th>
                        <th>Ancho (mm)</th>
                        <th>Peso (kg)</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todosProductos.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td><strong>{p.perfil}</strong></td>
                          <td>{p.cantidad}</td>
                          <td>{p.largo}</td>
                          <td>{p.ancho}</td>
                          <td>{p.peso}</td>
                          <td>{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
              <div className="informe-total">
                <span>Total: {totalProductos} productos | {totalPiezas} piezas | {totalPeso.toFixed(2)} kg</span>
              </div>
            </div>
          )}

          <div className="informe-footer">
            <span className="footer-badge">⬡</span>
            <span>CTIB - Bogotá</span>
            <span className="footer-divider">|</span>
            <span className="footer-highlight">Sistema de Gestión BIM</span>
            <span className="footer-divider">|</span>
            <span>v1.0</span>
            <span className="footer-divider">|</span>
            <span>✨ AI Powered</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
      <div className="informe-config">
        <div className="form-grid">
          <div className="form-group">
            <label>Tipo de Informe</label>
            <select 
              value={tipoInforme} 
              onChange={(e) => setTipoInforme(e.target.value as any)}
              className="informe-select"
            >
              <option value="resumen">Resumen General</option>
              <option value="detallado">Informe Detallado</option>
              <option value="productos">Inventario de Productos</option>
            </select>
          </div>

          <div className="form-group">
            <label>Seleccionar Stock</label>
            <select 
              value={stockSeleccionado} 
              onChange={(e) => setStockSeleccionado(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
              className="informe-select"
            >
              <option value="todos">Todos los Stocks</option>
              {stocks.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {renderVistaPrevia()}
      </div>
  )
}