import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

interface Producto {
  id: number
  perfil: string
  cantidad: number
  largo: number
  ancho: number
  peso: number
  comentarios: string | null
  createdAt: string
}

interface Stock {
  id: number
  nombre: string
  descripcion: string | null
  productos: Producto[]
}

export default function AlmacenPanel() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [stockForm, setStockForm] = useState({ nombre: '', descripcion: '' })
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState({ perfil: '', cantidad: 0, largo: 0, ancho: 0, peso: 0, comentarios: '' })
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)

  useEffect(() => {
    loadStocks()
  }, [])

  const loadStocks = async () => {
    try {
      setError('')
      const data = await api.getStocks()
      setStocks(data)
    } catch (err) {
      setError('Error de conexión. Asegúrate que el servidor esté corriendo.')
      console.error('Error loading stocks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStock = async () => {
    if (!stockForm.nombre) {
      setError('Ingresa un nombre para el stock')
      return
    }
    try {
      setError('')
      await api.createStock(stockForm.nombre, stockForm.descripcion)
      await loadStocks()
      setStockForm({ nombre: '', descripcion: '' })
      setShowForm(false)
    } catch (err) {
      setError('Error al crear stock. Verifica que el servidor esté corriendo.')
      console.error('Error creating stock:', err)
    }
  }

  const handleDeleteStock = async (id: number) => {
    if (!confirm('¿Eliminar este stock y todos sus productos?')) return
    try {
      await api.deleteStock(id)
      await loadStocks()
      if (selectedStock?.id === id) setSelectedStock(null)
    } catch (error) {
      console.error('Error deleting stock:', error)
    }
  }

  const handleUpdateStock = async () => {
    if (!editingStock || !stockForm.nombre) return
    try {
      await api.updateStock(editingStock.id, stockForm.nombre, stockForm.descripcion)
      await loadStocks()
      const updated = await api.getStocks()
      const found = updated.find((s: Stock) => s.id === editingStock.id)
      if (found) setSelectedStock(found)
      setEditingStock(null)
      setStockForm({ nombre: '', descripcion: '' })
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const handleCreateProduct = async () => {
    if (!selectedStock || !productForm.perfil) return
    try {
      await api.createProducto(selectedStock.id, {
        perfil: productForm.perfil,
        cantidad: productForm.cantidad,
        largo: productForm.largo,
        ancho: productForm.ancho,
        peso: productForm.peso,
        comentarios: productForm.comentarios || null
      })
      await loadStocks()
      const updated = await api.getStocks()
      const found = updated.find((s: Stock) => s.id === selectedStock.id)
      if (found) setSelectedStock(found)
      setProductForm({ perfil: '', cantidad: 0, largo: 0, ancho: 0, peso: 0, comentarios: '' })
      setShowProductForm(false)
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await api.deleteProducto(productId)
      await loadStocks()
      if (selectedStock) {
        const updated = await api.getStocks()
        const found = updated.find((s: Stock) => s.id === selectedStock.id)
        if (found) setSelectedStock(found)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !productForm.perfil) return
    try {
      await api.updateProducto(editingProduct.id, {
        perfil: productForm.perfil,
        cantidad: productForm.cantidad,
        largo: productForm.largo,
        ancho: productForm.ancho,
        peso: productForm.peso,
        comentarios: productForm.comentarios || null
      })
      await loadStocks()
      if (selectedStock) {
        const updated = await api.getStocks()
        const found = updated.find((s: Stock) => s.id === selectedStock.id)
        if (found) setSelectedStock(found)
      }
      setEditingProduct(null)
      setProductForm({ perfil: '', cantidad: 0, largo: 0, ancho: 0, peso: 0, comentarios: '' })
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const totalStocks = stocks.length
  const totalPiezas = stocks.reduce((sum, s) => 
    sum + s.productos.reduce((p, prod) => p + prod.cantidad, 0), 0
  )
  const totalPeso = stocks.reduce((sum, s) => 
    sum + s.productos.reduce((p, prod) => p + prod.peso, 0), 0
  )

  if (loading) {
    return (
      <div className="panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando almacén...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Gestión de Almacén</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo Stock
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{totalStocks}</span>
          <span className="stat-label">Total Stocks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalPiezas}</span>
          <span className="stat-label">Piezas</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-value">{totalPeso.toFixed(2)} kg</span>
          <span className="stat-label">Peso Total</span>
        </div>
      </div>

      {/* Formulario Nuevo Stock */}
      {(showForm || editingStock) && (
        <div className="add-form">
          <h4>{editingStock ? 'Editar Stock' : 'Nuevo Stock'}</h4>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Nombre (ej: STOCK-01)"
              value={stockForm.nombre}
              onChange={e => setStockForm({ ...stockForm, nombre: e.target.value })}
            />
            <input
              type="text"
              placeholder="Descripción"
              value={stockForm.descripcion}
              onChange={e => setStockForm({ ...stockForm, descripcion: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditingStock(null); setStockForm({ nombre: '', descripcion: '' }) }}>Cancelar</button>
            <button className="btn-primary" onClick={editingStock ? handleUpdateStock : handleCreateStock}>{editingStock ? 'Guardar' : 'Crear Stock'}</button>
          </div>
        </div>
      )}

      {/* Fichas de Stocks */}
      <div className="stocks-grid">
        {stocks.length === 0 ? (
          <div className="empty-state">
            <p>No hay stocks creados. Crea el primero.</p>
          </div>
        ) : (
          stocks.map(stock => (
            <div 
              key={stock.id} 
              className={`stock-card ${selectedStock?.id === stock.id ? 'selected' : ''}`}
              onClick={() => setSelectedStock(stock)}
            >
              <div className="stock-card-header">
                <div className="stock-icon">📦</div>
                <div className="stock-info">
                  <h3>{stock.nombre}</h3>
                  <p>{stock.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="stock-actions">
                  <button className="btn-icon edit" title="Editar" onClick={(e) => { e.stopPropagation(); setEditingStock(stock); setStockForm({ nombre: stock.nombre, descripcion: stock.descripcion || '' }) }}>✏️</button>
                  <button className="btn-icon delete" title="Eliminar" onClick={(e) => { e.stopPropagation(); handleDeleteStock(stock.id) }}>🗑</button>
                </div>
              </div>
              <div className="stock-card-stats">
                <span className="mini-stat">{stock.productos.length} productos</span>
                <span className="mini-stat">{stock.productos.reduce((sum, p) => sum + p.cantidad, 0)} piezas</span>
                <span className="mini-stat">{stock.productos.reduce((sum, p) => sum + p.peso, 0).toFixed(2)} kg</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detalle del Stock Seleccionado */}
      {selectedStock && (
        <div className="stock-detail">
          <div className="stock-detail-header">
            <h3>📦 {selectedStock.nombre}</h3>
            <span className="stock-detail-desc">{selectedStock.descripcion || 'Sin descripción'}</span>
            <button className="btn-primary btn-sm" onClick={() => setShowProductForm(true)}>
              + Agregar Producto
            </button>
          </div>

          {(showProductForm || editingProduct) && (
            <div className="add-form">
              <h4>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h4>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Perfil (ej: W8x10)"
                  value={productForm.perfil}
                  onChange={e => setProductForm({ ...productForm, perfil: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={productForm.cantidad || ''}
                  onChange={e => setProductForm({ ...productForm, cantidad: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Largo (mm)"
                  value={productForm.largo || ''}
                  onChange={e => setProductForm({ ...productForm, largo: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Ancho (mm)"
                  value={productForm.ancho || ''}
                  onChange={e => setProductForm({ ...productForm, ancho: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Peso (kg)"
                  value={productForm.peso || ''}
                  onChange={e => setProductForm({ ...productForm, peso: Number(e.target.value) })}
                />
                <input
                  type="text"
                  placeholder="Comentarios"
                  value={productForm.comentarios}
                  onChange={e => setProductForm({ ...productForm, comentarios: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm({ perfil: '', cantidad: 0, largo: 0, ancho: 0, peso: 0, comentarios: '' }) }}>Cancelar</button>
                <button className="btn-primary" onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}>{editingProduct ? 'Guardar' : 'Agregar'}</button>
              </div>
            </div>
          )}

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Perfil</th>
                  <th>Cantidad</th>
                  <th>Largo</th>
                  <th>Ancho</th>
                  <th>Peso</th>
                  <th>Comentarios</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {selectedStock.productos.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                      No hay productos en este stock.
                    </td>
                  </tr>
                ) : (
                  selectedStock.productos.map(product => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td><strong>{product.perfil}</strong></td>
                      <td>{product.cantidad}</td>
                      <td>{product.largo} mm</td>
                      <td>{product.ancho} mm</td>
                      <td>{product.peso} kg</td>
                      <td>{product.comentarios || '—'}</td>
                      <td>
                        <button className="btn-icon edit" onClick={() => { setEditingProduct(product); setProductForm({ perfil: product.perfil, cantidad: product.cantidad, largo: product.largo, ancho: product.ancho, peso: product.peso, comentarios: product.comentarios || '' }) }}>✏️</button>
                        <button className="btn-icon delete" onClick={() => handleDeleteProduct(product.id)}>🗑</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}