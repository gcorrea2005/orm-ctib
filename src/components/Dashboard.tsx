import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeSelector from './ThemeSelector'
import UsersPanel from './panels/UsersPanel'
import AlmacenPanel from './panels/AlmacenPanel'
import InformesPanel from './panels/InformesPanel'
import IngenieriaPanel from './panels/IngenieriaPanel'
import TallerPanel from './panels/TallerPanel'
import BimPanel from './panels/BimPanel'
import ConexionesPanel from './panels/ConexionesPanel'
import AcercaPanel from './panels/AcercaPanel'

interface Tab {
  id: string
  label: string
  icon: string
}

const tabs: Tab[] = [
  { id: 'almacen', icon: '📦', label: 'Almacén' },
  { id: 'taller', icon: '🔧', label: 'Taller' },
  { id: 'ingenieria', icon: '⚙️', label: 'Ingeniería' },
  { id: 'bim', icon: '🏗️', label: 'BIM' },
  { id: 'conexiones', icon: '🔗', label: 'Conexiones' },
  { id: 'informes', icon: '📊', label: 'Informes' },
  { id: 'usuarios', icon: '👥', label: 'Usuarios' },
  { id: 'acerca', icon: '👨‍💼', label: 'Acerca' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('usuarios')
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'usuarios': return <UsersPanel />
      case 'almacen': return <AlmacenPanel />
      case 'informes': return <InformesPanel />
      case 'ingenieria': return <IngenieriaPanel />
      case 'taller': return <TallerPanel />
      case 'bim': return <BimPanel />
      case 'conexiones': return <ConexionesPanel />
      case 'acerca': return <AcercaPanel />
      default: return <UsersPanel />
    }
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">CTIB<span className="ai-badge">AI</span></span>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            margin: '0 12px 8px', padding: '8px 12px', borderRadius: 8,
            border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))',
            color: '#a78bfa', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>🎮</span> Steel Builder
        </button>
        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <div className="tab-glow"></div>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0] || user?.email[0]}</div>
            <div className="user-details">
              <span className="user-name">{user?.name || user?.email}</span>
              <span className="user-status">Conectado</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>✕</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">
            <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
            <span className="breadcrumb">Panel de Control / {tabs.find(t => t.id === activeTab)?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeSelector />
            <div className="ai-assistant">
              <span className="assistant-icon">✨</span>
              <span className="assistant-text">Asistente IA</span>
            </div>
          </div>
        </header>
        <div className="content-area">
          {renderPanel()}
        </div>
      </main>
    </div>
  )
}