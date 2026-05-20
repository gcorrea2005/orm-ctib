const API_URL = 'http://localhost:3001';

async function getElementsByProfiles() {
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  
  const n02 = grupos.find(g => g.nombre === 'N02');
  const elementos = n02.elementos;
  
  const perfilesEliminar = ['Ø305*10', '[]650*45', '[]650*64', 'UPN80', 'Ø508*12'];
  
  console.log('Elementos a eliminar:\n');
  
  const elementosEliminar = elementos.filter(e => perfilesEliminar.includes(e.perfil));
  
  console.log(`Total: ${elementosEliminar.length} elementos\n`);
  
  for (const e of elementosEliminar) {
    console.log(`ID: ${e.id} | Parte: ${e.parte} | Perfil: ${e.perfil} | Cantidad: ${e.cantidad}`);
  }
  
  // Eliminar uno por uno
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

getElementsByProfiles();