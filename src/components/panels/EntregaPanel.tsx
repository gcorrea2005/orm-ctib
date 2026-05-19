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
  datos: string | null;
}

interface EntregaData {
  cliente: string;
  proyecto: string;
  direccionEntrega: string;
  fechaProgramada: string;
  fechaReal: string;
  responsableEntrega: string;
  transportista: string;
  placaVehiculo: string;
  conductor: string;
  documentosDespacho: string;
  fotosCargue: string;
  observacionesEntrega: string;
}

interface EntregaPanelProps {
  actividad: Actividad;
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function EntregaPanel({ actividad, onSave, onClose }: EntregaPanelProps) {
  const [formData, setFormData] = useState<EntregaData>({
    cliente: '',
    proyecto: '',
    direccionEntrega: '',
    fechaProgramada: '',
    fechaReal: '',
    responsableEntrega: '',
    transportista: '',
    placaVehiculo: '',
    conductor: '',
    documentosDespacho: '',
    fotosCargue: '',
    observacionesEntrega: ''
  });

  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as EntregaData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof EntregaData, value: string) => {
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
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>📦 Módulo Entrega (FINAL)</h2>
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
              <label>Cliente:</label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => handleChange('cliente', e.target.value)}
                placeholder="Nombre del cliente..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Proyecto:</label>
              <input
                type="text"
                value={formData.proyecto}
                onChange={(e) => handleChange('proyecto', e.target.value)}
                placeholder="Nombre del proyecto..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Dirección de Entrega:</label>
              <textarea
                value={formData.direccionEntrega}
                onChange={(e) => handleChange('direccionEntrega', e.target.value)}
                placeholder="Dirección completa..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Fecha Programada:</label>
              <input
                type="date"
                value={formData.fechaProgramada}
                onChange={(e) => handleChange('fechaProgramada', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Fecha Real:</label>
              <input
                type="date"
                value={formData.fechaReal}
                onChange={(e) => handleChange('fechaReal', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Responsable de Entrega:</label>
              <input
                type="text"
                value={formData.responsableEntrega}
                onChange={(e) => handleChange('responsableEntrega', e.target.value)}
                placeholder="Nombre del responsable..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Transportista:</label>
              <input
                type="text"
                value={formData.transportista}
                onChange={(e) => handleChange('transportista', e.target.value)}
                placeholder="Empresa transportadora..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Placa del Vehículo:</label>
              <input
                type="text"
                value={formData.placaVehiculo}
                onChange={(e) => handleChange('placaVehiculo', e.target.value)}
                placeholder="Ej: ABC123..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Conductor:</label>
              <input
                type="text"
                value={formData.conductor}
                onChange={(e) => handleChange('conductor', e.target.value)}
                placeholder="Nombre del conductor..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Documentos de Despacho (URL):</label>
              <input
                type="url"
                value={formData.documentosDespacho}
                onChange={(e) => handleChange('documentosDespacho', e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Fotos del Cargue (URLs):</label>
              <textarea
                value={formData.fotosCargue}
                onChange={(e) => handleChange('fotosCargue', e.target.value)}
                placeholder="URLs de fotos, una por línea..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones de Entrega:</label>
              <textarea
                value={formData.observacionesEntrega}
                onChange={(e) => handleChange('observacionesEntrega', e.target.value)}
                placeholder="Observaciones finales..."
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

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.9em',
  marginTop: '5px',
  boxSizing: 'border-box'
};

const buttonPrimaryStyle = {
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9em',
  fontWeight: 'bold'
};

const buttonSecondaryStyle = {
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9em'
};

const buttonSuccessStyle = {
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9em',
  fontWeight: 'bold'
};
