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

interface ArmadoData {
  areaArmado: string;
  operarios: string;
  liderEquipo: string;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  cantidadPiezas: string;
  usoPlantillas: string;
  verificacionEscuadria: string;
  ajustesRealizados: string;
  firmaInspector: string;
  observaciones: string;
}

interface ArmadoPanelProps {
  actividad: Actividad;
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function ArmadoPanel({ actividad, onSave, onClose }: ArmadoPanelProps) {
  const [formData, setFormData] = useState<ArmadoData>({
    areaArmado: '',
    operarios: '',
    liderEquipo: '',
    fechaInicio: '',
    horaInicio: '',
    fechaFin: '',
    horaFin: '',
    cantidadPiezas: '',
    usoPlantillas: 'No',
    verificacionEscuadria: '',
    ajustesRealizados: '',
    firmaInspector: '',
    observaciones: ''
  });

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as ArmadoData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof ArmadoData, value: string) => {
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
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>🔧 Módulo Armado</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#666',
            padding: '0 10px'
          }}>×</button>
        </div>

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

        {/* Contenido scrolleable */}
        <div style={{ padding: '30px', flex: 1, overflow: 'auto' }}>
          <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Área de Armado:</label>
              <input
                type="text"
                value={formData.areaArmado}
                onChange={(e) => handleChange('areaArmado', e.target.value)}
                placeholder="Ej: Mesa 1, Superficie A"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Líder de Equipo:</label>
              <input
                type="text"
                value={formData.liderEquipo}
                onChange={(e) => handleChange('liderEquipo', e.target.value)}
                placeholder="Nombre del líder"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Operarios Asignados:</label>
              <textarea
                value={formData.operarios}
                onChange={(e) => handleChange('operarios', e.target.value)}
                placeholder="Nombres de operarios (uno por línea)"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
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
              <label>Cantidad de piezas ensambladas:</label>
              <input
                type="number"
                value={formData.cantidadPiezas}
                onChange={(e) => handleChange('cantidadPiezas', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Uso de plantillas:</label>
              <select
                value={formData.usoPlantillas}
                onChange={(e) => handleChange('usoPlantillas', e.target.value)}
                style={inputStyle}
              >
                <option value="No">No</option>
                <option value="Plantillas de montaje">Plantillas de montaje</option>
                <option value="Plantillas de soldadura">Plantillas de soldadura</option>
                <option value="Ambas">Ambas</option>
              </select>
            </div>

            <div className="form-group">
              <label>Verificación de escuadría:</label>
              <input
                type="text"
                value={formData.verificacionEscuadria}
                onChange={(e) => handleChange('verificacionEscuadria', e.target.value)}
                placeholder="Mediciones realizadas"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Ajustes realizados:</label>
              <textarea
                value={formData.ajustesRealizados}
                onChange={(e) => handleChange('ajustesRealizados', e.target.value)}
                placeholder="Descripción de ajustes..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Firma de conformidad:</label>
              <input
                type="text"
                value={formData.firmaInspector}
                onChange={(e) => handleChange('firmaInspector', e.target.value)}
                placeholder="Nombre del inspector"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones:</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Notas adicionales..."
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
