import { useState } from 'react'
import InformeAlmacenPanel from './InformeAlmacenPanel'
import InformeUsuariosPanel from './InformeUsuariosPanel'
import InformeTallerPanel from './InformeTallerPanel'

type TipoInforme = 'almacen' | 'usuarios' | 'taller'

export default function InformesPanel() {
  const [informeActivo, setInformeActivo] = useState<TipoInforme>('almacen')

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Informes</h2>
      </div>
      
      <div className="informe-tabs">
        <button 
          className={`informe-tab ${informeActivo === 'almacen' ? 'active' : ''}`}
          onClick={() => setInformeActivo('almacen')}
        >
          📦 Almacén
        </button>
        <button 
          className={`informe-tab ${informeActivo === 'usuarios' ? 'active' : ''}`}
          onClick={() => setInformeActivo('usuarios')}
        >
          👥 Usuarios
        </button>
        <button 
          className={`informe-tab ${informeActivo === 'taller' ? 'active' : ''}`}
          onClick={() => setInformeActivo('taller')}
        >
          🏗️ Taller
        </button>
      </div>

      <div className="informe-content">
        {informeActivo === 'almacen' && <InformeAlmacenPanel />}
        {informeActivo === 'usuarios' && <InformeUsuariosPanel />}
        {informeActivo === 'taller' && <InformeTallerPanel />}
      </div>
    </div>
  )
}