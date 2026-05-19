const API_URL = 'http://localhost:3001';

async function resumen3D() {
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  
  const grupo3D = grupos.find(g => g.nombre === '3D');
  const elementos = grupo3D.elementos;
  
  // Calcular stats por perfil
  const stats = {};
  
  for (const e of elementos) {
    if (!stats[e.perfil]) {
      stats[e.perfil] = { elementos: 0, piezas: 0, pesoTotal: 0 };
    }
    stats[e.perfil].elementos++;
    stats[e.perfil].piezas += e.cantidad;
    stats[e.perfil].pesoTotal += e.pesoTotal;
  }
  
  const sorted = Object.entries(stats).sort((a, b) => b[1].pesoTotal - a[1].pesoTotal);
  
  let totalElementos = 0;
  let totalPiezas = 0;
  let totalPeso = 0;
  
  console.log('=== GRUPO 3D - RESUMEN POR PERFIL ===\n');
  console.log('| Perfil        | Elementos | Piezas | Peso Total (kg) |');
  console.log('|---------------|-----------|--------|-----------------|');
  
  for (const [perfil, data] of sorted) {
    totalElementos += data.elementos;
    totalPiezas += data.piezas;
    totalPeso += data.pesoTotal;
    console.log(`| ${perfil.padEnd(13)} | ${String(data.elementos).padStart(9)} | ${String(data.piezas).padStart(6)} | ${data.pesoTotal.toFixed(1).padStart(14)} |`);
  }
  
  console.log('|---------------|-----------|--------|-----------------|');
  console.log(`| **TOTAL**     | ${String(totalElementos).padStart(9)} | ${String(totalPiezas).padStart(6)} | ${totalPeso.toFixed(1).padStart(14)} |`);
}

resumen3D();