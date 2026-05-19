const API_URL = 'http://localhost:3001';

async function checkGrupo3D() {
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  
  const grupo3D = grupos.find(g => g.nombre === '3D');
  
  if (grupo3D) {
    console.log(`Grupo: ${grupo3D.nombre}`);
    console.log(`ID: ${grupo3D.id}`);
    console.log(`Elementos: ${grupo3D.elementos.length}`);
  } else {
    console.log('Grupo 3D no encontrado');
  }
}

checkGrupo3D();