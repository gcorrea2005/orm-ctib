const API_URL = 'http://localhost:3001';

// Tabla de pesos teóricos de perfiles estándar (kg/m) - S235JR
const pesosTeoricos = {
  // IPE
  'IPE160': 15.8,
  'IPE240': 30.7,
  'IPE300': 42.2,
  'IPE450': 67.2,
  // HEA
  'HEA450': 140.0,
  // UPN
  'UPN160': 18.8,
  'UPN80': 8.0,
  // Vigas armadas (calculado aproximando sección)
  '[]200*100*4': 18.5,
  '[]250*8': 22.5,
  '[]255*1': 7.5,
  '[]650*45': 78.0,
  '[]650*64': 105.0,
  // Tubos (diámetro externo × espesor)
  'Ø305*10': 72.8,
  'Ø406*12': 116.0,
  'Ø508*12': 147.0,
  // Perfiles especiales
  'HI420-10-***': 42.0,
};

function obtenerPesoNeto(perfil, longitud_mm) {
  // Buscar en tabla de pesos teóricos
  let pesoMetro = pesosTeoricos[perfil];
  
  // Si no está exacto, buscar coincidencia parcial
  if (!pesoMetro) {
    const keys = Object.keys(pesosTeoricos);
    for (const key of keys) {
      if (perfil.includes(key.replace('*', '').replace('Ø', ''))) {
        pesoMetro = pesosTeoricos[key];
        break;
      }
    }
  }
  
  if (pesoMetro) {
    const longitud_m = longitud_mm / 1000;
    const pesoNeto = pesoMetro * longitud_m;
    return Math.round(pesoNeto * 100) / 100; // 2 decimales
  }
  
  // Si no encuentra, devolver null
  return null;
}

async function actualizarPesos() {
  console.log('=== OBTENIENDO ELEMENTOS ===\n');
  
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  
  const n02 = grupos.find(g => g.nombre === 'N02');
  const elementos = n02.elementos;
  
  console.log(`Total elementos: ${elementos.length}\n`);
  
  let actualizados = 0;
  let sinPerfil = 0;
  let errores = 0;
  
  console.log('=== ACTUALIZANDO PESOS ===\n');
  
  for (const e of elementos) {
    const pesoNeto = obtenerPesoNeto(e.perfil, e.longitud);
    
    if (pesoNeto === null) {
      sinPerfil++;
      console.log(`⚠️ Sin dato: ${e.parte} - ${e.perfil}`);
      continue;
    }
    
    const pesoTotal = pesoNeto * e.cantidad;
    
    try {
      const updateRes = await fetch(`${API_URL}/api/elementos/${e.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peso: pesoNeto,
          pesoTotal: pesoTotal
        })
      });
      
      if (updateRes.ok) {
        actualizados++;
        const diff = (e.peso - pesoNeto).toFixed(1);
        console.log(`✓ ${e.parte} | ${e.perfil} | Bruto: ${e.peso} → Neto: ${pesoNeto} kg | Diff: ${diff} kg`);
      } else {
        errores++;
        console.log(`✗ Error actualizando: ${e.parte}`);
      }
    } catch (err) {
      errores++;
      console.log(`✗ Error: ${e.parte} - ${err.message}`);
    }
  }
  
  console.log(`\n=== RESUMEN ===`);
  console.log(`Actualizados: ${actualizados}`);
  console.log(`Sin perfil en tabla: ${sinPerfil}`);
  console.log(`Errores: ${errores}`);
}

actualizarPesos();