# Agents Configuration

## Project Overview
- **Name:** orm-ctib
## Scripts
- `npm run start` (API + dev), `npm run build`, `npm run prisma:push`

## Environment Setup
- **Node.js**: v22.22.2 (via nvm, default)
- **Important**: System Node v21.7.1 at `/usr/local/bin/node` was renamed to `node.backup`
- Created symlink: `/usr/local/bin/node` → `/Users/gcorrea/.nvm/versions/node/v22.22.2/bin/node`
- This forces npm scripts to use Node 22 (Vite 8 requires Node 20.19+ or 22.12+)
- **Start app**: `cd /Users/gcorrea/Desktop/myProgs/ipodApp && npm run start`
- **Ports**: Frontend (Vite) at localhost:5173, API (Express) at localhost:3001
- **Verificación**: Ejecutar `node -v` para confirmar v22.22.2, `npx tsc -b` para validar TypeScript antes de iniciar

## Database
- **Provider:** SQLite `prisma/dev.db`
- **Version:** Prisma 5.22.0

## Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | Int | PK, Auto-increment |
| email | String | Unique |
| name | String? | Optional |
| activo | Boolean | Default true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Grupo
| Field | Type |
|-------|------|
| id | Int PK |
| nombre | String Unique (N01-N25) |
| elementos | MetalElement[] |

### MetalElement
| Field | Type |
|-------|------|
| id | Int PK |
| parte | String |
| perfil | String |
| longitud | Float |
| cantidad | Int |
| peso | Float |
| observaciones | String? |
| grupoId | Int FK |

### Stock
| Field | Type |
|-------|------|
| id | Int PK |
| nombre | String Unique |
| descripcion | String? |
| productos | Producto[] |

### Producto
| Field | Type |
|-------|------|
| id | Int PK |
| perfil | String |
| cantidad | Int |
| largo, ancho, peso | Float |
| comentarios | String? |
| stockId | Int FK |
| createdAt, updatedAt | DateTime |

## Key Files
- `server/index.js` - Express API
- `prisma/schema.prisma` - Schema
- `src/lib/api.ts` - API client
- `src/components/panels/TallerPanel.tsx` - Taller CRUD
- `src/components/panels/InformesPanel.tsx` - Reports with tabs
- `src/App.css` - Styles (print-optimized)

## API Endpoints

### Users
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/users` | List all |
| POST | `/api/users/register` | Register |
| POST | `/api/users/login` | Login (check activo) |
| PUT | `/api/users/:id` | Update |
| PATCH | `/api/users/:id/activo` | Toggle activo |
| DELETE | `/api/users/:id` | Delete |

### Grupos
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/grupos` | List all |
| POST | `/api/grupos` | Create |
| PUT | `/api/grupos/:id` | Update |
| DELETE | `/api/grupos/:id` | Delete |

