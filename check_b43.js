const API_URL = 'http://localhost:3001';

async function checkB43() {
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  
  const n02 = grupos.find(g => g.nombre === 'N02');
  const elemento = n02.elementos.find(e => e.parte === 'B/43');
  
  if (elemento) {
    console.log('=== B/43 ===');
    console.log(`Parte: ${elemento.parte}`);
    console.log(`Perfil: ${elemento.perfil}`);
    console.log(`Longitud: ${elemento.longitud} mm`);
    console.log(`Cantidad: ${elemento.cantidad}`);
    console.log(`Peso unitario: ${elemento.peso} kg`);
    console.log(`Peso total: ${elemento.pesoTotal} kg`);
    
    // Calcular peso teórico
    const pesoIPE240 = 30.7; // kg/m
    const longitud_m = elemento.longitud / 1000;
    const pesoTeorico = pesoIPE240 * longitud_m;
    
    console.log(`\n=== VERIFICACIÓN ===`);
    console.log(`Peso teórico IPE240: ${pesoIPE240} kg/m`);
    console.log(`Longitud: ${elemento.longitud} mm = ${longitud_m} m`);
    console.log(`Peso teórico: ${pesoTeorico.toFixed(2)} kg`);
    console.log(`Peso en BD: ${elemento.peso} kg`);
    console.log(`Diferencia: ${(elemento.peso - pesoTeorico).toFixed(2)} kg`);
  } else {
    console.log('Elemento B/43 no encontrado');
  }
}

checkB43();