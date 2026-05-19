import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

interface User {
  id: number
  email: string
  name: string | null
  activo: boolean
  createdAt: string
}

export default function UsersPanel() {
  const { users, loading: authLoading, refreshUsers } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) setLoading(false)
  }, [authLoading])

  const handleToggleActivo = async (user: User) => {
    const accion = user.activo ? 'desactivar' : 'activar'
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} este usuario?`)) return
    try {
      await api.toggleUserActivo(user.id, !user.activo)
      await refreshUsers()
    } catch (error) {
      console.error('Error toggling user:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await api.deleteUser(id)
      await refreshUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  const activos = users.filter(u => u.activo).length
  const inactivos = users.filter(u => !u.activo).length

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Control de Usuarios</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Usuarios</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{activos}</span>
          <span className="stat-label">Activos</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{inactivos}</span>
          <span className="stat-label">Inactivos</span>
        </div>
      </div>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5}>No hay usuarios registrados</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className={!user.activo ? 'row-inactive' : ''}>
                  <td>#{user.id}</td>
                  <td>{user.name || '—'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.activo ? 'ok' : 'pendiente'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn-icon ${user.activo ? 'inactive' : 'active'}`}
                      onClick={() => handleToggleActivo(user)}
                      title={user.activo ? 'Desactivar' : 'Activar'}
                    >
                      {user.activo ? '⏸' : '▶'}
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDelete(user.id)}
                      title="Eliminar"
                    >🗑</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}