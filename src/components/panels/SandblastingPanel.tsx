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

interface SandblastingData {
  tipoAbrasive: string;
  presion: string;
  operario: string;
  perfilAnclaje: string;
  gradoLimpieza: string;
  tiempoExposicion: string;
  fotosAcabado: string;
  inspeccionLimpieza: string;
  observaciones: string;
}

interface SandblastingPanelProps {
  actividad: Actividad;
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function SandblastingPanel({ actividad, onSave, onClose }: SandblastingPanelProps) {
  const [formData, setFormData] = useState<SandblastingData>({
    tipoAbrasive: '',
    presion: '',
    operario: '',
    perfilAnclaje: '',
    gradoLimpieza: 'Sa 2.5',
    tiempoExposicion: '',
    fotosAcabado: '',
    inspeccionLimpieza: 'Pendiente',
    observaciones: ''
  });

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as SandblastingData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof SandblastingData, value: string) => {
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
          backgroundColor: '#f0f9ff',
          padding: '10px 15px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '0.9em',
          color: '#0369a1'
        }}>
          Estado actual: <strong>{actividad.estado === 'pendiente' ? 'Pendiente' : actividad.estado === 'en_proceso' ? 'En Proceso' : 'Completado'}</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Tipo de Abrasivo:</label>
              <select
                value={formData.tipoAbrasive}
                onChange={(e) => handleChange('tipoAbrasive', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Arena">Arena</option>
                <option value="Granalla">Granalla</option>
                <option value="Perdigón">Perdigón</option>
                <option value="Acero">Acero</option>
              </select>
            </div>

            <div className="form-group">
              <label>Presión de trabajo (PSI):</label>
              <input
                type="number"
                value={formData.presion}
                onChange={(e) => handleChange('presion', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Operario responsable:</label>
              <input
                type="text"
                value={formData.operario}
                onChange={(e) => handleChange('operario', e.target.value)}
                placeholder="Nombre del operario"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Perfil de Anclaje (micras):</label>
              <input
                type="text"
                value={formData.perfilAnclaje}
                onChange={(e) => handleChange('perfilAnclaje', e.target.value)}
                placeholder="Ej: 50-75 micras"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Grado de Limpieza:</label>
              <select
                value={formData.gradoLimpieza}
                onChange={(e) => handleChange('gradoLimpieza', e.target.value)}
                style={inputStyle}
              >
                <option value="Sa 2.0">Sa 2.0</option>
                <option value="Sa 2.5">Sa 2.5</option>
                <option value="Sa 3.0">Sa 3.0</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tiempo de exposición (antes de pintar):</label>
              <input
                type="text"
                value={formData.tiempoExposicion}
                onChange={(e) => handleChange('tiempoExposicion', e.target.value)}
                placeholder="Ej: 4 horas máximo"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Fotos del acabado (URLs):</label>
              <textarea
                value={formData.fotosAcabado}
                onChange={(e) => handleChange('fotosAcabado', e.target.value)}
                placeholder="URLs de fotos, una por línea..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Inspección de limpieza:</label>
              <select
                value={formData.inspeccionLimpieza}
                onChange={(e) => handleChange('inspeccionLimpieza', e.target.value)}
                style={inputStyle}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones:</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Notas sobre la limpieza..."
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
