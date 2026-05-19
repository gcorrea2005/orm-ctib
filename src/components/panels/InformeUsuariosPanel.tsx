import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

interface User {
  id: number
  email: string
  name: string | null
  activo: boolean
  createdAt: string
}

export default function InformeUsuariosPanel() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoInforme, setTipoInforme] = useState<'resumen' | 'detallado'>('resumen')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const generarMarkdown = () => {
    const titulo = 'INFORME DE USUARIOS'
    const fecha = new Date().toLocaleDateString('es-CO', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })
    const hora = new Date().toLocaleTimeString('es-CO')

    const nombreUsuario = currentUser?.name || currentUser?.email || 'Usuario'
    const totalUsuarios = users.length
    const usuariosConNombre = users.filter(u => u.name).length
    const usuariosActivos = users.filter(u => u.activo).length
    const usuariosInactivos = users.filter(u => !u.activo).length

    let md = `# ${titulo}\n\n`
    md += `**Elaborado por:** ${nombreUsuario}  \n`
    md += `**Fecha:** ${fecha}  \n`
    md += `**Hora:** ${hora}\n\n`
    md += `---\n\n`

    if (tipoInforme === 'resumen') {
      md += `## Resumen General\n\n`
      md += `| Métrica | Valor |\n`
      md += `|--------|-------|\n`
      md += `| Total Usuarios | ${totalUsuarios} |\n`
      md += `| Usuarios Activos | ${usuariosActivos} |\n`
      md += `| Usuarios Inactivos | ${usuariosInactivos} |\n`
      md += `| Usuarios con Nombre | ${usuariosConNombre} |\n`

    } else if (tipoInforme === 'detallado') {
      md += `## Lista de Usuarios\n\n`
      md += `| ID | Nombre | Email | Estado | Fecha Registro |\n`
      md += `|---|--------|-------|--------|----------------|\n`

      users.forEach(u => {
        const nombre = u.name || '—'
        const estado = u.activo ? 'Activo' : 'Inactivo'
        const fechaReg = new Date(u.createdAt).toLocaleDateString('es-CO')
        md += `| ${u.id} | ${nombre} | ${u.email} | ${estado} | ${fechaReg} |\n`
      })

      md += `\n---\n\n`
      md += `## Resumen\n\n`
      md += `- **Total:** ${totalUsuarios} usuarios\n`
      md += `- **Activos:** ${usuariosActivos}\n`
      md += `- **Inactivos:** ${usuariosInactivos}\n`
      md += `- **Con nombre:** ${usuariosConNombre}\n`
    }

    md += `\n---\n*⬡ CTIB - Bogotá | Sistema de Gestión BIM | v1.0 | ✨ AI Powered*`

    return md
  }

  const descargarInforme = () => {
    const contenido = generarMarkdown()
    const blob = new Blob([contenido], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe-usuarios-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderVistaPrevia = () => {
    const totalUsuarios = users.length
    const usuariosConNombre = users.filter(u => u.name).length
    const usuariosActivos = users.filter(u => u.activo).length

    return (
      <div className="informe-preview">
        <div className="preview-header">
          <h4>Vista Previa</h4>
          <button className="btn-primary" onClick={descargarInforme}>
            📥 Descargar .md
          </button>
        </div>
        <div className="preview-body">
          <h2 className="informe-title">INFORME DE USUARIOS</h2>
          <p className="informe-meta">
            <span>👤 {currentUser?.name || currentUser?.email || 'Usuario'}</span>
            <span>📅 {new Date().toLocaleDateString('es-CO')}</span>
            <span>🕐 {new Date().toLocaleTimeString('es-CO')}</span>
          </p>

          {tipoInforme === 'resumen' && (
            <div className="informe-section">
              <h3>Resumen General</h3>
              <table className="informe-table center">
                <thead>
                  <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Usuarios</td>
                    <td><strong>{totalUsuarios}</strong></td>
                  </tr>
                  <tr>
                    <td>Usuarios Activos</td>
                    <td>{usuariosActivos}</td>
                  </tr>
                  <tr>
                    <td>Usuarios Inactivos</td>
                    <td>{totalUsuarios - usuariosActivos}</td>
                  </tr>
                  <tr>
                    <td>Usuarios con Nombre</td>
                    <td>{usuariosConNombre}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tipoInforme === 'detallado' && (
            <div className="informe-section">
              <h3>Lista de Usuarios</h3>
              <table className="informe-table center">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={!u.activo ? 'row-inactive' : ''}>
                      <td>#{u.id}</td>
                      <td>{u.name || '—'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.activo ? 'ok' : 'pendiente'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="informe-total">
                <span>Total: {totalUsuarios} usuarios</span>
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
              <option value="detallado">Lista de Usuarios</option>
            </select>
          </div>
        </div>

        {renderVistaPrevia()}
      </div>
  )
}