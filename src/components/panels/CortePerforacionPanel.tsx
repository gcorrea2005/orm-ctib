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

interface CortePerforacionData {
  maquina: string;
  operario: string;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  longitudReal: string;
  longitudTeorica: string;
  cantidadCortes: string;
  cantidadPerforaciones: string;
  diametros: string;
  ubicacionPerforaciones: string;
  estadoPiezas: string;
  observacionesCalidad: string;
}

interface CortePerforacionPanelProps {
  actividad: Actividad;
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function CortePerforacionPanel({ actividad, onSave, onClose }: CortePerforacionPanelProps) {
  const [formData, setFormData] = useState<CortePerforacionData>({
    maquina: '',
    operario: '',
    fechaInicio: '',
    horaInicio: '',
    fechaFin: '',
    horaFin: '',
    longitudReal: '',
    longitudTeorica: '',
    cantidadCortes: '',
    cantidadPerforaciones: '',
    diametros: '',
    ubicacionPerforaciones: '',
    estadoPiezas: 'Aprobado',
    observacionesCalidad: ''
  });

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as CortePerforacionData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof CortePerforacionData, value: string) => {
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
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end', // Drawer lateral derecho
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
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>✂️ Módulo Corte y Perforación</h2>
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
              <label>Máquina utilizada:</label>
              <select
                value={formData.maquina}
                onChange={(e) => handleChange('maquina', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Sierra">Sierra</option>
                <option value="CNC">CNC</option>
                <option value="Láser">Láser</option>
                <option value="Plasma">Plasma</option>
              </select>
            </div>

            <div className="form-group">
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
              <label>Fecha de inicio:</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Hora de inicio:</label>
              <input
                type="time"
                value={formData.horaInicio}
                onChange={(e) => handleChange('horaInicio', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Fecha de fin:</label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => handleChange('fechaFin', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Hora de fin:</label>
              <input
                type="time"
                value={formData.horaFin}
                onChange={(e) => handleChange('horaFin', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Longitud teórica (mm):</label>
              <input
                type="number"
                step="0.01"
                value={formData.longitudTeorica}
                onChange={(e) => handleChange('longitudTeorica', e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Longitud real (mm):</label>
              <input
                type="number"
                step="0.01"
                value={formData.longitudReal}
                onChange={(e) => handleChange('longitudReal', e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Cantidad de cortes:</label>
              <input
                type="number"
                value={formData.cantidadCortes}
                onChange={(e) => handleChange('cantidadCortes', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Cantidad de perforaciones:</label>
              <input
                type="number"
                value={formData.cantidadPerforaciones}
                onChange={(e) => handleChange('cantidadPerforaciones', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Diámetros de perforaciones:</label>
              <input
                type="text"
                value={formData.diametros}
                onChange={(e) => handleChange('diametros', e.target.value)}
                placeholder="Ej: 10mm, 12mm, 16mm"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Ubicación de perforaciones:</label>
              <textarea
                value={formData.ubicacionPerforaciones}
                onChange={(e) => handleChange('ubicacionPerforaciones', e.target.value)}
                placeholder="Descripción de ubicaciones..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Estado de piezas:</label>
              <select
                value={formData.estadoPiezas}
                onChange={(e) => handleChange('estadoPiezas', e.target.value)}
                style={inputStyle}
              >
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Aprobado con observaciones">Aprobado con observaciones</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones de calidad:</label>
              <textarea
                value={formData.observacionesCalidad}
                onChange={(e) => handleChange('observacionesCalidad', e.target.value)}
                placeholder="Notas de calidad, defectos encontrados..."
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
