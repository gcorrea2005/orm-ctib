const API_URL = 'http://localhost:3001';

async function deleteRemaining() {
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  
  const n02 = grupos.find(g => g.nombre === 'N02');
  const elementos = n02.elementos;
  
  // Buscar perfiles a eliminar
  const elementosEliminar = elementos.filter(e => 
    e.perfil.includes('250') || 
    e.perfil.includes('406') ||
    e.perfil.includes('255')
  );
  
  console.log(`Encontrados ${elementosEliminar.length} elementos para eliminar:\n`);
  
  for (const e of elementosEliminar) {
    console.log(`ID: ${e.id} | Parte: ${e.parte} | Perfil: ${e.perfil} | Cantidad: ${e.cantidad}`);
  }
  
  console.log('\n=== ELIMINANDO ===');
  let eliminados = 0;
  for (const e of elementosEliminar) {
    const delRes = await fetch(`${API_URL}/api/elementos/${e.id}`, { method: 'DELETE' });
    if (delRes.ok) {
      eliminados++;
      console.log(`✓ Eliminado: ${e.parte} (${e.perfil})`);
    } else {
      console.log(`✗ Error eliminando: ${e.parte}`);
    }
  }
  
  console.log(`\nTotal eliminados: ${eliminados}`);
}

deleteRemaining();