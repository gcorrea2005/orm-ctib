import { useState, useEffect } from 'react';

interface Actividad {
  id: number;
  elementoId: number;
  tipo: string;
  orden: number;
  estado: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  observaciones: string | null;
  datos: string | null; // JSON string
}

interface SoldaduraData {
  proceso: string;
  clasificacionSoldador: string;
  tipoJunta: string;
  numeroPases: string;
  consumibles: string;
  precalentamiento: string;
  postCalentamiento: string;
  inspeccionVisual: string;
  pruebasNoDestructivas: string;
  fotosSoldadura: string;
  observaciones: string;
}

interface SoldaduraPanelProps {
  actividad: Actividad;
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function SoldaduraPanel({ actividad, onSave, onClose }: SoldaduraPanelProps) {
  const [formData, setFormData] = useState<SoldaduraData>({
    proceso: '',
    clasificacionSoldador: '',
    tipoJunta: '',
    numeroPases: '',
    consumibles: '',
    precalentamiento: '',
    postCalentamiento: '',
    inspeccionVisual: 'Pendiente',
    pruebasNoDestructivas: 'No requerido',
    fotosSoldadura: '',
    observaciones: ''
  });

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as SoldaduraData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof SoldaduraData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const datosString = JSON.stringify(formData);
    onSave(actividad.id, datosString, 'en_proceso');
  };

  const handleCompletar = () => {
    const datosString = JSON.stringify(formData);
    onSave(actividad.id, datosString, 'completado');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'flex-end', // Drawer lateral derecho
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '85%',
        maxWidth: '1200px',
        height: '100vh',
        overflow: 'auto',
        boxShadow: '-5px 0 30px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header fijo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 30px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>🔥 Módulo Soldadura</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#666',
            padding: '0 10px'
          }}>×</button>
        </div>

        {/* Estado actual */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '10px 30px',
          fontSize: '0.9em',
          color: '#0369a1',
          borderBottom: '1px solid #e5e7eb'
        }}>
          Estado actual: <strong>{actividad.estado === 'pendiente' ? 'Pendiente' : actividad.estado === 'en_proceso' ? 'En Proceso' : 'Completado'}</strong>
        </div>

        {/* Contenido scrolleable */}
        <div style={{ padding: '30px', flex: 1, overflow: 'auto' }}>
          <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Proceso de Soldadura:</label>
              <select
                value={formData.proceso}
                onChange={(e) => handleChange('proceso', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="SMAW">SMAW (Electrodo revestido)</option>
                <option value="GMAW">GMAW (MIG/MAG)</option>
                <option value="FCAW">FCAW (Flux-Cored)</option>
                <option value="SAW">SAW (Sumergido)</option>
                <option value="GTAW">GTAW (TIG)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Clasificación del Soldador:</label>
              <input
                type="text"
                value={formData.clasificacionSoldador}
                onChange={(e) => handleChange('clasificacionSoldador', e.target.value)}
                placeholder="Código, certificación"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Tipo de Junta:</label>
              <select
                value={formData.tipoJunta}
                onChange={(e) => handleChange('tipoJunta', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Filete">Filete</option>
                <option value="Penetración Completa">Penetración Completa</option>
                <option value="Bisel Sencillo">Bisel Sencillo</option>
                <option value="Bisel Doble">Bisel Doble</option>
              </select>
            </div>

            <div className="form-group">
              <label>Número de Pases:</label>
              <input
                type="number"
                value={formData.numeroPases}
                onChange={(e) => handleChange('numeroPases', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Consumibles:</label>
              <textarea
                value={formData.consumibles}
                onChange={(e) => handleChange('consumibles', e.target.value)}
                placeholder="Electrodos, gas, flujo..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Precalentamiento (°C):</label>
              <input
                type="number"
                value={formData.precalentamiento}
                onChange={(e) => handleChange('precalentamiento', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Post-calentamiento:</label>
              <input
                type="text"
                value={formData.postCalentamiento}
                onChange={(e) => handleChange('postCalentamiento', e.target.value)}
                placeholder="Stress relief"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Inspección Visual:</label>
              <select
                value={formData.inspeccionVisual}
                onChange={(e) => handleChange('inspeccionVisual', e.target.value)}
                style={inputStyle}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Aprobado con observaciones">Aprobado con observaciones</option>
              </select>
            </div>

            <div className="form-group">
              <label>Pruebas No Destructivas:</label>
              <select
                value={formData.pruebasNoDestructivas}
                onChange={(e) => handleChange('pruebasNoDestructivas', e.target.value)}
                style={inputStyle}
              >
                <option value="No requerido">No requerido</option>
                <option value="UT (Ultrasonido)">UT (Ultrasonido)</option>
                <option value="RT (Radiografía)">RT (Radiografía)</option>
                <option value="PT (Líquidos penetrantes)">PT (Líquidos penetrantes)</option>
                <option value="MT (Partículas magnéticas)">MT (Partículas magnéticas)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Fotos de Soldadura (URLs):</label>
              <textarea
                value={formData.fotosSoldadura}
                onChange={(e) => handleChange('fotosSoldadura', e.target.value)}
                placeholder="URLs de fotos, una por línea..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones:</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Notas sobre la soldadura..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '25px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '20px'
          }}>
            <button type="button" onClick={onClose} style={buttonSecondaryStyle}>
              Cancelar
            </button>
            <button type="submit" style={buttonPrimaryStyle}>
              💾 Guardar (En Proceso)
            </button>
            <button type="button" onClick={handleCompletar} style={buttonSuccessStyle}>
              ✅ Completar Etapa
            </button>
          </div>
        </form>
        </div>{/* Cierra contenido scrolleable */}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.9em',
  marginTop: '5px',
  boxSizing: 'border-box'
};

const buttonPrimaryStyle: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9em',
  fontWeight: 'bold'
};

const buttonSecondaryStyle: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9em'
};

const buttonSuccessStyle: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9em',
  fontWeight: 'bold'
};
