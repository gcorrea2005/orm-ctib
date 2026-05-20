import { useState, useEffect, useMemo } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import TimelineBar from '../TimelineBar'
import { type Actividad } from '../../context/TallerContext'

interface MetalElement {
  id: number
  parte: string
  perfil: string
  longitud: number
  cantidad: number
  peso: number
  observaciones: string | null
  actividades?: Actividad[]
}

interface Grupo {
  id: number
  nombre: string
  descripcion?: string | null
  activoInformes?: boolean
  elementos: MetalElement[]
}

type TipoInforme = 'resumen' | 'detallado' | 'por-grupo'

export default function InformeTallerPanel() {
  const { user } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoInforme, setTipoInforme] = useState<TipoInforme>('resumen')
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | 'todos'>('todos')

  useEffect(() => {
    loadGrupos()
  }, [])

  const loadGrupos = async () => {
    try {
      const data = await api.getGrupoes()
      setGrupos(data)
    } catch (error) {
      console.error('Error loading grupos:', error)
    } finally {
      setLoading(false)
    }
  }

  const gruposFiltrados = (grupoSeleccionado === 'todos' 
    ? grupos 
    : grupos.filter(g => g.id === grupoSeleccionado)
  ).filter(g => g.activoInformes !== false && g.activoInformes !== 0)

  const totalElementos = gruposFiltrados.reduce((sum, g) => sum + g.elementos.length, 0)
  const totalPiezas = gruposFiltrados.reduce((sum, g) => 
    sum + g.elementos.reduce((s, el) => s + el.cantidad, 0), 0
  )

  // Espesores conocidos (del formato con asterisco en la DB)
  const KNOWN_ESPESORES = ['127','100','76','64','50','38','32','25','20','19','16','13','12','10','7.5','6.6','6.2','6','5','4'];

  // Función para agrupar platinas por espesor (PL100, PL127, PL6, etc.)
  const getPerfilKey = (perfil: string): string => {
    if (!perfil.startsWith('PL')) return perfil;

    // Formato con asterisco: PL127*1400 → PL127, PL6.2*75 → PL6.2
    const withStar = perfil.match(/^PL([\d.]+)\*/);
    if (withStar) return 'PL' + withStar[1];

    // Formato sin asterisco: PL1271400, PL1001000, PL642500, PL16400, PL6250
    const digits = perfil.slice(2);
    if (/^\d+$/.test(digits)) {
      // Probar espesores conocidos (más largo primero) — resuelve ambigüedad
      for (const esp of KNOWN_ESPESORES) {
        if (digits.startsWith(esp) && digits.length > esp.length) return 'PL' + esp;
      }
      // Fallback: si no está en la lista, asumir 2 dígitos de espesor
      if (digits.length >= 4) return 'PL' + digits.slice(0, 2);
    }

    // Fallback
    const anyMatch = perfil.match(/^PL([\d.]+)/);
    return anyMatch ? 'PL' + anyMatch[1] : perfil;
  };

  // Procesar datos por perfil para el informe resumen
  const perfilData = useMemo(() => {
    const map = new Map();
    
    gruposFiltrados.forEach(g => {
      g.elementos.forEach(el => {
        const key = getPerfilKey(el.perfil);
        if (!map.has(key)) {
          map.set(key, { perfil: key, elementos: 0, piezas: 0, pesoTotal: 0 });
        }
        const entry = map.get(key);
        entry.elementos++;
        entry.piezas += el.cantidad;
        entry.pesoTotal += (el.peso * el.cantidad);
      });
    });
    
    return Array.from(map.values()).sort((a, b) => b.pesoTotal - a.pesoTotal);
  }, [gruposFiltrados]);

  const pesoTotalGrupos = perfilData.reduce((sum, p) => sum + p.pesoTotal, 0);

  // Procesar datos por grupo para el resumen general
  const grupoData = useMemo(() => {
    return gruposFiltrados
      .filter(g => g.elementos.length > 0)
      .map(g => {
        const piezas = g.elementos.reduce((s, el) => s + el.cantidad, 0);
        const pesoTotal = g.elementos.reduce((s, el) => s + (el.peso * el.cantidad), 0);
        return { grupo: g.nombre, elementos: g.elementos.length, piezas, pesoTotal };
      })
      .sort((a, b) => b.pesoTotal - a.pesoTotal);
  }, [gruposFiltrados]);


  // Función auxiliar para crear tablas markdown alineadas
  // alignments: 'left' | 'right' | 'center' por columna (opcional, default left)
  const crearTablaMarkdown = (headers: string[], rows: string[][], alignments?: ('left' | 'right' | 'center')[]) => {
    // Calcular ancho máximo de cada columna
    const colWidths = headers.map((h, i) => {
      const maxDataWidth = Math.max(...rows.map(row => (row[i] || '').toString().length))
      return Math.max(h.length, maxDataWidth, 3) // mínimo 3 para los separadores
    })

    // Crear fila de separación con alineación
    const separatorParts = colWidths.map((w, i) => {
      const align = alignments?.[i] || 'left'
      switch (align) {
        case 'right':
          return '-'.repeat(w - 1) + ':'  // ancho w: (w-1) guiones + 1 dos puntos
        case 'center':
          return ':' + '-'.repeat(w - 2) + ':'  // ancho w: 1 dos puntos + (w-2) guiones + 1 dos puntos
        case 'left':
        default:
          return ':' + '-'.repeat(w - 1)  // ancho w: 1 dos puntos + (w-1) guiones
      }
    })
    const separator = '| ' + separatorParts.join(' | ') + ' |'
    
    // Crear fila de headers
    const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |'
    
    // Crear filas de datos
    const dataRows = rows.map(row => 
      '| ' + row.map((cell, i) => (cell || '').toString().padEnd(colWidths[i])).join(' | ') + ' |'
    ).join('\n')

    return `${headerRow}\n${separator}\n${dataRows}`
  }

  // Generar gráfico ASCII de pesos por perfil
  const generarGraficoASCII = (anchoMax = 50) => {
    if (!perfilData || perfilData.length === 0) return '';
    
    const maxPeso = Math.max(...perfilData.map(p => p.pesoTotal));
    let resultado = '';
    
    perfilData.forEach(p => {
      const barraLen = maxPeso > 0 ? Math.round((p.pesoTotal / maxPeso) * anchoMax) : 0;
      const barra = '█'.repeat(barraLen);
      const porcentaje = pesoTotalGrupos > 0 ? ((p.pesoTotal / pesoTotalGrupos) * 100) : 0;
      resultado += `${p.perfil.padEnd(20)} |${barra.padEnd(anchoMax)}| ${p.pesoTotal.toFixed(1).padStart(10)} kg (${porcentaje.toFixed(1).padStart(5)}%)\n`;
    });
    
    return resultado;
  };

  // Generar gráfico ASCII de pesos por grupo
  const generarGraficoASCIIGrupos = (anchoMax = 50) => {
    if (!grupoData || grupoData.length === 0) return '';
    
    const maxPeso = Math.max(...grupoData.map(g => g.pesoTotal));
    let resultado = '';
    
    grupoData.forEach(g => {
      const barraLen = maxPeso > 0 ? Math.round((g.pesoTotal / maxPeso) * anchoMax) : 0;
      const barra = '█'.repeat(barraLen);
      const porcentaje = pesoTotalGrupos > 0 ? ((g.pesoTotal / pesoTotalGrupos) * 100) : 0;
      resultado += `${g.grupo.padEnd(20)} |${barra.padEnd(anchoMax)}| ${g.pesoTotal.toFixed(1).padStart(10)} kg (${porcentaje.toFixed(1).padStart(5)}%)\n`;
    });
    
    return resultado;
  };

  const generarMarkdown = () => {
    const titulo = 'INFORME DE TALLER'
    const fecha = new Date().toLocaleDateString('es-CO', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })
    const hora = new Date().toLocaleTimeString('es-CO')

    let contenido = ''

    if (tipoInforme === 'resumen') {
      // Tabla de métricas
      const metricasHeaders = ['Métrica', 'Valor']
      const metricasRows = [
        ['Grupos con elementos', gruposFiltrados.filter(g => g.elementos.length > 0).length.toString()],
        ['Total elementos', totalElementos.toString()],
        ['Total piezas', totalPiezas.toString()]
      ]
      // Alineación: Métrica izquierda, Valor derecha
      const metricasTable = crearTablaMarkdown(metricasHeaders, metricasRows, ['left', 'right'])

      // Tabla de grupos
      const gruposHeaders = ['Grupo', 'Descripción', 'Elementos', 'Piezas', 'Peso Total (kg)']
      const gruposRows = gruposFiltrados
        .filter(g => g.elementos.length > 0)
        .map(g => {
          const piezas = g.elementos.reduce((s, el) => s + el.cantidad, 0)
          const pesoTotal = g.elementos.reduce((s, el) => s + (el.peso * el.cantidad), 0)
          return [g.nombre, g.descripcion || '-', g.elementos.length.toString(), piezas.toString(), pesoTotal.toFixed(1)]
        })
      // Alineación: Grupo izquierda, Descripción izquierda, Elementos derecha, Piezas derecha, Peso derecha
      const gruposTable = crearTablaMarkdown(gruposHeaders, gruposRows, ['left', 'left', 'right', 'right', 'right'])

      // Tabla de pesos por perfil
      const perfilHeaders = ['Perfil', 'Elementos', 'Piezas', 'Peso Total (kg)', '%']
      const perfilRows = perfilData.map(p => [
        p.perfil,
        p.elementos.toString(),
        p.piezas.toString(),
        p.pesoTotal.toFixed(1),
        pesoTotalGrupos > 0 ? ((p.pesoTotal / pesoTotalGrupos) * 100).toFixed(1) + '%' : '0.0%'
      ])
      const perfilTable = crearTablaMarkdown(perfilHeaders, perfilRows, ['left', 'right', 'right', 'right', 'right'])

      // Gráfico ASCII
      const graficoASCII = generarGraficoASCII()

      // Ficha de Peso Total (destacada)
      const pesoTotalFicha = `
> ### 🏷️ **PESO TOTAL DEL GRUPO**
> 
> |  |  |
> |---|---|
> | **Peso en Kilogramos** | **${pesoTotalGrupos.toLocaleString('es-CO', {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg** |
> | **Peso en Toneladas** | **${(pesoTotalGrupos / 1000).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})} tons** |
> 
> *Suma total de todos los elementos (peso × cantidad)*
      `.trim()

      contenido = `
## Resumen General

${metricasTable}

${pesoTotalFicha}

### Grupos con Datos

${gruposTable}

### Pesos por Grupo

| Grupo | Elementos | Piezas | Peso Total (kg) | % |
|---|---|---|---|---|
${grupoData.map(g => `| ${g.grupo} | ${g.elementos} | ${g.piezas} | ${g.pesoTotal.toFixed(1)} | ${pesoTotalGrupos > 0 ? ((g.pesoTotal / pesoTotalGrupos) * 100).toFixed(1) + '%' : '0.0%'} |`).join('\n')}

### Gráfico ASCII (Pesos por Grupo)

\`\`\`
${generarGraficoASCIIGrupos()}
\`\`\`

### Pesos por Perfil

${perfilTable}

### Gráfico ASCII

\`\`\`
${graficoASCII}
\`\`\`
`
    } else if (tipoInforme === 'detallado') {
      const gruposMarkdown = gruposFiltrados
        .filter(g => g.elementos.length > 0)
        .map(g => {
          const piezas = g.elementos.reduce((s, el) => s + el.cantidad, 0)
          
          // Tabla de elementos del grupo
          const elementosHeaders = ['Parte', 'Perfil', 'Longitud (mm)', 'Cantidad', 'Peso Unit (kg)', 'Peso Total (kg)']
          const elementosRows = g.elementos.map(el => {
            return [el.parte, el.perfil, el.longitud.toString(), el.cantidad.toString(), el.peso.toFixed(2), (el.peso * el.cantidad).toFixed(2)]
          })
          // Alineación: todas izquierda excepto numeros a derecha
          const elementosTable = crearTablaMarkdown(elementosHeaders, elementosRows, ['left', 'left', 'right', 'right', 'right', 'right'])

          return `### ${g.nombre}${g.descripcion ? ' (' + g.descripcion + ')' : ''}

**Elementos:** ${g.elementos.length}  
**Piezas:** ${piezas}

${elementosTable}`
        }).join('\n\n---\n\n')

      contenido = `
## Informe Detallado de Taller

> ### 🏷️ **PESO TOTAL**
> |  |  |
> |---|---|
> | **Peso en Kilogramos** | **${pesoTotalGrupos.toLocaleString('es-CO', {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg** |
> | **Peso en Toneladas** | **${(pesoTotalGrupos / 1000).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})} tons** |
> *Suma total de todos los elementos (peso × cantidad)*

${gruposMarkdown}
`
    } else {
      const gruposMarkdown = gruposFiltrados
        .filter(g => g.elementos.length > 0)
        .map(g => {
          const piezas = g.elementos.reduce((s, el) => s + el.cantidad, 0)
          const elementosConActividad = g.elementos.filter(el => el.actividades && el.actividades.length > 0).length
          
          // Tabla de elementos
          const elementosHeaders = ['ID', 'Parte', 'Perfil', 'Cant.', 'Timeline']
          const elementosRows = g.elementos.map(el => {
            const actividadesStr = el.actividades 
              ? el.actividades.filter((a: any) => a.estado === 'Completado').length + '/10' 
              : 'N/A'
            return [el.id.toString(), el.parte, el.perfil, el.cantidad.toString(), actividadesStr]
          })
          // Alineación: ID derecha, Parte izquierda, Perfil izquierda, Cant. derecha, Timeline izquierda
          const elementosTable = crearTablaMarkdown(elementosHeaders, elementosRows, ['right', 'left', 'left', 'right', 'left'])

          return `### ${g.nombre}${g.descripcion ? ' - ' + g.descripcion : ''}

**Elementos:** ${g.elementos.length}  
**Elementos con actividades:** ${elementosConActividad}  
**Piezas:** ${piezas}

${elementosTable}`
        }).join('\n\n---\n\n')

      contenido = `
## Resumen por Grupo

${gruposMarkdown}
`
    }

    const markdown = `# ${titulo}

**Fecha:** ${fecha}  
**Hora:** ${hora}  
**Generado por:** ${user?.name || 'Usuario'}  

---

${contenido}

---

_⬡ CTIB - Bogotá | Sistema de Gestión BIM | v1.0 | ✨ AI Powered_`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe-taller-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generarPDF = () => {
    window.print()
  }

  if (loading) {
    return <div className="loading">Cargando informe...</div>
  }

  return (
    <div className="informe-panel">
      {/* Estilos para impresión y consistencia con otros informes */}
      <style>{`
        @media print {
          .informe-controls, .btn-primary, select, button {
            display: none !important;
          }
          .informe-panel {
            box-shadow: none !important;
            padding: 10px !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * {
            filter: grayscale(100%) !important;
          }
          .timeline-compacto {
            max-width: 180px;
            transform: scale(0.75);
            transform-origin: left top;
          }
        }
        .timeline-compacto {
          margin: 8px 0;
          max-width: 200px;
        }
        .elemento-timeline {
          margin-top: 6px;
          max-width: 180px;
        }
        /* Alinear con otros informes - Tablas */
        .informe-table {
          border-collapse: collapse;
          width:100%;
          margin: 16px 0;
          font-size: 0.85em;
          table-layout: fixed;
        }
        .informe-table th, .informe-table td {
          padding: 6px 4px;
          border:1px solid #ddd;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .informe-table th {
          background-color: #f5f5f5;
          font-weight: 600;
          text-align: center;
          border-bottom: 2px solid #ccc;
          white-space: normal;
          font-size: 0.9em;
        }
        /* Columnas de datos muy compactas */
        .col-id, .col-cant {
          width: 50px;
          max-width: 50px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .col-parte, .col-perfil {
          width: 70px;
          max-width: 70px;
        }
        .col-longitud {
          width: 60px;
          max-width: 60px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .col-grupo, .col-desc {
          width: 80px;
          max-width: 80px;
        }
        /* Columna Timeline - ocupa TODO el espacio restante */
        .col-timeline {
          width: auto;
          min-width: 300px;
          white-space: normal;
          padding-left: 5px;
          padding-right: 5px;
        }
        .col-peso {
          width: 110px;
          text-align: right;
          white-space: nowrap;
        }
        .informe-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .informe-table tr:hover {
          background-color: #f1f1f1;
        }
        .informe-section {
          overflow-x: auto;
          max-width:100%;
        }
        /* Timeline visible y legible */
        .timeline-compacto, .elemento-timeline {
          margin: 4px 0;
          max-width: 100%;
          height: 50px;
          overflow: visible;
          display: flex;
          align-items: center;
        }
        .timeline-compacto > div, .elemento-timeline > div {
          width: 100%;
          height: auto;
          flex-shrink: 0;
          transform: none;
        }

        /* Estilos de impresión: ocultar controles, header fecha */
        @media print {
          .informe-controls, .informe-stats, .informe-header-date { display: none !important; }
          .informe-header { 
            border-bottom: 2px solid #000 !important;
            margin-bottom: 20px !important;
            padding-bottom: 10px !important;
          }
          .informe-footer { position: fixed; bottom: 0; width: 100%; }
          .informe-table { border-collapse: collapse; width: 100%; }
          .informe-table th, .informe-table td { border: 1px solid #000; padding: 6px; font-size: 10pt; }
          button, select, .informe-select { display: none !important; }
          .informe-section { overflow: visible !important; max-width: none !important; }
          .informe-preview { overflow: visible !important; }
          .timeline-compacto, .elemento-timeline { height: auto !important; }
          @page { margin: 15mm; }
        }
      `}</style>

      <div className="informe-header">
        <div className="informe-header-logo">⬡</div>
        <div className="informe-header-text">
          <span className="informe-header-title">CTIB - Sistema de Gestión BIM</span>
          <span className="informe-header-subtitle">Informe de Taller</span>
        </div>
        <div className="informe-header-date">
          {new Date().toLocaleDateString('es-CO')}
        </div>
      </div>

      <div className="informe-controls">
        <div className="informe-options">
          <select 
            className="informe-select"
            value={grupoSeleccionado}
            onChange={(e) => setGrupoSeleccionado(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
          >
            <option value="todos">🏗️ Todos los Grupos</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>
                {g.nombre} {g.descripcion ? `- ${g.descripcion}` : ''} {g.activoInformes === false ? '(Inactivo)' : ''}
              </option>
            ))}
          </select>
          <select 
            className="informe-select"
            value={tipoInforme}
            onChange={(e) => setTipoInforme(e.target.value as TipoInforme)}
          >
            <option value="resumen">📊 Resumen</option>
            <option value="detallado">📋 Detallado</option>
            <option value="por-grupo">📁 Por Grupo</option>
          </select>
          <button className="btn-primary" onClick={generarMarkdown}>
            📥 Descargar (.md)
          </button>
          <button className="btn-secondary" onClick={generarPDF} style={{marginLeft: '8px'}}>
            🖨️ Guardar PDF
          </button>
        </div>
      </div>

      <div className="informe-stats">
        <div className="informe-stat">
          <span className="informe-stat-value">{gruposFiltrados.filter(g => g.elementos.length > 0).length}</span>
          <span className="informe-stat-label">Grupos Activos</span>
        </div>
        <div className="informe-stat">
          <span className="informe-stat-value">{totalElementos}</span>
          <span className="informe-stat-label">Elementos</span>
        </div>
        <div className="informe-stat">
          <span className="informe-stat-value">{totalPiezas}</span>
          <span className="informe-stat-label">Piezas</span>
        </div>
      </div>

      <div className="informe-preview">
      {tipoInforme === 'resumen' && (
        <div className="informe-section">
          <h3>📊 Resumen General</h3>
          
          {/* Ficha de Peso Total */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '1.8em', fontWeight: 'bold', marginBottom: '2px'}}>
                ⚖️
              </div>
              <div style={{fontSize: '0.8em', opacity: 0.9}}>PESO TOTAL</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '1.5em', fontWeight: 'bold'}}>
                {pesoTotalGrupos.toLocaleString('es-CO', {minimumFractionDigits: 1, maximumFractionDigits: 1})}
              </div>
              <div style={{fontSize: '0.8em', opacity: 0.9}}>Kilogramos (kg)</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '1.5em', fontWeight: 'bold'}}>
                {(pesoTotalGrupos / 1000).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div style={{fontSize: '0.8em', opacity: 0.9}}>Toneladas (tons)</div>
            </div>
          </div>

            <table className="elementos-table informe-table">
              <thead>
                <tr>
                  <th className="col-grupo" style={{width: '12%'}}>Grupo</th>
                  <th className="col-desc" style={{width: '38%'}}>Descripción</th>
                  <th className="col-cant" style={{width: '15%', textAlign: 'right'}}>Elementos</th>
                  <th className="col-cant" style={{width: '15%', textAlign: 'right'}}>Piezas</th>
                  <th className="col-peso" style={{width: '20%', textAlign: 'right'}}>Peso Total (kg)</th>
                </tr>
              </thead>
              <tbody>
                {gruposFiltrados.filter(g => g.elementos.length > 0).map(grupo => {
                  const piezas = grupo.elementos.reduce((s, el) => s + el.cantidad, 0)
                  const pesoTotal = grupo.elementos.reduce((s, el) => s + (el.peso * el.cantidad), 0)
                  return (
                    <tr key={grupo.id}>
                      <td className="col-grupo">
                        <strong>{grupo.nombre}</strong>
                      </td>
                      <td className="col-desc">{grupo.descripcion || '-'}</td>
                      <td className="col-cant" style={{textAlign: 'right'}}>{grupo.elementos.length}</td>
                      <td className="col-cant" style={{textAlign: 'right'}}>{piezas}</td>
                      <td className="col-peso" style={{textAlign: 'right', fontWeight: 'bold', color: '#6366f1'}}>{pesoTotal.toFixed(1)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <h3>📊 Pesos por Grupo</h3>
            <table className="elementos-table informe-table">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Elementos</th>
                  <th>Piezas</th>
                  <th>Peso Total (kg)</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {grupoData.map(g => (
                  <tr key={g.grupo}>
                    <td><strong>{g.grupo}</strong></td>
                    <td style={{textAlign: 'right'}}>{g.elementos}</td>
                    <td style={{textAlign: 'right'}}>{g.piezas}</td>
                    <td style={{textAlign: 'right', fontWeight: 'bold', color: '#6366f1'}}>{g.pesoTotal.toFixed(1)}</td>
                    <td style={{textAlign: 'right'}}>{pesoTotalGrupos > 0 ? ((g.pesoTotal / pesoTotalGrupos) * 100).toFixed(1) : '0.0'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>📊 Gráfico ASCII (Pesos por Grupo)</h3>
            <pre style={{fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.2', background: '#f5f5f5', padding: '10px', borderRadius: '4px'}}>
              {generarGraficoASCIIGrupos()}
            </pre>

            <h3>📊 Pesos por Perfil</h3>
            <table className="elementos-table informe-table">
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Elementos</th>
                  <th>Piezas</th>
                  <th>Peso Total (kg)</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {perfilData.map(p => (
                  <tr key={p.perfil}>
                    <td>{p.perfil}</td>
                    <td style={{textAlign: 'right'}}>{p.elementos}</td>
                    <td style={{textAlign: 'right'}}>{p.piezas}</td>
                    <td style={{textAlign: 'right'}}>{p.pesoTotal.toFixed(1)}</td>
                    <td style={{textAlign: 'right'}}>{pesoTotalGrupos > 0 ? ((p.pesoTotal / pesoTotalGrupos) * 100).toFixed(1) : '0.0'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>📊 Gráfico ASCII</h3>
            <pre style={{fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.2', background: '#f5f5f5', padding: '10px', borderRadius: '4px'}}>
              {generarGraficoASCII()}
            </pre>

          </div>
        )}

        {tipoInforme === 'detallado' && (
          <div className="informe-section">
            <h3>📋 Informe Detallado</h3>

            {/* Ficha de Peso Total */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '1.8em', fontWeight: 'bold', marginBottom: '2px'}}>⚖️</div>
                <div style={{fontSize: '0.8em', opacity: 0.9}}>PESO TOTAL</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '1.5em', fontWeight: 'bold'}}>
                  {pesoTotalGrupos.toLocaleString('es-CO', {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                </div>
                <div style={{fontSize: '0.8em', opacity: 0.9}}>Kilogramos (kg)</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '1.5em', fontWeight: 'bold'}}>
                  {(pesoTotalGrupos / 1000).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <div style={{fontSize: '0.8em', opacity: 0.9}}>Toneladas (tons)</div>
              </div>
            </div>

            {gruposFiltrados.filter(g => g.elementos.length > 0).map(grupo => {
              const piezas = grupo.elementos.reduce((s, el) => s + el.cantidad, 0)
              return (
                <div key={grupo.id} className="grupo-detail">
                  <div className="grupo-detail-header">
                    <h4>{grupo.nombre}</h4>
                    {grupo.descripcion && (
                      <span className="grupo-detail-desc">{grupo.descripcion}</span>
                    )}
                    <span className="grupo-detail-meta">
                      {grupo.elementos.length} elementos • {piezas} piezas
                    </span>
                  </div>
                  <table className="elementos-table informe-table">
                    <thead>
                      <tr>
                        <th className="col-id">ID</th>
                        <th className="col-parte">Parte</th>
                        <th className="col-perfil">Perfil</th>
                        <th className="col-longitud">Long (mm)</th>
                        <th className="col-cant">Cant</th>
                        <th className="col-peso">Peso Unit (kg)</th>
                        <th className="col-peso">Peso Total (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.elementos.map(el => (
                        <tr key={el.id}>
                          <td className="col-id">{el.id}</td>
                          <td className="col-parte">{el.parte}</td>
                          <td className="col-perfil">{el.perfil}</td>
                          <td className="col-longitud">{el.longitud}</td>
                          <td className="col-cant">{el.cantidad}</td>
                          <td className="col-peso" style={{textAlign: 'right'}}>{el.peso.toFixed(2)}</td>
                          <td className="col-peso" style={{textAlign: 'right', fontWeight: 'bold', color: '#6366f1'}}>{(el.peso * el.cantidad).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}

        {tipoInforme === 'por-grupo' && (
          <div className="informe-section">
            <h3>📁 Por Grupo</h3>
            {gruposFiltrados.filter(g => g.elementos.length > 0).map(grupo => {
              const piezas = grupo.elementos.reduce((s, el) => s + el.cantidad, 0)
              return (
                <div key={grupo.id} className="grupo-section">
                  <div className="grupo-section-header">
                    <h4>{grupo.nombre}</h4>
                    {grupo.descripcion && (
                      <span className="grupo-section-desc">{grupo.descripcion}</span>
                    )}
                    <span className="grupo-section-stats">
                      {grupo.elementos.length} elementos • {piezas} piezas
                    </span>
                  </div>
                  <table className="elementos-table informe-table">
                    <thead>
                      <tr>
                        <th className="col-id">ID</th>
                        <th className="col-parte">Parte</th>
                        <th className="col-perfil">Perfil</th>
                        <th className="col-cant">Cant.</th>
                        <th className="col-timeline">Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.elementos.map(el => (
                        <tr key={el.id}>
                          <td className="col-id" style={{textAlign: 'right'}}>{el.id}</td>
                          <td className="col-parte">{el.parte}</td>
                          <td className="col-perfil">{el.perfil}</td>
                          <td className="col-cant" style={{textAlign: 'right'}}>{el.cantidad}</td>
                          <td className="col-timeline">
                            {el.actividades && el.actividades.length > 0 && (
                              <div className="elemento-timeline">
                                <TimelineBar actividades={el.actividades} />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="informe-footer">
        <span className="footer-badge">⬡</span>
        <span className="footer-divider">|</span>
        <span>CTIB - Bogotá</span>
        <span className="footer-divider">|</span>
        <span>Sistema de Gestión BIM</span>
        <span className="footer-divider">|</span>
        <span className="footer-highlight">v1.0</span>
        <span className="footer-divider">|</span>
        <span className="footer-badge">✨ AI Powered</span>
      </div>
    </div>
  )
}
