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

interface PlanosTallerData {
  numeroPlano: string;
  version: string;
  fechaElaboracion: string;
  responsable: string;
  listaMateriales: string;
  espesores: string;
  cortes: string;
  taladros: string;
  urlPDF: string;
  estadoAprobacion: string;
  observacionesDiseno: string;
}

interface PlanosTallerPanelProps {
  actividad: Actividad;
  elemento: { // Información del elemento
    id: number;
    parte: string;
    perfil: string;
    longitud: number;
    cantidad: number;
    peso: number;
    pesoTotal: number;
  };
  onSave: (actividadId: number, datos: string, estado?: string) => void;
  onClose: () => void;
}

export default function PlanosTallerPanel({ actividad, elemento, onSave, onClose }: PlanosTallerPanelProps) {
  const [formData, setFormData] = useState<PlanosTallerData>({
    numeroPlano: '',
    version: '1.0',
    fechaElaboracion: '',
    responsable: '',
    listaMateriales: '',
    espesores: '',
    cortes: '',
    taladros: '',
    urlPDF: '',
    estadoAprobacion: 'Borrador',
    observacionesDiseno: ''
  });

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (actividad.datos) {
      try {
        const parsed = JSON.parse(actividad.datos) as PlanosTallerData;
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing datos JSON:', e);
      }
    }
  }, [actividad.datos]);

  const handleChange = (field: keyof PlanosTallerData, value: string) => {
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
      justifyContent: 'flex-end' // Alineado a la derecha
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '85%', // Más ancho para planos
        maxWidth: '1200px', // Máximo generoso
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
          <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.5em' }}>📐 Gestión de Planos de Taller</h2>
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

        {/* Información del Elemento */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px 30px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a', fontSize: '1.2em' }}>📋 Información del Elemento</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', fontSize: '0.95em' }}>
            <div><strong>Parte:</strong> {elemento.parte}</div>
            <div><strong>Perfil:</strong> {elemento.perfil}</div>
            <div><strong>Longitud:</strong> {elemento.longitud} mm</div>
            <div><strong>Cantidad:</strong> {elemento.cantidad}</div>
            <div><strong>Peso Unitario:</strong> {elemento.peso.toFixed(2)} kg</div>
            <div><strong>Peso Total:</strong> <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{elemento.pesoTotal.toFixed(2)} kg</span></div>
          </div>
        </div>
        
        {/* Contenido scrolleable */}
        <div style={{ padding: '30px', flex: 1, overflow: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Número de Plano:</label>
              <input
                type="text"
                value={formData.numeroPlano}
                onChange={(e) => handleChange('numeroPlano', e.target.value)}
                placeholder="Ej: PL-2024-001"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Versión:</label>
              <select
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                style={inputStyle}
              >
                <option value="1.0">1.0</option>
                <option value="1.1">1.1</option>
                <option value="2.0">2.0</option>
                <option value="2.1">2.1</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de Elaboración:</label>
              <input
                type="date"
                value={formData.fechaElaboracion}
                onChange={(e) => handleChange('fechaElaboracion', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Responsable (Ingeniero):</label>
              <input
                type="text"
                value={formData.responsable}
                onChange={(e) => handleChange('responsable', e.target.value)}
                placeholder="Nombre del ingeniero"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Lista de Materiales:</label>
              <textarea
                value={formData.listaMateriales}
                onChange={(e) => handleChange('listaMateriales', e.target.value)}
                placeholder="Perfiles, grados de acero..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Espesores:</label>
              <input
                type="text"
                value={formData.espesores}
                onChange={(e) => handleChange('espesores', e.target.value)}
                placeholder="Ej: 6mm, 10mm, 12mm"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Cortes:</label>
              <input
                type="text"
                value={formData.cortes}
                onChange={(e) => handleChange('cortes', e.target.value)}
                placeholder="Tipos de cortes"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Taladros:</label>
              <input
                type="text"
                value={formData.taladros}
                onChange={(e) => handleChange('taladros', e.target.value)}
                placeholder="Diámetros, ubicación"
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>PDF del Plano (URL):</label>
              <input
                type="url"
                value={formData.urlPDF}
                onChange={(e) => handleChange('urlPDF', e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label>Estado de Aprobación:</label>
              <select
                value={formData.estadoAprobacion}
                onChange={(e) => handleChange('estadoAprobacion', e.target.value)}
                style={inputStyle}
              >
                <option value="Borrador">Borrador</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones del Diseño:</label>
              <textarea
                value={formData.observacionesDiseno}
                onChange={(e) => handleChange('observacionesDiseno', e.target.value)}
                placeholder="Notas sobre el diseño..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '30px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '25px'
          }}>
            <button type="button" onClick={onClose} style={buttonSecondaryStyle}>
              Cerrar
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
