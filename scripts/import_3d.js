import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3001';
const GRUPO_ID = 27; // Grupo 3D

// Leer archivo
const filePath = path.join(__dirname, 'public/Part_List_3D.txt');
const content = fs.readFileSync(filePath, 'utf-8');

// Parsear líneas - filtrar PL y Hormi
const lines = content.split('\n');
const elementos = [];

for (const line of lines) {
  // Saltar líneas vacías y headers
  if (!line.trim() || line.startsWith('---') || line.startsWith('PartPos')) continue;
  
  // Filtrar: excluir PL (placas) y Hormi (hormigón)
  if (line.includes('PL') || line.includes('Hormi') || line.includes('Conc') || line.includes('C20/25')) {
    continue;
  }
  
  // Buscar líneas con formato: b/1, c/1, 1001, etc.
  const match = line.trim().match(/^(\d+|[b|c]\/\w+)\s+(\S+)\s+(\d+)\s+\S+\s+(\d+)\s+[\d.]+\s+([\d.]+)$/i);
  
  if (match) {
    const [, parte, perfil, cantidad, longitud, pesoTotal] = match;
    const cant = parseInt(cantidad);
    const pesoUnitario = parseFloat(pesoTotal) / cant;
    elementos.push({
      parte: parte.toUpperCase(),
      perfil: perfil,
      cantidad: cant,
      longitud: parseFloat(longitud),
      peso: Math.round(pesoUnitario * 100) / 100
    });
  }
}

console.log(`Total elementos parseados (sin PL ni Hormi): ${elementos.length}`);
console.log('Primeros 10:', elementos.slice(0, 10).map(e => `${e.parte} - ${e.perfil}`));
console.log('Últimos 5:', elementos.slice(-5).map(e => `${e.parte} - ${e.perfil}`));

async function importar() {
  let importCount = 0;
  let errorCount = 0;
  
  console.log('\n=== IMPORTANDO ===');
  
  for (const elem of elementos) {
    try {
      const response = await fetch(`${API_URL}/api/grupos/${GRUPO_ID}/elementos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(elem)
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`Error importando ${elem.parte}:`, error);
        errorCount++;
      } else {
        importCount++;
        if (importCount % 50 === 0) {
          console.log(`Importados ${importCount} elementos...`);
        }
      }
    } catch (err) {
      console.error(`Error en ${elem.parte}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\n=== RESUMEN ===`);
  console.log(`Total importados: ${importCount}`);
  console.log(`Total errores: ${errorCount}`);
}

importar();