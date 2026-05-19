const API_URL = 'http://localhost:3001';

async function checkStats() {
  const response = await fetch(`${API_URL}/api/grupos`);
  const grupos = await response.json();
  
  const n02 = grupos.find(g => g.nombre === 'N02');
  const elementos = n02.elementos;
  
  console.log(`=== GRUPO N02 ===`);
  console.log(`Total elementos: ${elementos.length}`);
  
  const totalPiezas = elementos.reduce((sum, e) => sum + e.cantidad, 0);
  const pesoTotal = elementos.reduce((sum, e) => sum + (e.peso * e.cantidad), 0);
  
  console.log(`Total piezas (suma de cantidad): ${totalPiezas}`);
  console.log(`Peso total: ${pesoTotal.toFixed(1)} kg`);
  
  // Contar por tipo de perfil
  const perfiles = {};
  elementos.forEach(e => {
    perfiles[e.perfil] = (perfiles[e.perfil] || 0) + 1;
  });
  
  console.log(`\n=== PERFILES ===`);
  Object.entries(perfiles)
    .sort((a, b) => b[1] - a[1])
    .forEach(([perfil, count]) => {
      console.log(`${perfil}: ${count}`);
    });
}

checkStats();