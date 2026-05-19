import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3001';

// Leer archivo original
const filePath = path.join(__dirname, 'public/Part_List_N02_noPL_noHormi.txt');
const content = fs.readFileSync(filePath, 'utf-8');

// Parsear líneas
const lines = content.split('\n');
const elementos = [];

for (const line of lines) {
  if (!line.trim() || line.startsWith('---') || line.startsWith('PartPos')) continue;
  
  const match = line.trim().match(/^([b|c]\/\w+)\s+(\S+)\s+(\d+)\s+\S+\s+(\d+)\s+[\d.]+\s+([\d.]+)$/i);
  
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

console.log(`Elementos parseados del archivo: ${elementos.length}`);

// Obtener elementos actuales de la DB
async function obtenerElementosDB() {
  const response = await fetch(`${API_URL}/api/grupos?include=elementos`);
  const grupos = await response.json();
  const n02 = grupos.find(g => g.nombre === 'N02');
  return n02.elementos;
}

async function restaurarPesos() {
  const dbElementos = await obtenerElementosDB();
  console.log(`Elementos en DB: ${dbElementos.length}\n`);
  
  let actualizados = 0;
  let noEncontrados = 0;
  
  console.log('=== RESTAURANDO PESOS ===\n');
  
  for (const e of dbElementos) {
    // Buscar en archivo original por parte
    const archivoElem = elementos.find(el => el.parte === e.parte);
    
    if (!archivoElem) {
      noEncontrados++;
      console.log(`⚠️ No encontrado en archivo: ${e.parte}`);
      continue;
    }
    
    const pesoTotal = archivoElem.peso * archivoElem.cantidad;
    
    try {
      const updateRes = await fetch(`${API_URL}/api/elementos/${e.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peso: archivoElem.peso,
          pesoTotal: pesoTotal
        })
      });
      
      if (updateRes.ok) {
        actualizados++;
        const diff = (e.peso - archivoElem.peso).toFixed(1);
        if (Math.abs(diff) > 0.1) {
          console.log(`✓ ${e.parte} | ${e.perfil} | Neto: ${e.peso} → Bruto: ${archivoElem.peso} kg | Diff: ${diff} kg`);
        }
      } else {
        console.log(`✗ Error actualizando: ${e.parte}`);
      }
    } catch (err) {
      console.log(`✗ Error: ${e.parte} - ${err.message}`);
    }
  }
  
  console.log(`\n=== RESUMEN ===`);
  console.log(`Actualizados: ${actualizados}`);
  console.log(`No encontrados: ${noEncontrados}`);
}

restaurarPesos();