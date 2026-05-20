import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

interface Conexion {
  id: number
  vigaPrincipal: string
  vigaSecundaria: string
  categoria: string | null
  tipoConexion: string
  platinaAnclaje: boolean
  anchoPlatina: number | null
  largoPlatina: number | null
  espesorPlatina: number | null
  pesoPlatina: number | null
  perforaciones: string | null
  numTornillos: number | null
  diametroTornillo: number | null
  largoTornillo: number | null
  longitudCordon: number | null
  tamanoFilete: number | null
  volumenCordon: number | null
  pesoCordon: number | null
  observaciones: string | null
  createdAt: string
}

const ALL_FAMILIES = ['IPE', 'HEA', 'HSS-RECT', 'HI', 'PHI', 'TUBO CUADRADO', 'TUBO REDONDO', 'UPN', 'PLACA BASE']

// Generar todas las combinaciones (9x9 = 81)
const COMBINACIONES = ALL_FAMILIES.flatMap((p, pi) =>
  ALL_FAMILIES.map((s, si) => ({
    id: pi * ALL_FAMILIES.length + si + 1,
    cat: `${p}-${s}`,
    principal: p,
    secundaria: s,
    tipo: p === 'PLACA BASE' || s === 'PLACA BASE' ? 'soldada' : 'soldada/atornillada'
  }))
)

function getFamilia(perfil: string): string {
  if (perfil.startsWith('IPE')) return 'IPE'
  if (perfil.startsWith('HEA')) return 'HEA'
  if (perfil.startsWith('HI ')) return 'HI'
  if (perfil.startsWith('PHI ')) return 'PHI'
  if (perfil.startsWith('[]')) return 'HSS-RECT'
  if (perfil.startsWith('TUBO CUADRADO')) return 'TUBO CUADRADO'
  if (perfil.startsWith('TUBO REDONDO')) return 'TUBO REDONDO'
  if (perfil.startsWith('UPN')) return 'UPN'
  if (perfil === 'PLACA BASE') return 'PLACA BASE'
  return ''
}

function calcCategoria(principal: string, secundaria: string): string | null {
  const famP = getFamilia(principal)
  const famS = getFamilia(secundaria)
  if (!famP || !famS) return null
  const combo = COMBINACIONES.find(c => c.principal === famP && c.secundaria === famS)
  return combo?.cat || null
}

const PERFILES_PRINCIPALES = [
  'IPE 140', 'IPE 160', 'IPE 200', 'IPE 240', 'IPE 270', 'IPE 300', 'IPE 330',
  'IPE 400', 'IPE 450', 'IPE 550',
  'HEA 140', 'HEA 240', 'HEA 400', 'HEA 450', 'HEA 500', 'HEA 600',
  '[]70x3', '[]200x100x4', '[]250x4', '[]250x8', '[]250x10', '[]255x1',
  '[]350x22', '[]350x25', '[]450x38', '[]500x35', '[]500x42', '[]550x38',
  '[]650x45', '[]650x64',
  'HI 420-10', 'HI 440-10', 'HI 450-32', 'HI 590-10',
  'HI 830-10', 'HI 830-11', 'HI 1130-5', 'HI 1130-12', 'HI 1130-13',
  'PHI 830-44', 'PHI 1130-5',
  'TUBO CUADRADO 100x100', 'TUBO CUADRADO 120x120', 'TUBO CUADRADO 150x150',
  'TUBO CUADRADO 200x200', 'TUBO CUADRADO 250x250', 'TUBO CUADRADO 300x300',
  'TUBO CUADRADO 350x350', 'TUBO CUADRADO 400x400',
  'TUBO REDONDO 114.3x6', 'TUBO REDONDO 168.3x7', 'TUBO REDONDO 219.1x8',
  'TUBO REDONDO 273x8', 'TUBO REDONDO 305x10', 'TUBO REDONDO 323.9x10',
  'TUBO REDONDO 355.6x10', 'TUBO REDONDO 406.4x12', 'TUBO REDONDO 508x12',
  'UPN 80', 'UPN 160',
]

const PERFILES_SECUNDARIOS = [
  ...PERFILES_PRINCIPALES,
  'PLACA BASE'
]

