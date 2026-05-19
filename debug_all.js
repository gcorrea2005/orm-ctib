import fs from 'fs';

const content = fs.readFileSync('public/Part_List_3D.txt', 'utf-8');
const lines = content.split('\n');

// Verificar el total del archivo
const totalLine = lines.find(l => l.includes('Total for'));
console.log('Línea totals:', totalLine);

// Verificar todos los perfiles únicos
const perfiles = new Set();
const placasCount = { count: 0, lines: [] };

for (const line of lines) {
  if (!line.trim()) continue;
  if (line.startsWith('---') || line.startsWith('PartPos') || line.startsWith('TEKLA') || line.includes('Total for')) continue;
  
  const match = line.trim().match(/^(\d+|[b|c]\/\w+)\s+(\S+)\s+(\d+)\s+\S+\s+(\d+)\s+[\d.]+\s+([\d.]+)$/i);
  
  if (match) {
    const perfil = match[2];
    perfiles.add(perfil);
  }
}

console.log('\n=== PERFILES ENCONTRADOS ===');
console.log('Total perfiles únicos:', perfiles.size);
console.log(Array.from(perfiles).sort());