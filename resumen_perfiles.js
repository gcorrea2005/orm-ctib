const API_URL = 'http://localhost:3001';

async function resumenPesos() {
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  
  const n02 = grupos.find(g => g.nombre === 'N02');
  const elementos = n02.elementos;
  
  // Calcular stats por perfil
  const stats = {};
  
  for (const e of elementos) {
    if (!stats[e.perfil]) {
      stats[e.perfil] = {
        elementos: 0,
        piezas: 0,
        pesoTotal: 0
      };
    }
    stats[e.perfil].elementos++;
    stats[e.perfil].piezas += e.cantidad;
    stats[e.perfil].pesoTotal += e.pesoTotal;
  }
  
  // Ordenar por peso total descendente
  const sorted = Object.entries(stats).sort((a, b) => b[1].pesoTotal - a[1].pesoTotal);
  
  // Calcular totales
  let totalElementos = 0;
  let totalPiezas = 0;
  let totalPeso = 0;
  
  console.log('=== RESUMEN POR PERFIL ===\n');
  console.log('| Perfil        | Elementos | Piezas | Peso Total (kg) |');
  console.log('|---------------|-----------|--------|-----------------|');
  
  for (const [perfil, data] of sorted) {
    totalElementos += data.elementos;
    totalPiezas += data.piezas;
    totalPeso += data.pesoTotal;
    
    const perfilPad = perfil.padEnd(13);
    console.log(`| ${perfilPad} | ${String(data.elementos).padStart(9)} | ${String(data.piezas).padStart(6)} | ${data.pesoTotal.toFixed(1).padStart(14)} |`);
  }
  
  console.log('|---------------|-----------|--------|-----------------|');
  console.log(`| **TOTAL**     | ${String(totalElementos).padStart(9)} | ${String(totalPiezas).padStart(6)} | ${totalPeso.toFixed(1).padStart(14)} |`);
  console.log(`\nPeso promedio por pieza: ${(totalPeso / totalPiezas).toFixed(1)} kg`);
}

resumenPesos();