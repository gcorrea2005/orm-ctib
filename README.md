<div align="center">

```
 ██████╗████████╗██╗██████╗ 
██╔════╝╚══██╔══╝██║██╔══██╗
██║        ██║   ██║██████╔╝
██║        ██║   ██║██╔══██╗
╚██████╗   ██║   ██║██████╔╝
 ╚═════╝   ╚═╝   ╚═╝╚═════╝ 
```

# Sistema de Gestion BIM para Estructuras Metalicas

### De la oficina tecnica a la obra — un solo sistema

![Node.js](https://img.shields.io/badge/Node.js-22.22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0-green?style=for-the-badge)
![Elements](https://img.shields.io/badge/Elements-2,051-orange?style=for-the-badge)
![Weight](https://img.shields.io/badge/Weight-590%20tons-red?style=for-the-badge)

---

</div>

## Vision General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   CTIB es un sistema de gestion BIM desarrollado para Estructuras           │
│   Metalicas HcB (Bogota, Colombia) que acompana el ciclo de vida           │
│   completo de elementos estructurales metalicos:                            │
│                                                                             │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│   │ PLANOS   │──>│  CORTE   │──>│  ARMADO  │──>│ SOLDADURA│               │
│   │    📐    │   │    ✂️    │   │    🔧    │   │    🔥    │               │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘               │
│        │                                                       │            │
│        v                                                       v            │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐                               │
│   │SAND BLAST│──>│  PINTURA │──>│ MONTAJE  │──> ENTREGA                    │
│   │    🌪️    │   │    🎨    │   │    🏗️    │                               │
│   └──────────┘   └──────────┘   └──────────┘                               │
│                                                                             │
│   Desde la oficina tecnica hasta el montaje en obra.                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Modulos del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD PRINCIPAL                                │
├───────────┬───────────┬───────────┬───────────┬───────────┬─────────────────┤
│           │           │           │           │           │                 │
│  TALLER   │ CONEXIONES│    BIM    │INGENIERIA │ INFORMES  │    ALMACEN      │
│   🔧      │    🔩     │    🏗️    │    📐     │    📊     │      📦        │
│           │           │           │           │           │                 │
│ CRUD      │ 20 cats   │ IFC files │ Docs      │ Reports   │ Stock          │
│ Grupos    │ 25 perf.  │ Upload    │ tecnicos  │ 3 vistas  │ Productos      │
│ Elementos │ Auto-calc │ Rename    │           │ Markdown  │                 │
│ 7 etapas  │ 1722 comb │ Delete    │           │ Print     │                 │
│           │           │           │           │           │                 │
└───────────┴───────────┴───────────┴───────────┴───────────┴─────────────────┘
```

| Modulo | Icono | Descripcion |
|:------:|:-----:|:------------|
| **Taller** | 🔧 | CRUD completo de grupos (pisos N01-N24) y elementos estructurales con seguimiento de 7 etapas de produccion |
| **Conexiones** | 🔩 | Gestion de conexiones estructurales (soldadas y atornilladas) con calculo automatico de placas, tornillos y soldadura |
| **BIM** | 🏗️ | Gestion de archivos IFC con upload, rename y delete para visualizacion de modelos BIM |
| **Ingenieria** | 📐 | Modulo de ingenieria para documentacion tecnica y planos |
| **Informes** | 📊 | Generacion de reportes en 3 vistas (Resumen, Detallado, Por Grupo) con exportacion a Markdown |
| **Almacen** | 📦 | Control de stock de materiales y productos con CRUD completo |

---

## Timeline de Produccion — 7 Etapas

Cada elemento estructural sigue un ciclo visual de 7 etapas con indicadores de color:

```
  ETAPA 1        ETAPA 2        ETAPA 3        ETAPA 4        ETAPA 5        ETAPA 6        ETAPA 7
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│          │  │          │  │          │  │          │  │          │  │          │  │          │
│ PLANOS   │─>│  CORTE   │─>│  ARMADO  │─>│SOLDADURA │─>│SAND BLAST│─>│  PINTURA │─>│ MONTAJE  │
│   📐     │  │   ✂️     │  │   🔧     │  │   🔥     │  │   🌪️     │  │   🎨     │  │   🏗️     │
│          │  │          │  │          │  │          │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │              │              │              │              │              │              │
     v              v              v              v              v              v              v
  Plano de      Corte y       Armado de      Cordones       Sandblast      Aplicacion     Izaje y
  fabricacion   perforacion   componentes    de soldadura   y limpieza     de pintura     montaje
  y revision    de perfiles   y uniones      y filetes      de superficie  protectora     en obra
```

### Indicadores de Estado

```
  ● COMPLETADO    (Verde)   — Etapa finalizada, datos registrados
  ● EN PROCESO    (Azul)    — Etapa activa, trabajo en curso  
  ● PENDIENTE     (Gris)    — Etapa no iniciada, esperando turno
```

### Modulos de Etapa (Frontend)

Cada etapa tiene un panel dedicado con formulario especifico:

```
┌─────────────────────────────────────────────────────────────┐
│  ETAPA: SOLDADURA                              [Elemento #47]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tipo de soldadura:  [___________v]                         │
│  Longitud del cordon:[          ] mm                        │
│  Tamano de filete:   [          ] mm                        │
│  Posicion:           [___________v]                         │
│  Electrodo:          [___________v]                         │
│  Observaciones:      [____________________________]         │
│                                                             │
│  [ Guardar ]                    [ Completar Etapa ✓ ]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Modulo de Conexiones

Sistema completo de gestion de conexiones estructurales con **1,722 combinaciones** pre-generadas.

### Matriz de Categorias (4 x 5 = 20)

```
              SECUNDARIA
           ┌─────────┬─────────┬─────────┬─────────┬─────────┐
           │  IPE    │  HEA    │  T.CUAD │  T.RED  │  PLBASE │
    ┌──────┼─────────┼─────────┼─────────┼─────────┼─────────┤
    │ IPE  │ IPE-IPE │ IPE-HEA │IPE-TCUAD│IPE-TRDON│IPE-PLBS │
P   ├──────┼─────────┼─────────┼─────────┼─────────┼─────────┤
R   │ HEA  │ HEA-IPE │ HEA-HEA │HEA-TCUAD│HEA-TRDON│HEA-PLBS │
I   ├──────┼─────────┼─────────┼─────────┼─────────┼─────────┤
N   │TCUAD │TCUAD-IPE│TCUAD-HEA│TCUAD-TCD│TCUAD-TRD│TCUAD-PLB│
C   ├──────┼─────────┼─────────┼─────────┼─────────┼─────────┤
I   │TRDON │TRDON-IPE│TRDON-HEA│TRDON-TCD│TRDON-TRD│TRDON-PLB│
P   └──────┴─────────┴─────────┴─────────┴─────────┴─────────┘
A
L
```

### Perfiles Soportados (25 perfiles)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  IPE (Viga IPN Europea)                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ IPE 200 │ IPE 240 │ IPE 270 │ IPE 300 │ IPE 330 │ ... │   │
│  │ IPE 360 │ IPE 400 │ IPE 450 │ IPE 500 │ IPE 550 │     │   │
│  │ IPE 600                                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  HEA (Viga H Ancha)                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ HEA 200 │ HEA 220 │ HEA 240 │ HEA 260 │ HEA 280 │ ... │   │
│  │ HEA 300 │ HEA 320 │ HEA 340 │ HEA 360 │ HEA 400 │     │   │
│  │ HEA 450 │ HEA 500 │ HEA 550 │ HEA 600                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Tubo Cuadrado (HSS)                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 100x100 │ 120x120 │ 150x150 │ 200x200 │ 250x250 │     │   │
│  │ 300x300 │ 350x350 │ 400x400                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Tubo Redondo (HSS)                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 114.3x6 │ 168.3x7 │ 219.1x8 │ 273x8   │ 305x10  │     │   │
│  │ 323.9x10│ 355.6x10│ 406.4x12                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dimensiones Libres — Platina de Conexion

```
         ←── b ──→
         ┌───────┐ ─┬─
         │ ALA   │  │ tf
         ├───────┤ ─┤
         │       │  │
         │ ALMA  │  │ h_libre = h - 2*tf
         │(plat.)│  │
         │       │  │
         ├───────┤ ─┤
         │ ALA   │  │ tf
         └───────┘ ─┴─

  Ancho platina  = (b - tf) / 2     ← espacio disponible en el alma
  Largo platina  = h - 2 * tf       ← altura libre entre alas
```

### Calculos Automaticos

```
┌──────────────────────────────────────────────────────────────────┐
│  PLATINA DE ANCLAJE                                              │
│  ─────────────────                                               │
│                                                                  │
│  Ancho:      (b - tf) / 2                        [auto]          │
│  Largo:      h - 2*tf                            [auto]          │
│  Espesor:    6 mm                                [default]       │
│  Peso:       ancho * largo * espesor * 7850       [auto] kg      │
│                                                                  │
│  TORNILLOS                                                       │
│  ─────────                                                       │
│                                                                  │
│  Cantidad:   3                                   [default]       │
│  Diametro:   ∅16mm (5/8")                        [default]       │
│  Largo:      40mm                                [default]       │
│  Perforacion:Alargadas                           [default]       │
│                                                                  │
│  SOLDADURA (platina → viga)                                      │
│  ─────────────────────────                                       │
│                                                                  │
│  Longitud:   2 * (ancho + largo)                 [auto] mm       │
│  Filete:     6 mm                                [default]       │
│  Volumen:    longitud * (filete² / 2)            [auto] mm³      │
│  Peso:       volumen * 0.00000785                [auto] kg       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Ejemplo: IPE 400

```
  Perfil IPE 400:
    h  = 400 mm     (altura)
    b  = 180 mm     (ancho alas)
    tf = 13.5 mm    (espesor ala)
    tw = 8.6 mm     (espesor alma)

  Platina:
    ancho = (180 - 13.5) / 2 = 83.25 mm
    largo = 400 - 2*13.5     = 373 mm
    peso  = 83.25 * 373 * 6 * 0.00000785 = 1.47 kg

  Soldadura:
    longitud = 2 * (83.25 + 373) = 912.5 mm
    volumen  = 912.5 * (6² / 2)  = 16,425 mm³
    peso     = 16,425 * 0.00000785 = 0.129 kg
```

---

## Arquitectura del Proyecto

```
orm-ctib/
│
├── 📁 prisma/
│   ├── schema.prisma              ← Schema de base de datos (7 modelos)
│   └── dev.db                     ← SQLite database
│
├── 📁 server/
│   └── index.js                   ← API Express (localhost:3001)
│                                   ├ 20+ endpoints REST
│                                   ├ Calculos automaticos
│                                   └ Ordenamiento por peso
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── Dashboard.tsx          ← Dashboard principal con navegacion
│   │   ├── TimelineBar.tsx        ← Barra visual de 7 etapas
│   │   └── 📁 panels/
│   │       ├── TallerPanel.tsx    ← CRUD Taller (grupos + elementos)
│   │       ├── ConexionesPanel    ← Conexiones estructurales (1722)
│   │       ├── BimPanel.tsx       ← Archivos BIM/IFC
│   │       ├── InformesPanel.tsx  ← Reportes con 3 vistas
│   │       ├── PlanosTallerPanel  ← Etapa 1: Planos
│   │       ├── CortePerforacion   ← Etapa 2: Corte
│   │       ├── ArmadoPanel.tsx    ← Etapa 3: Armado
│   │       ├── SoldaduraPanel     ← Etapa 4: Soldadura
│   │       ├── SandblastingPanel  ← Etapa 5: Sandblasting
│   │       ├── PinturaPanel.tsx   ← Etapa 6: Pintura
│   │       └── MontajePanel.tsx   ← Etapa 7: Montaje
│   │
│   ├── 📁 lib/
│   │   └── api.ts                 ← Cliente API (fetch wrapper)
│   │
│   └── App.css                    ← Estilos (print-optimized)
│
├── 📁 scripts/
│   ├── import_n18_n23.py          ← Importacion Tekla (Python)
│   ├── import_n25.py              ← Importacion bajantes
│   ├── import_3d.js               ← Importacion via API (Node)
│   ├── calcular_peso_neto.js      ← Tabla de pesos teoricos
│   └── ...                        ← 15 scripts de utilidad
│
├── 📁 public/
│   ├── Part_List_N02.txt          ← Lista de partes Tekla
│   └── bim/                       ← Archivos IFC
│
├── eslint.config.js               ← Config ESLint
├── package.json                   ← Dependencias y scripts
└── tsconfig.json                  ← Config TypeScript
```

---

## Base de Datos

### Modelos (Prisma Schema)

```
┌─────────────────────────────────────────────────────────────────┐
│                       SCHEMA PRISMA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐       ┌──────────────┐       ┌──────────┐        │
│  │  User    │       │    Grupo     │       │  Stock   │        │
│  │──────────│       │──────────────│       │──────────│        │
│  │ id       │       │ id           │       │ id       │        │
│  │ email    │       │ nombre (N01) │       │ nombre   │        │
│  │ name     │       │ elementos[]  │       │ productos│        │
│  │ activo   │       └──────┬───────┘       └────┬─────┘        │
│  └──────────┘              │                    │               │
│                            v                    v               │
│                    ┌──────────────┐       ┌──────────┐         │
│                    │ MetalElement │       │ Producto │         │
│                    │──────────────│       │──────────│         │
│                    │ id           │       │ id       │         │
│                    │ parte        │       │ perfil   │         │
│                    │ perfil       │       │ cantidad │         │
│                    │ longitud     │       │ largo    │         │
│                    │ cantidad     │       │ ancho    │         │
│                    │ peso         │       │ peso     │         │
│                    │ grupoId  ────│──┐    │ stockId──│──┐      │
│                    └──────┬───────┘  │    └──────────┘  │      │
│                           │          │                  │      │
│                           v          │                  │      │
│                    ┌──────────────┐  │                  │      │
│                    │ActividadElem.│  │                  │      │
│                    │──────────────│  │                  │      │
│                    │ id           │  │                  │      │
│                    │ tipo (1-7)   │  │                  │      │
│                    │ estado       │  │                  │      │
│                    │ datos (JSON) │  │                  │      │
│                    │ elementoId───│──┘                  │      │
│                    └──────────────┘                     │      │
│                                                         │      │
│  ┌──────────────────────────────────────────┐           │      │
│  │             Conexion                     │           │      │
│  │──────────────────────────────────────────│           │      │
│  │ vigaPrincipal, vigaSecundaria, categoria │           │      │
│  │ tipoConexion (soldada/atornillada)       │           │      │
│  │ platinaAnclaje, ancho, largo, espesor    │           │      │
│  │ numTornillos, diametro, largo            │           │      │
│  │ longitudCordon, tamanoFilete             │           │      │
│  │ volumenCordon, pesoCordon                │           │      │
│  └──────────────────────────────────────────┘           │      │
│                                                         │      │
└─────────────────────────────────────────────────────────────────┘
```

### Datos Importados — 2,051 Elementos (~590 Toneladas)

```
  Piso    Elementos    Peso (kg)     Barra de peso
  ─────────────────────────────────────────────────────────────
  N01        19         72,002        ████████████████████████████████ 
  N05       122         66,181        ██████████████████████████████ 
  N06       118         61,070        ████████████████████████████ 
  N07        75         29,700        █████████████ 
  N07a       33         16,094        ███████ 
  N08       112         28,700        ████████████ 
  N09       116         50,100        ██████████████████████ 
  N10-N18   999        250,677        ████████████████████████████████████████████████████████████████████████████████████████ 
  N19-N23   555        139,880        ████████████████████████████████████████████████████████████ 
  N24       113         28,784        ████████████ 
  ─────────────────────────────────────────────────────────────
  TOTAL   2,051       ~590,888 kg    (~590 toneladas)
```

---

## API REST — 20+ Endpoints

### Grupos y Elementos

```
  GET    /api/grupos                    Listar grupos (con actividades)
  POST   /api/grupos                    Crear grupo
  PUT    /api/grupos/:id                Actualizar grupo
  DELETE /api/grupos/:id                Eliminar grupo
  POST   /api/grupos/:id/elementos      Crear elemento
  PUT    /api/elementos/:id             Actualizar elemento
  DELETE /api/elementos/:id             Eliminar elemento
```

### Conexiones

```
  GET    /api/conexiones                Listar (ordenadas por peso)
  POST   /api/conexiones                Crear (calculo automatico)
  PUT    /api/conexiones/:id            Actualizar (recalculo auto)
  DELETE /api/conexiones/:id            Eliminar
  POST   /api/conexiones/generate-all   Generar 1722 combinaciones
```

### Usuarios

```
  GET    /api/users                     Listar usuarios
  POST   /api/users/register            Registrar usuario
  POST   /api/users/login               Login (verifica activo)
  PUT    /api/users/:id                 Actualizar
  PATCH  /api/users/:id/activo          Toggle activo/inactivo
```

### BIM / Almacen

```
  CRUD   /api/bim/...                   Archivos IFC
  CRUD   /api/stocks/...                Stocks de materiales
  CRUD   /api/productos/...             Productos
```

---

## Instalacion

### Requisitos Previos

```
┌─────────────────────────────────────────────────┐
│  REQUISITOS                                     │
│  ──────────                                     │
│                                                 │
│  ✓ Node.js v22.22+ (via nvm)                   │
│  ✓ npm 10+                                      │
│  ✓ Git                                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Setup Rapido

```bash
# 1. Clonar repositorio
git clone https://github.com/gcorrea2005/orm-ctib.git
cd orm-ctib

# 2. Instalar dependencias
npm install

# 3. Configurar base de datos
npx prisma db push

# 4. Iniciar (API + Frontend en paralelo)
npm run start
```

### Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run start` | API + Frontend en paralelo |
| `npm run server` | Solo API Express |
| `npm run dev` | Solo Frontend Vite |
| `npm run build` | Build de produccion |
| `npm run prisma:push` | Sincronizar schema con DB |

### Puertos

```
┌─────────────────────────────────────────┐
│                                         │
│  Frontend (Vite)    →  localhost:5173   │
│  API (Express)      →  localhost:3001   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Stack Tecnologico

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  FRONTEND                                                   │
│  ────────                                                   │
│  React 19 + TypeScript 5    →  UI reactiva con tipos        │
│  Vite 8                     →  Dev server ultrarapido       │
│  CSS custom                 →  Print-optimized styles       │
│                                                             │
│  BACKEND                                                    │
│  ───────                                                    │
│  Express.js 4               →  API REST ligera              │
│  Prisma 5.22                →  ORM type-safe                │
│  SQLite 3                   →  Database embebida            │
│                                                             │
│  HERRAMIENTAS                                               │
│  ────────────                                               │
│  Git + GitHub               →  Control de versiones         │
│  ESLint                     →  Linting                      │
│  Python 3                   →  Scripts de importacion       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Datos del Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Autor:         Ing. Civil Jorge Giovanni Correa Mejia      │
│                 Especialista en Estructuras Metalicas       │
│                                                             │
│  Cliente:       Consorcio Camara                            │
│  Ingeniero:     Hugo Bermudez Buitrago                      │
│  Empresa:       Estructuras Metalicas HcB                   │
│  Ubicacion:     Bogota, Colombia                            │
│  Entregables:   27 archivos IFC (BIM) via OneDrive          │
│  Version:       1.0                                         │
│  Elementos:     2,051 estructurales                         │
│  Peso total:    ~590 toneladas                              │
│  Conexiones:    1,722 combinaciones                         │
│  Pisos:         N01-N24                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Datos Importados

| Piso | Elementos | Peso (kg) |
|------|-----------|-----------|
| N01 | 19 | 72,002 |
| N05 | 122 | 66,181 |
| N06 | 118 | 61,070 |
| N07 | 75 | 29,700 |
| N07a | 33 | 16,094 |
| N08 | 112 | 28,700 |
| N09 | 116 | 50,100 |
| N10-N18 | 999 | 250,677 |
| N19-N23 | 555 | 139,880 |
| N24 | 113 | 28,784 |
| **Total** | **2,051** | **~590,888** |

---

<div align="center">

```
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   CTIB — Sistema de Gestion BIM                              ║
  ║                                                               ║
  ║   Autor: Ing. Civil Jorge Giovanni Correa Mejia              ║
  ║   Especialista en Estructuras Metalicas                      ║
  ║                                                               ║
  ║   Estructuras Metalicas HcB · Bogota, Colombia               ║
  ║   v1.0 · 2025                                                ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
```

![GitHub Stars](https://img.shields.io/github/stars/gcorrea2005/orm-ctib?style=social)
![GitHub Forks](https://img.shields.io/github/forks/gcorrea2005/orm-ctib?style=social)

</div>
