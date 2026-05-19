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

interface MontajeData {
  ubicacionMontaje: string;
  metodoMontaje: string;
  maquinariaRequerida: string;
  equipoInstalacion: string;
  medidasSeguridad: string;
  fechaInicioMontaje: string;
  fechaFinMontaje: string;
  verificacionAlineacion: string;
  aprietePernos: string;
  inspeccion: string;
  fotosEstructuraMontada: string;
}

interface MontajePanelProps {
  actividad: Actividad;
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function MontajePanel({ actividad, onSave, onClose }: MontajePanelProps) {
  const [formData, setFormData] = useState<MontajeData>({
    ubicacionMontaje: '',
    metodoMontaje: '',
    maquinariaRequerida: '',
    equipoInstalacion: '',
    medidasSeguridad: '',
    fechaInicioMontaje: '',
    fechaFinMontaje: '',
    verificacionAlineacion: '',
    aprietePernos: '',
    inspeccion: '',
    fotosEstructuraMontada: ''
  });

  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as MontajeData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof MontajeData, value: string) => {
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
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>🏗️ Módulo Montaje</h2>
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
              <label>Ubicación de Montaje (Edificio, Piso, Área):</label>
              <input
                type="text"
                value={formData.ubicacionMontaje}
                onChange={(e) => handleChange('ubicacionMontaje', e.target.value)}
                placeholder="Ej: Edificio A, Piso 3, Área de Producción..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Método de Montaje:</label>
              <select
                value={formData.metodoMontaje}
                onChange={(e) => handleChange('metodoMontaje', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Pernos de anclaje">Pernos de anclaje</option>
                <option value="Soldadura a estructura existente">Soldadura a estructura existente</option>
                <option value="Mixto (pernos y soldadura)">Mixto (pernos y soldadura)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Maquinaria Requerida:</label>
              <input
                type="text"
                value={formData.maquinariaRequerida}
                onChange={(e) => handleChange('maquinariaRequerida', e.target.value)}
                placeholder="Ej: Grúa torre, montacargas..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Equipo de Instalación:</label>
              <input
                type="text"
                value={formData.equipoInstalacion}
                onChange={(e) => handleChange('equipoInstalacion', e.target.value)}
                placeholder="Supervisor, soldadores, ayudantes..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Medidas de Seguridad:</label>
              <textarea
                value={formData.medidasSeguridad}
                onChange={(e) => handleChange('medidasSeguridad', e.target.value)}
                placeholder="Protección contra caídas, señalización..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Fecha de Inicio de Montaje:</label>
              <input
                type="date"
                value={formData.fechaInicioMontaje}
                onChange={(e) => handleChange('fechaInicioMontaje', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Fecha de Fin de Montaje:</label>
              <input
                type="date"
                value={formData.fechaFinMontaje}
                onChange={(e) => handleChange('fechaFinMontaje', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Verificación de Alineación (Plomada, Nivel):</label>
              <select
                value={formData.verificacionAlineacion}
                onChange={(e) => handleChange('verificacionAlineacion', e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Apriete de Pernos (Torque):</label>
              <input
                type="text"
                value={formData.aprietePernos}
                onChange={(e) => handleChange('aprietePernos', e.target.value)}
                placeholder="Ej: 100 ft-lb, 150 Nm..."
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Inspección (Checklist):</label>
              <textarea
                value={formData.inspeccion}
                onChange={(e) => handleChange('inspeccion', e.target.value)}
                placeholder="Elementos verificados, firmas..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Fotos de Estructura Montada (URLs):</label>
              <textarea
                value={formData.fotosEstructuraMontada}
                onChange={(e) => handleChange('fotosEstructuraMontada', e.target.value)}
                placeholder="URLs de fotos, una por línea..."
                rows={2}
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
        </div>{/* Cierra contenido scrolleable (linea 130) */}
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
