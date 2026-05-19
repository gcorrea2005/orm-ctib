import React from 'react';

interface Actividad {
  tipo: string;
  estado: string;
  orden: number;
}

interface TimelineBarProps {
  actividades?: Actividad[];
  compact?: boolean;
  onStageClick?: (actividad: Actividad) => void;
  lightText?: boolean; // Para fondos oscuros
}

const TIPO_ICONS: { [key: string]: string } = {
  'planos_taller': '📐',
  'Planos': '📐',
  'corte_perforacion': '✂️',
  'Corte': '✂️',
  'corte_perforaciones': '✂️',
  'armado': '🔧',
  'Armado': '🔧',
  'soldadura': '🔥',
  'Soldadura': '🔥',
  'sand_blasting': '🌪️',
  'Sandblasting': '🌪️',
  'pintura': '🎨',
  'Pintura': '🎨',
  'montaje': '🏗️',
  'Montaje': '🏗️'
};

const TIPO_LABELS_FULL: { [key: string]: string } = {
  'planos_taller': 'Planos de Taller',
  'Planos': 'Planos',
  'corte_perforacion': 'Corte y Perforación',
  'Corte': 'Corte',
  'corte_perforaciones': 'Corte y Perforaciones',
  'armado': 'Armado',
  'Armado': 'Armado',
  'soldadura': 'Soldadura',
  'Soldadura': 'Soldadura',
  'sand_blasting': 'Sand-blasting',
  'Sandblasting': 'Sand-blasting',
  'pintura': 'Pintura',
  'Pintura': 'Pintura',
  'montaje': 'Montaje',
  'Montaje': 'Montaje'
};

  const TimelineBar: React.FC<TimelineBarProps> = ({ actividades, compact = false, onStageClick, lightText = false }) => {
  if (!actividades || actividades.length === 0) {
    return null;
  }
  const sorted = [...actividades].filter(act => act.tipo !== 'entrega' && act.tipo !== 'bim' && act.tipo !== 'INFO' && act.tipo !== 'limpieza' && act.tipo !== 'almacenamiento' && act.tipo !== 'Almacenamiento').sort((a, b) => a.orden - b.orden);
  const total = sorted.length;
  
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado': return '#10b981'; // green
      case 'en_proceso': return '#3b82f6'; // blue
      default: return '#d1d5db'; // gray
    }
  };

  const calcularProgreso = () => {
    const completados = sorted.filter(a => a.estado === 'completado').length;
    return Math.round((completados / total) * 100);
  };

  const textColor = lightText ? 'lime' : '#666'; // Verde lima brillante para contrastar
  
  return (
    <div style={{ width: '100%',        margin: '6px 0',color: lightText ? textColor : 'inherit' }}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 12px 4px currentColor, 0 0 24px 8px currentColor, 0 3px 12px rgba(0,0,0,0.4);
            filter: brightness(1);
          }
          50% { 
            box-shadow: 0 0 24px 12px currentColor, 0 0 48px 16px currentColor, 0 3px 16px rgba(0,0,0,0.5);
            filter: brightness(1.3);
          }
        }
        @keyframes progress-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes dock-reflection {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
      
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '2px 0 1px 0',
        minHeight: '26px'
      }}>
        {/* Dock base con efecto glassmorphism - optimizado para modo oscuro */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '3%',
          right: '3%',
          height: '24px',
          transform: 'translateY(-50%)',
          borderRadius: '12px',
          background: 'rgba(30, 30, 30, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          zIndex: 0
        }}>
          {/* Reflexión superior del dock (simula luz) */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '5%',
            right: '5%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            borderRadius: '1px',
            animation: 'dock-reflection 3s ease-in-out infinite'
          }} />
          
          {/* Barra de progreso incrustada en el dock */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            width: `${calcularProgreso() * 0.9}%`,
            height: '6px',
            background: 'linear-gradient(90deg, #059669 0%, #10b981 25%, #3b82f6 50%, #10b981 75%, #059669 100%)',
            backgroundSize: '200% 100%',
            transform: 'translateY(-50%)',
            borderRadius: '4px',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.6), inset 0 1px 2px rgba(255,255,255,0.3)',
            animation: calcularProgreso() > 0 ? 'progress-flow 3s linear infinite' : 'none'
          }} />
        </div>

        {sorted.map((act) => {
          const isEnProceso = act.estado === 'en_proceso';
          const isCompletado = act.estado === 'completado';
          const nodeColor = getStatusColor(act.estado);
          
          return (
            <div
              key={act.tipo}
              title={TIPO_LABELS_FULL[act.tipo] || act.tipo}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                position: 'relative'
              }}
            >
              <div 
                onClick={() => onStageClick?.(act)}
                title={TIPO_LABELS_FULL[act.tipo] || act.tipo}
                style={{
                  width: compact ? '28px' : '40px',
                  height: compact ? '28px' : '40px',
                  borderRadius: '10px',
                  backgroundColor: nodeColor,
                  border: isCompletado ? '2px solid rgba(255,255,255,0.9)' : '1.5px solid rgba(255,255,255,0.6)',
                  boxShadow: isEnProceso 
                    ? `0 0 20px 6px ${nodeColor}, 0 4px 12px rgba(0,0,0,0.4)` 
                    : isCompletado
                    ? `0 0 14px 4px ${nodeColor}, 0 4px 10px rgba(0,0,0,0.3)`
                    : '0 4px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: compact ? '14px' : '20px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: onStageClick ? 'pointer' : 'default',
                  animation: isEnProceso ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                  transform: isEnProceso ? 'scale(1.15) translateY(-8px)' : 'scale(1) translateY(0)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (onStageClick) {
                    e.currentTarget.style.transform = 'scale(1.4) translateY(-12px)';
                    e.currentTarget.style.filter = 'brightness(1.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onStageClick) {
                    e.currentTarget.style.transform = isEnProceso ? 'scale(1.15) translateY(-8px)' : 'scale(1) translateY(0)';
                    e.currentTarget.style.filter = isEnProceso ? 'brightness(1.3)' : 'brightness(1)';
                  }
                }}
              >
                {TIPO_ICONS[act.tipo] || '●'}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        display: lightText ? 'none' : 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '2px',
        fontSize: compact ? '0.75em' : '0.85em'
      }}>
        <span style={{ color: textColor }}>
          Progreso: <strong style={{ color: textColor }}>{calcularProgreso()}%</strong>
        </span>
        <span style={{ color: textColor }}>
          {sorted.filter(a => a.estado === 'completado').length}/{total} etapas
        </span>
      </div>
    </div>
  );
};

export default TimelineBar;