// Dimensiones estandar de perfiles (mm): h=altura, b=ancho, tf=espesor ala
const PERFIL_DIM: Record<string, { h: number; b: number; tf: number }> = {
  // IPE
  'IPE 140': { h: 140, b: 73, tf: 6.9 },
  'IPE 160': { h: 160, b: 82, tf: 7.4 },
  'IPE 200': { h: 200, b: 100, tf: 8.5 },
  'IPE 240': { h: 240, b: 120, tf: 9.8 },
  'IPE 270': { h: 270, b: 135, tf: 10.2 },
  'IPE 300': { h: 300, b: 150, tf: 10.7 },
  'IPE 330': { h: 330, b: 160, tf: 11.5 },
  'IPE 400': { h: 400, b: 180, tf: 13.5 },
  'IPE 450': { h: 450, b: 190, tf: 14.6 },
  'IPE 550': { h: 550, b: 210, tf: 17.2 },
  // HEA
  'HEA 140': { h: 140, b: 140, tf: 7 },
  'HEA 240': { h: 240, b: 240, tf: 12 },
  'HEA 400': { h: 400, b: 300, tf: 19 },
  'HEA 450': { h: 450, b: 300, tf: 21 },
  'HEA 500': { h: 500, b: 300, tf: 23 },
  'HEA 600': { h: 600, b: 300, tf: 25 },
  // HI (vigas H soldadas)
  'HI 420-10': { h: 420, b: 400, tf: 10 },
  'HI 440-10': { h: 440, b: 400, tf: 10 },
  'HI 450-32': { h: 450, b: 420, tf: 32 },
  'HI 590-10': { h: 590, b: 500, tf: 10 },
  'HI 830-10': { h: 830, b: 600, tf: 10 },
  'HI 830-11': { h: 830, b: 600, tf: 11 },
  'HI 1130-5': { h: 1130, b: 600, tf: 5 },
  'HI 1130-12': { h: 1130, b: 600, tf: 12 },
  'HI 1130-13': { h: 1130, b: 600, tf: 13 },
  // PHI
  'PHI 830-44': { h: 830, b: 600, tf: 44 },
  'PHI 1130-5': { h: 1130, b: 600, tf: 5 },
  // HSS Rectangulares
  '[]70x3': { h: 70, b: 70, tf: 3 },
  '[]200x100x4': { h: 200, b: 100, tf: 4 },
  '[]250x4': { h: 250, b: 250, tf: 4 },
  '[]250x8': { h: 250, b: 250, tf: 8 },
  '[]250x10': { h: 250, b: 250, tf: 10 },
  '[]255x1': { h: 255, b: 255, tf: 1 },
  '[]350x22': { h: 350, b: 350, tf: 22 },
  '[]350x25': { h: 350, b: 350, tf: 25 },
  '[]450x38': { h: 450, b: 450, tf: 38 },
  '[]500x35': { h: 500, b: 500, tf: 35 },
  '[]500x42': { h: 500, b: 500, tf: 42 },
  '[]550x38': { h: 550, b: 550, tf: 38 },
  '[]650x45': { h: 650, b: 650, tf: 45 },
  '[]650x64': { h: 650, b: 650, tf: 64 },
  // UPN
  'UPN 80': { h: 80, b: 45, tf: 6 },
  'UPN 160': { h: 160, b: 65, tf: 7.5 },
}

function getDimensionesLibres(perfil: string): { ancho: number; largo: number } | null {
  const dim = PERFIL_DIM[perfil]
  if (!dim) return null
  return {
    ancho: Math.round((dim.b - dim.tf) / 2 * 10) / 10,
    largo: Math.round((dim.h - 2 * dim.tf) * 10) / 10
  }
}

const emptyForm = {
  vigaPrincipal: '',
  vigaSecundaria: '',
  tipoConexion: 'soldada',
  platinaAnclaje: false,
  anchoPlatina: '',
  largoPlatina: '',
  espesorPlatina: '',
  pesoPlatina: '',
  perforaciones: 'alargadas',
  numTornillos: '',
  diametroTornillo: '',
  largoTornillo: '',
  longitudCordon: '',
  tamanoFilete: '',
  pesoCordon: '',
  observaciones: ''
}

