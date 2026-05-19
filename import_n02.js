import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer archivo
const filePath = path.join(__dirname, 'public/Part_List_N02_noPL_noHormi.txt');
const content = fs.readFileSync(filePath, 'utf-8');

// Parsear líneas
const lines = content.split('\n');
const elementos = [];

for (const line of lines) {
  // Saltar líneas vacías y headers
  if (!line.trim() || line.startsWith('---') || line.startsWith('PartPos')) continue;
  
  // Buscar líneas con formato de datos: b/1, b/3, c/1, etc.
  // El formato es: b/1       IPE450        2     S235JR         8054      12.9       624.7
  const match = line.trim().match(/^([b|c]\/\w+)\s+(\S+)\s+(\d+)\s+\S+\s+(\d+)\s+[\d.]+\s+([\d.]+)$/i);
  
  if (match) {
    const [, parte, perfil, cantidad, longitud, pesoTotal] = match;
    const cant = parseInt(cantidad);
    const pesoUnitario = parseFloat(pesoTotal) / cant; // El peso en Tekla es TOTAL, dividir por cantidad
    elementos.push({
      parte: parte.toUpperCase(),
      perfil: perfil,
      cantidad: cant,
      longitud: parseFloat(longitud),
      peso: Math.round(pesoUnitario * 100) / 100 // Redondear a 2 decimales
    });
  }
}

console.log(`Total elementos parseados: ${elementos.length}`);
console.log('Primeros 5:', elementos.slice(0, 5));
console.log('Últimos 5:', elementos.slice(-5));

//Ahora hacer las llamadas al API para importar al grupo N02 (id=2)
const API_URL = 'http://localhost:3001';
const GRUPO_ID = 26; // N02

async function importar() {
  let importCount = 0;
  let errorCount = 0;
  
  for (const elem of elementos) {
    try {
      const response = await fetch(`${API_URL}/api/grupos/${GRUPO_ID}/elementos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(elem)
      });  if (!response.ok) {
        const error = await response.text();
        console.error(`Error importando ${elem.parte}:`, error);
        errorCount++;
      } else {
        importCount++;
        if (importCount % 20 === 0) {
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