import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin que lista archivos IFC dinamicamente
function bimFilesPlugin() {
  const bimDir = path.join(__dirname, 'public', 'taller', 'bim');
  return {
    name: 'bim-files',
    configureServer(server: any) {
      server.middlewares.use('/api/bim-files', (req: any, res: any) => {
        try {
          const files = fs.readdirSync(bimDir)
            .filter((f: string) => f.toLowerCase().endsWith('.ifc'))
            .map((f: string, i: number) => {
              const stat = fs.statSync(path.join(bimDir, f));
              const sizeKB = stat.size / 1024;
              let tamano: string;
              if (sizeKB >= 1024) tamano = (sizeKB / 1024).toFixed(1) + ' MB';
              else if (sizeKB >= 1) tamano = Math.round(sizeKB) + ' KB';
              else tamano = Math.round(stat.size) + ' B';
              return {
                id: i, nombre: f,
                codigo: f.replace(/\.ifc$/i, ''),
                path: '/taller/bim/' + f,
                tamano, bytes: stat.size, mtime: stat.mtimeMs
              };
            });
          // Orden: combinados, niveles, columnas, resto
          function sortKey(c: string) {
            if (c.startsWith('CTIB-HCB')) return '00_' + c;
            if (c.startsWith('N0')) return '01_' + c.padStart(10, '0');
            if (c.startsWith('COL') || c.startsWith('col') || (c.startsWith('c_') && !/[AB]_\d/.test(c))) return '02_' + c;
            if (c === '01' || c === 'b43') return '03_' + c;
            return '09_' + c;
          }
          files.sort((a: any, b: any) => sortKey(a.codigo).localeCompare(sortKey(b.codigo)));
          files.forEach((f: any, i: number) => f.id = i);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(files));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), bimFilesPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    hmr: {
      clientPort: 5173
    }
  },
  optimizeDeps: {
    exclude: ['web-ifc-viewer', 'web-ifc']
  },
  build: {
    assetsInlineLimit: 0
  }
});