export default function ConexionesPanel() {
  const [conexiones, setConexiones] = useState<Conexion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Conexion | null>(null)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { loadConexiones() }, [])

  const loadConexiones = async () => {
    try {
      setError('')
      const data = await api.getConexiones()
      setConexiones(data)
    } catch (err) {
      setError('Error de conexión. Asegúrate que el servidor esté corriendo.')
      console.error('Error loading conexiones:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.vigaPrincipal || !form.vigaSecundaria) {
      setError('Selecciona viga principal y secundaria')
      return
    }
    try {
      setError('')
      const categoria = calcCategoria(form.vigaPrincipal, form.vigaSecundaria)
      const data = {
        vigaPrincipal: form.vigaPrincipal,
        vigaSecundaria: form.vigaSecundaria,
        categoria,
        tipoConexion: form.tipoConexion,
        platinaAnclaje: form.platinaAnclaje,
        anchoPlatina: form.anchoPlatina || null,
        largoPlatina: form.largoPlatina || null,
        espesorPlatina: form.espesorPlatina || null,
        pesoPlatina: form.pesoPlatina || null,
        perforaciones: form.perforaciones || null,
        numTornillos: form.numTornillos || null,
        diametroTornillo: form.diametroTornillo || null,
        largoTornillo: form.largoTornillo || null,
        longitudCordon: form.longitudCordon || null,
        tamanoFilete: form.tamanoFilete || null,
        observaciones: form.observaciones || null
      }
      if (editing) {
        await api.updateConexion(editing.id, data)
      } else {
        await api.createConexion(data)
      }
      await loadConexiones()
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
    } catch (err) {
      setError('Error al guardar conexión')
      console.error('Error saving conexion:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta conexión?')) return
    try {
      await api.deleteConexion(id)
      await loadConexiones()
    } catch (err) {
      console.error('Error deleting conexion:', err)
    }
  }

  const openEdit = (c: Conexion) => {
    setEditing(c)
    setForm({
      vigaPrincipal: c.vigaPrincipal,
      vigaSecundaria: c.vigaSecundaria,
      tipoConexion: c.tipoConexion,
      platinaAnclaje: c.platinaAnclaje,
      anchoPlatina: c.anchoPlatina?.toString() || '',
      largoPlatina: c.largoPlatina?.toString() || '',
      espesorPlatina: c.espesorPlatina?.toString() || '',
      pesoPlatina: c.pesoPlatina?.toString() || '',
      perforaciones: c.perforaciones || '',
      numTornillos: c.numTornillos?.toString() || '',
      diametroTornillo: c.diametroTornillo?.toString() || '',
      largoTornillo: c.largoTornillo?.toString() || '',
      longitudCordon: c.longitudCordon?.toString() || '',
      tamanoFilete: c.tamanoFilete?.toString() || '',
      pesoCordon: c.pesoCordon?.toString() || '',
      observaciones: c.observaciones || ''
    })
    setShowForm(true)
  }

  // Auto-detectar categoría al cambiar perfiles
  const categoriaActual = form.vigaPrincipal && form.vigaSecundaria
    ? calcCategoria(form.vigaPrincipal, form.vigaSecundaria)
    : null

  const filtered = conexiones.filter(c => {
    if (filtroTipo && c.tipoConexion !== filtroTipo) return false
    if (filtroCategoria && c.categoria !== filtroCategoria) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return c.vigaPrincipal.toLowerCase().includes(q) || c.vigaSecundaria.toLowerCase().includes(q)
    }
    return true
  })

  const totalConexiones = conexiones.length
  const totalSoldadas = conexiones.filter(c => c.tipoConexion === 'soldada').length
  const totalAtornilladas = conexiones.filter(c => c.tipoConexion === 'atornillada').length

  const handleGenerateAll = async () => {
    if (!confirm('Generar todas las combinaciones de perfiles? (Las existentes no se duplican)')) return
    try {
      setLoading(true)
      const result = await api.generateAllConexiones()
      await loadConexiones()
      alert(result.message)
    } catch (err) {
      setError('Error al generar conexiones')
    }
  }

  if (loading) {
    return (
      <div className="panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando conexiones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Conexiones Estructurales</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={handleGenerateAll}>
            Generar Todas
          </button>
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }}>
            + Nueva Conexión
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{totalConexiones}</span>
          <span className="stat-label">Total Conexiones</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalSoldadas}</span>
          <span className="stat-label">Soldadas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalAtornilladas}</span>
          <span className="stat-label">Atornilladas</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="search-bar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar por perfil..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
          <option value="">Todas las combinaciones</option>
          {COMBINACIONES.map(c => <option key={c.cat} value={c.cat}>{c.cat}</option>)}
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="soldada">Soldada</option>
          <option value="atornillada">Atornillada</option>
        </select>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="add-form" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
          <h4 style={{ margin: 0, padding: '14px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontSize: '15px' }}>
            {editing ? 'Editar Conexión' : 'Nueva Conexión'}
          </h4>

          <div style={{ padding: '16px 20px' }}>
            {/* SECCION 1: Conexion */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>🔗</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conexión</span>
              <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Viga Principal</label>
                <select
                  value={form.vigaPrincipal}
                  onChange={e => {
                    const v = e.target.value
                    const dim = getDimensionesLibres(v)
                    setForm({
                      ...form,
                      vigaPrincipal: v,
                      ...(dim ? {
                        anchoPlatina: dim.ancho.toString(),
                        largoPlatina: dim.largo.toString(),
                        longitudCordon: Math.round(2 * (dim.largo + 2 * dim.ancho) * 10) / 10 + '',
                        tamanoFilete: '6',
                        numTornillos: '3',
                        diametroTornillo: '16',
                        largoTornillo: '38'
                      } : {})
                    })
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}
                >
                  <option value="">Seleccionar...</option>
                  {PERFILES_PRINCIPALES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Viga Secundaria</label>
                <select
                  value={form.vigaSecundaria}
                  onChange={e => setForm({ ...form, vigaSecundaria: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}
                >
                  <option value="">Seleccionar...</option>
                  {PERFILES_SECUNDARIOS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {categoriaActual && (
                <div style={{ gridColumn: '1 / -1', background: '#f0f4ff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#667eea', color: '#fff', padding: '2px 10px', borderRadius: '4px', fontWeight: 600, fontSize: '12px' }}>{categoriaActual}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>{form.tipoConexion === 'atornillada' ? 'Atornillada' : 'Soldada'}</span>
                </div>
              )}
              <div>
                <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Tipo de Conexión</label>
                <select
                  value={form.tipoConexion}
                  onChange={e => setForm({ ...form, tipoConexion: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}
                >
                  <option value="soldada">Soldada</option>
                  <option value="atornillada">Atornillada</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={form.platinaAnclaje}
                  onChange={e => setForm({ ...form, platinaAnclaje: e.target.checked })}
                  id="platinaCheck"
                  style={{ width: '16px', height: '16px', accentColor: '#667eea' }}
                />
                <label htmlFor="platinaCheck" style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Platina de Anclaje</label>
              </div>
            </div>

            {/* SECCION 2: Platina */}
            {form.platinaAnclaje && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>⬜</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platina</span>
                  <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Ancho <span style={{ color: '#aaa' }}>(b-tf)/2</span></label>
                    <input type="number" placeholder="Auto..." value={form.anchoPlatina} onChange={e => setForm({ ...form, anchoPlatina: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Largo <span style={{ color: '#aaa' }}>h-2tf</span></label>
                    <input type="number" placeholder="Auto..." value={form.largoPlatina} onChange={e => setForm({ ...form, largoPlatina: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Espesor <span style={{ color: '#aaa' }}>mm</span></label>
                    <input type="number" placeholder="ej: 12" value={form.espesorPlatina} onChange={e => setForm({ ...form, espesorPlatina: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Peso <span style={{ color: '#aaa' }}>kg</span></label>
                    <input type="number" step="0.01" placeholder="Auto..." value={form.pesoPlatina} onChange={e => setForm({ ...form, pesoPlatina: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Perforaciones</label>
                    <select value={form.perforaciones} onChange={e => setForm({ ...form, perforaciones: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}>
                      <option value="">Seleccionar...</option>
                      <option value="redondas">Redondas</option>
                      <option value="alargadas">Alargadas</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* SECCION 3: Tornillos */}
            {form.tipoConexion === 'atornillada' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>🔩</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tornillos</span>
                  <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Cantidad</label>
                    <input type="number" placeholder="ej: 4" value={form.numTornillos} onChange={e => setForm({ ...form, numTornillos: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Diámetro <span style={{ color: '#aaa' }}>mm</span></label>
                    <input type="number" placeholder="ej: 16" value={form.diametroTornillo} onChange={e => setForm({ ...form, diametroTornillo: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Largo <span style={{ color: '#aaa' }}>mm</span></label>
                    <input type="number" placeholder="ej: 50" value={form.largoTornillo} onChange={e => setForm({ ...form, largoTornillo: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </>
            )}

            {/* SECCION 4: Soldadura */}
            {(form.tipoConexion === 'soldada' || form.platinaAnclaje) && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>🔥</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soldadura</span>
                  {form.tipoConexion === 'atornillada' && form.platinaAnclaje && (
                    <span style={{ fontSize: '11px', color: '#e67e22', fontStyle: 'italic' }}>(platina a viga)</span>
                  )}
                  <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Longitud Cordón <span style={{ color: '#aaa' }}>mm</span></label>
                    <input type="number" placeholder="ej: 200" value={form.longitudCordon} onChange={e => setForm({ ...form, longitudCordon: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block' }}>Tamaño Filete <span style={{ color: '#aaa' }}>mm</span></label>
                    <input type="number" placeholder="ej: 6" value={form.tamanoFilete} onChange={e => setForm({ ...form, tamanoFilete: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </>
            )}

            {/* SECCION 5: Notas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>📝</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notas</span>
              <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input type="text" placeholder="Observaciones adicionales..." value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div className="form-actions" style={{ margin: 0, padding: '12px 20px', background: '#f8f8f8', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>{editing ? 'Guardar' : 'Crear Conexión'}</button>
          </div>
        </div>
      )}

      {/* Cards de conexiones */}
      <div className="stocks-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{busqueda || filtroTipo || filtroCategoria ? 'Sin resultados para el filtro.' : 'No hay conexiones creadas. Crea la primera.'}</p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="stock-card">
              <div className="stock-card-header">
                <div className="stock-icon">{c.tipoConexion === 'soldada' ? '🔥' : '🔩'}</div>
                <div className="stock-info">
                  <h3>{c.vigaPrincipal} → {c.vigaSecundaria}</h3>
                  <p style={{ textTransform: 'capitalize' }}>
                    {c.categoria && <span style={{ background: '#667eea', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '6px' }}>{c.categoria}</span>}
                    {c.tipoConexion}
                  </p>
                </div>
                <div className="stock-actions">
                  <button className="btn-icon edit" title="Editar" onClick={() => openEdit(c)}>✏️</button>
                  <button className="btn-icon delete" title="Eliminar" onClick={() => handleDelete(c.id)}>🗑</button>
                </div>
              </div>
              <div className="stock-card-stats" style={{ flexWrap: 'wrap' }}>
                {c.platinaAnclaje && (
                  <span className="mini-stat">Platina: {c.anchoPlatina || '?'}x{c.largoPlatina || '?'}x{c.espesorPlatina || '?'}mm</span>
                )}
                {c.platinaAnclaje && c.pesoPlatina ? <span className="mini-stat">W plat: {c.pesoPlatina}kg</span> : null}
                {c.perforaciones && <span className="mini-stat">Perf: {c.perforaciones}</span>}
                {c.tipoConexion === 'atornillada' && c.numTornillos && (
                  <span className="mini-stat">Tornillos: {c.numTornillos}x ∅{c.diametroTornillo}x{c.largoTornillo}mm</span>
                )}
                {c.longitudCordon && (
                  <span className="mini-stat">Cordón: {c.longitudCordon}mm / Filete: {c.tamanoFilete}mm / Vol: {c.volumenCordon}mm³ / W: {c.pesoCordon}kg</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
