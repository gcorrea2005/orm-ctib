import { useTheme } from '../context/ThemeContext'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="theme-selector">
      <button
        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Modo claro"
      >
        ☀️
      </button>
      <button
        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Modo oscuro"
      >
        🌙
      </button>
    </div>
  )
}