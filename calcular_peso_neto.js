// Tabla de pesos teóricos de perfiles estándar (kg/m)
// Valores típicos para S235JR/S275JR
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
  // Vigas armadas (aproximado)
  '[]200*100*4': 18.5,
  // Tubos (diámetro * espesor)
  'Ø305*10': 72.8,
  'Ø406*12': 116.0,
  'Ø508*12': 147.0,
};

// Densidad del acero: 7850 kg/m³
const DENSIDAD = 7850;

function calcularPesoNeto(perfil, longitud_mm, area_m2) {
  // Buscar en tabla de pesos teóricos
  const pesoTeorico = pesosTeoricos[perfil];
  
  if (pesoTeorico) {
    // Usar peso teórico por metro
    const longitud_m = longitud_mm / 1000;
    return pesoTeorico * longitud_m;
  }
  
  // Si no está en la tabla, calcular desde área
  // Peso = Area × Longitud × Densidad
  if (area_m2 && longitud_mm) {
    const longitud_m = longitud_mm / 1000;
    return area_m2 * longitud_m * DENSIDAD;
  }
  
  return null;
}

// Datos de ejemplo del archivo
const elementos = [
  { parte: 'B/1', perfil: 'IPE450', longitud: 8054, area: 12.9, peso_bruto: 624.7 },
  { parte: 'B/5', perfil: 'HEA450', longitud: 8201, area: 16.5, peso_bruto: 1145.9 },
  { parte: 'B/140', perfil: 'IPE160', longitud: 314, area: 0.2, peso_bruto: 4.9 },
];

console.log('=== CÁLCULO PESO NETO ===\n');

for (const e of elementos) {
  const peso_neto = calcularPesoNeto(e.perfil, e.longitud, e.area);
  const diferencia = e.peso_bruto - peso_neto;
  
  console.log(`${e.parte} | ${e.perfil}`);
  console.log(`  Longitud: ${e.longitud}mm = ${e.longitud/1000}m`);
  console.log(`  Peso Bruto: ${e.peso_bruto} kg`);
  console.log(`  Peso Neto: ${peso_neto ? peso_neto.toFixed(1) : 'N/A'} kg`);
  console.log(`  Diferencia: ${diferencia ? diferencia.toFixed(1) : 'N/A'} kg`);
  console.log('');
}