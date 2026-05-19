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

interface PinturaData {
  sistemaPintura: string;
  marcaCodigo: string;
  espesorCapa: string;
  metodoAplicacion: string;
  ambiente: string;
  tiempoSecado: string;
  inspeccionEspesor: string;
  adherencia: string;
  fotosAcabado: string;
  certificadoPintura: string;
}

interface PinturaPanelProps {
  actividad: Actividad;
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function PinturaPanel({ actividad, onSave, onClose }: PinturaPanelProps) {
  const [formData, setFormData] = useState<PinturaData>({
    sistemaPintura: '',
    marcaCodigo: '',
    espesorCapa: '',
    metodoAplicacion: '',
    ambiente: '',
    tiempoSecado: '',
    inspeccionEspesor: '',
    adherencia: 'Pendiente',
    fotosAcabado: '',
    certificadoPintura: ''
  });

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as PinturaData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof PinturaData, value: string) => {
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
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>🎨 Módulo Pintura</h2>
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
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Sistema de Pintura:</label>
              <textarea
                value={formData.sistemaPintura}
                onChange={(e) => handleChange('sistemaPintura', e.target.value)}
                placeholder="Primario, intermedio, acabado..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Marca y Código de Pintura:</label>
              <input
                type="text"
                value={formData.marcaCodigo}
                onChange={(e) => handleChange('marcaCodigo', e.target.value)}
                placeholder="Ej: Sherwin Williams, código..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Espesor de Película Seca (DFT) por capa:</label>
              <input
                type="text"
                value={formData.espesorCapa}
                onChange={(e) => handleChange('espesorCapa', e.target.value)}
                placeholder="Ej: 50 micras, 75 micras..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Método de Aplicación:</label>
              <select
                value={formData.metodoAplicacion}
                onChange={(e) => handleChange('metodoAplicacion', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Brocha">Brocha</option>
                <option value="Rodillo">Rodillo</option>
                <option value="Pulverización convencional">Pulverización convencional</option>
                <option value="Airless">Airless</option>
                <option value="Electrostática">Electrostática</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Espesor de Película Seca (DFT) por capa:</label>
              <input
                type="text"
                value={formData.espesorCapa}
                onChange={(e) => handleChange('espesorCapa', e.target.value)}
                placeholder="Ej: 50 micras, 75 micras..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Método de Aplicación:</label>
              <select
                value={formData.metodoAplicacion}
                onChange={(e) => handleChange('metodoAplicacion', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Brocha">Brocha</option>
                <option value="Rodillo">Rodillo</option>
                <option value="Pulverización convencional">Pulverización convencional</option>
                <option value="Airless">Airless</option>
                <option value="Electrostática">Electrostática</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Ambiente (Temperatura, Humedad Relativa):</label>
              <input
                type="text"
                value={formData.ambiente}
                onChange={(e) => handleChange('ambiente', e.target.value)}
                placeholder="Ej: 25°C, 60% HR"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Tiempo de Secado entre capas:</label>
              <input
                type="text"
                value={formData.tiempoSecado}
                onChange={(e) => handleChange('tiempoSecado', e.target.value)}
                placeholder="Ej: 4 horas"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Inspección de Espesor (Medidor DFT):</label>
              <input
                type="text"
                value={formData.inspeccionEspesor}
                onChange={(e) => handleChange('inspeccionEspesor', e.target.value)}
                placeholder="Lecturas de espesor..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Adherencia (Test de cuadrícula):</label>
              <select
                value={formData.adherencia}
                onChange={(e) => handleChange('adherencia', e.target.value)}
                style={inputStyle}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Fotos del Acabado (URLs):</label>
              <textarea
                value={formData.fotosAcabado}
                onChange={(e) => handleChange('fotosAcabado', e.target.value)}
                placeholder="URLs de fotos, una por línea..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Certificado de Pintura (URL):</label>
              <input
                type="url"
                value={formData.certificadoPintura}
                onChange={(e) => handleChange('certificadoPintura', e.target.value)}
                placeholder="https://..."
                style={inputStyle}
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
