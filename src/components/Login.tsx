import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeSelector from './ThemeSelector'

export default function Login() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    console.log('Attempting:', isRegister ? 'register' : 'login', email)
    
    try {
      if (isRegister) {
        const nameFromEmail = email.split('@')[0]
        console.log('Registering with name:', nameFromEmail)
        const success = await register(email, nameFromEmail)
        console.log('Register result:', success)
        if (success) {
          navigate('/dashboard')
        } else {
          setError('Email ya registrado')
        }
      } else {
        console.log('Logging in...')
        const success = await login(email)
        console.log('Login result:', success)
        if (success) {
          navigate('/dashboard')
        } else {
          setError('Usuario no encontrado')
        }
      }
    } catch (err: unknown) {
      console.error('Auth error:', err)
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="grid-lines"></div>
        <div className="glow-orb glow-1"></div>
        <div className="glow-orb glow-2"></div>
      </div>
      <div className="login-container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <ThemeSelector />
        </div>
        <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : isRegister ? 'Crear Cuenta' : 'Entrar'}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}
        <button className="login-toggle" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Ya tengo cuenta' : 'Crear nueva cuenta'}
        </button>
      </div>
    </div>
  )
}