### Elementos
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/grupos/:grupoId/elementos` | Create |
| PUT | `/api/elementos/:id` | Update |
| DELETE | `/api/elementos/:id` | Delete |

### Stocks/Productos - Full CRUD

## Taller Features
- **CRUD Grupos:** Crear (+ Nuevo), Editar (✏️), Eliminar (🗑️)
- **CRUD Elementos:** Crear, Editar (✏️), Eliminar (🗑️)
- **Cards Ultra-Compactas (NO TABLA):**
  - Gradiente sunset (#667eea→#764ba2), shimmer animation, borderRadius 12px
  - Header: Parte + Cantidad en misma línea
  - Campos: 2x2 FLEXBOX (Perfil, Long., W/unit, W/total) sin iconos ni unidades
| ⚙️ Ingeniería | IngenieriaPanel | Ingeniería
| 🏗️ BIM | BimPanel | BIM
| 📊 Informes | InformesPanel | Reports with tabs

## TimelineBar (7 etapas)
- Etapas: Planos 📐, Corte ✂️, Armado 🔧, Sold. 🔥, Sand 🌪️, Pint. 🎨, Mont. 🏗️
- Filtro frontend excluye: entrega, bim, INFO, limpieza, almacenamiento, Almacenamiento
- Solo iconos dentro de circulos sin numeros
- Colores: verde (completado), azul (en proceso), gris (pendiente)
- Compact: 28px icons / 14px font, Normal: 40px icons / 20px font
- Dual naming convention soportado en TIPO_ICONS (planos_taller||Planos, etc.)
- Boton INFO (ℹ️) y almacenamiento (📦) eliminados del sistema (2026-05-07)

## ActividadElemento Tipos (Backend)
Al crear elemento manual: Planos(1), Corte(2), Armado(3), Soldadura(4), Sandblasting(5), Pintura(6), Montaje(7)
Import script crea: Planos(1) a Montaje(7) — sin entrega
Total: 7 actividades visibles en TimelineBar

## Floors Imported (2026-05-07)
| Floor | Elements | Weight (kg) |
|-------|----------|-------------|
| N01 | 19 | 72,001.7 |
| N05 | 122 | 66,181.2 |
| N06 | 118 | 61,069.7 |
| N07 | 75 | 29,700.0 |
| N07a | 33 | 16,093.5 |
| N08 | 112 | 28,700.0 |
| N09 | 116 | 50,100.0 |
| N10 | 111 | 27,657.2 |
| N11 | 117 | 28,575.8 |
| N12 | 111 | 28,093.9 |
| N13 | 108 | 27,217.0 |
| N14 | 110 | 27,435.7 |
| N15 | 112 | 28,266.5 |
| N16 | 112 | 28,266.5 |
| N17 | 112 | 28,266.5 |
| N18 | 112 | 27,976.4 |
| N19-N23 | 555 | 139,880.0 |
| N24 | 113 | 28,783.8 |
| **Total** | **2,051** | **~590,888 kg** |

Filters: Hormi* (concrete), tubos ([]*), PL* (platinas), tubos redondos 305*10/406*12
Script: `scripts/import_n18_n23.py` (actualizado para N07/N07a/N24)

## GitHub
- Repo: github.com/gcorrea2005/orm-ctib (public, pushed 2026-05-07)
- DB excluded via .gitignore (prisma/dev.db)
- .gitignore: node_modules, .env, *.db, *.sqlite, .vscode/, memory.md, etc.
- **Seguimiento de Actividades (backend):**
  - 8 tipos en backend (Planos, Corte, Armado, Soldadura, Sandblasting, Pintura, Montaje, entrega): Pendiente, En Proceso, Completado
  - API incluye actividades al cargar grupos (`/api/grupos?include=actividades`)
  - Campo 'datos' (String JSON) en ActividadElemento para almacenar info específica
  - Backend acepta 'datos' en PUT `/api/actividades/:id`
- **Módulos de Etapas (frontend):**
  - 7/7 módulos COMPLETOS e integrados en TallerPanel.tsx (sin INFO/bim, sin Almacenamiento)
  - Al hacer clic en TimelineBar se abre el modal correspondiente (onStageClick)
  - Cada modal tiene formulario específico y botones "Guardar" y "Completar Etapa"
  - **FIXED**: Al guardar etapas ya NO usa window.location.reload(). Usa updateActividad del TallerContext
- **Modal Información del Elemento:**
  - Eliminado: INFO/bim y InfoBimPanel.tsx removidos del sistema (2026-05-07)
- Stats: Grupo, Elementos, Piezas, Peso Total
- Pestañas muestran total de partes (suma de cantidad)

## New Components
- `src/components/TimelineBar.tsx` - Visual timeline bar for element lifecycle (7 stages, icons only)
- `src/components/panels/PlanosTallerPanel.tsx` - Módulo Planos de Taller (Etapa 1)
- `src/components/panels/CortePerforacionPanel.tsx` - Módulo Corte y Perforación (Etapa 2)
- `src/components/panels/ArmadoPanel.tsx` - Módulo Armado (Etapa 3)
- `src/components/panels/SoldaduraPanel.tsx` - Módulo Soldadura (Etapa 4)
- `src/components/panels/SandblastingPanel.tsx` - Módulo Sand-blasting (Etapa 5)
- `src/components/panels/PinturaPanel.tsx` - Módulo Pintura (Etapa 6)
- `src/components/panels/MontajePanel.tsx` - Módulo Montaje (Etapa 7)
- `src/components/panels/EntregaPanel.tsx` - Módulo Entrega (FINAL - filtrado del TimelineBar)
- InfoBimPanel.tsx y AlmacenamientoPanel.tsx eliminados (2026-05-07)

## Report Generator
- Panel: "Informes" with tabs (Almacén | Usuarios | Taller)
- Taller: filtros por grupo y tipo de informe (Resumen, Detallado, Por Grupo)
- Header with CTIB logo and date
- Footer: "⬡ CTIB - Bogotá | Sistema de Gestión BIM | v1.0 | ✨ AI Powered"
- Visual preview + Markdown download
- Grayscale styles for printing
- **InformeTallerPanel Format:**
  - Tablas usan HTML `<table>` con class `informe-table`
  - Columnas con clases CSS específicas: col-id (50px), col-parte (70px), col-perfil (70px), col-cant (50px), col-timeline (auto, min-300px)
  - Celdas: padding 12px 8px para mayor altura, vertical-align: middle
  - TimelineBar en informes: height 50px, NO usar transform:scale(), overflow:visible
  - CSS en JSX: `.timeline-compacto > div { transform:none, width:100%, height:auto }`
  - Las 3 vistas (Resumen, Detallado, Por Grupo) usan las mismas clases de columna
  - Eliminados: pesos y observaciones de la vista Taller

## UI/UX
- Animaciones y efectos visuales en tarjetas, botones, tablas, formularios, navegación
- Botones más grandes y con más interacción
- Transiciones suaves con cubic-bezier

## Grupo N02 (legacy)
- Archivo fuente: `public/Part_List_N02.txt` (Tekla Structures, 304 lineas)
- Archivo filtrado: `public/Part_List_N02_noPL_noHormi.txt` (221 lineas, sin placas ni hormigón)
- 200 elementos importados al grupo N02 (nivelId: 26)

## Deploy to Vercel (nota)
- Database: Migrated to PostgreSQL (Neon recommended)
- Frontend: Deploy on Vercel (Vite build)
- Backend: Deploy on Railway/Render (Express + PostgreSQL)
- Environment Variables: DATABASE_URL (from Neon), NODE_VERSION=22.22.2
- Note: Vercel only serves static frontend; Express API needs separate deployment or serverless adaptation.
