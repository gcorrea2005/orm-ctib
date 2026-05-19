import fs from 'fs';

const content = fs.readFileSync('public/Part_List_3D.txt', 'utf-8');
const lines = content.split('\n');

console.log(`Total líneas: ${lines.length}\n`);

// Contadores
let vacias = 0;
let headers = 0;
let placas = 0;
let hormigon = 0;
let parseados = 0;
let otros = 0;

const otrosDatos = [];

for (const line of lines) {
  if (!line.trim()) {
    vacias++;
    continue;
  }
  if (line.startsWith('---') || line.startsWith('PartPos') || line.startsWith('TEKLA')) {
    headers++;
    continue;
  }
  if (line.includes('PL') || line.includes('Hormi') || line.includes('Conc') || line.includes('C20/25')) {
    if (line.includes('PL')) placas++;
    else hormigon++;
    continue;
  }
  
  const match = line.trim().match(/^(\d+|[b|c]\/\w+)\s+(\S+)\s+(\d+)\s+\S+\s+(\d+)\s+[\d.]+\s+([\d.]+)$/i);
  
  if (match) {
    parseados++;
  } else {
    otros++;
    if (otros <= 30) {
      otrosDatos.push(line.trim());
    }
  }
}

console.log('=== CONTEO ===');
console.log(`Líneas vacías: ${vacias}`);
console.log(`Headers: ${headers}`);
console.log(`Placas (PL): ${placas}`);
console.log(`Hormigón: ${hormigon}`);
console.log(`Parseados: ${parseados}`);
console.log(`Otros (no parseados): ${otros}`);

console.log('\n=== PRIMEROS 30 LÍNEAS NO PARSEADAS ===');
otrosDatos.forEach((l, i) => console.log(`${i+1}: ${l}`));