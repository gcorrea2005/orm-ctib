<div align="center">

# CTIB

### Sistema de Gestion BIM para Estructuras Metalicas

_Una plataforma integral para el diseno, fabricacion y seguimiento de estructuras metalicas
desde el taller hasta la obra._

![Node.js](https://img.shields.io/badge/Node.js-22.22-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)

---

</div>

## Que es CTIB?

**CTIB** es un sistema de gestion BIM desarrollado para **Estructuras Metalicas HcB** (Bogota, Colombia)
que permite acompanar el ciclo de vida completo de elementos estructurales metalicos,
desde la planificacion en taller hasta el montaje en obra.

El sistema esta disenado para equipos de ingenieria civil y metalica que necesitan
control total sobre fabricacion, avance de etapas, inventario y documentacion tecnica.

---

## Modulos Principales

| Modulo | Descripcion |
|:------:|:------------|
| **Taller** | CRUD completo de grupos (pisos N01-N24) y elementos estructurales con seguimiento de 7 etapas de produccion |
| **Conexiones** | Gestion de conexiones estructurales (soldadas y atornilladas) con calculo automatico de placas, tornillos y soldadura |
| **BIM** | Gestion de archivos IFC con upload, rename y delete para visualizacion de modelos BIM |
| **Ingenieria** | Modulo de ingenieria para documentacion tecnica |
| **Informes** | Generacion de reportes en 3 vistas (Resumen, Detallado, Por Grupo) con exportacion a Markdown |
| **Almacen** | Control de stock de materiales y productos |

---

## Timeline de Produccion (7 Etapas)

Cada elemento estructural sigue un ciclo de 7 etapas visuales:

```
 [1]         [2]         [3]         [4]         [5]         [6]         [7]
Planos -> Corte -> Armado -> Soldadura -> Sand -> Pintura -> Montaje
  📐        ✂️        🔧         🔥         🌪️       🎨        🏗️
```

- **Verde**: Completado
- **Azul**: En proceso
- **Gris**: Pendiente

Al hacer clic en cada etapa se abre un modal con formulario especifico
para registrar datos, actualizar estado y completar la etapa.

---

## Modulo de Conexiones

Sistema completo de gestion de conexiones estructurales con **20 categorias** de combinacion.

### Matriz de Combinaciones (4x5)

| | IPE | HEA | Tubo Cuadrado | Tubo Redondo | Placa Base |
|---|:---:|:---:|:---:|:---:|:---:|
| **IPE** | IPE-IPE | IPE-HEA | IPE-TCUAD | IPE-TRDON | IPE-PLBASE |
| **HEA** | HEA-IPE | HEA-HEA | HEA-TCUAD | HEA-TRDON | HEA-PLBASE |
| **Tubo Cuadrado** | TCUAD-IPE | TCUAD-HEA | TCUAD-TCUAD | TCUAD-TRDON | TCUAD-PLBASE |
| **Tubo Redondo** | TRDON-IPE | TRDON-HEA | TRDON-TCUAD | TRDON-TRDON | TRDON-PLBASE |

### Perfiles Soportados (25)

| Familia | Perfiles |
|---------|----------|
| **IPE** | IPE 200, 240, 270, 300, 330, 360, 400, 450, 500, 550, 600 |
| **HEA** | HEA 200, 220, 240, 260, 280, 300, 320, 340, 360, 400, 450, 500, 550, 600 |
| **Tubo Cuadrado** | 100x100 a 400x400 |
| **Tubo Redondo** | 114.3x6 a 406.4x12 |

### Calculos Automaticos

| Campo | Formula |
|-------|---------|
| **Ancho platina** | `(b - tf) / 2` (mm) |
| **Largo platina** | `h - 2 * tf` (altura libre entre alas) |
| **Peso platina** | `ancho * largo * espesor * 7850 kg/m3` |
| **Volumen soldadura** | `longitud * (filete^2 / 2)` (mm3) |
| **Peso soldadura** | `volumen * 0.00000785 kg/mm3` |
| **Cordon** | `2 * (ancho + largo)` (perimetro de platina) |

### Datos por Defecto

| Campo | Valor |
|-------|-------|
| Espesor platina | 6 mm |
| Tornillos | 3 x ∅16mm x 40mm |
| Perforaciones | Alargadas |
| Filete soldadura | 6 mm |

---

## Arquitectura

```
orm-ctib/
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   └── dev.db                 # SQLite database
├── server/
│   └── index.js               # API Express (localhost:3001)
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   ├── TimelineBar.tsx    # Barra visual de 7 etapas
│   │   └── panels/
│   │       ├── TallerPanel.tsx         # CRUD Taller
│   │       ├── ConexionesPanel.tsx     # Conexiones estructurales
│   │       ├── BimPanel.tsx            # Archivos BIM/IFC
│   │       ├── InformesPanel.tsx       # Reportes
│   │       ├── PlanosTallerPanel.tsx   # Etapa 1
│   │       ├── CortePerforacionPanel   # Etapa 2
│   │       ├── ArmadoPanel.tsx         # Etapa 3
│   │       ├── SoldaduraPanel.tsx      # Etapa 4
│   │       ├── SandblastingPanel.tsx   # Etapa 5
│   │       ├── PinturaPanel.tsx        # Etapa 6
│   │       └── MontajePanel.tsx        # Etapa 7
│   ├── lib/
│   │   └── api.ts             # Cliente API
│   └── App.css                # Estilos optimizados para impresion
├── scripts/
│   └── import_n18_n23.py      # Importacion de datos Tekla Structures
└── public/
    └── Part_List_N02.txt      # Lista de partes Tekla (304 lineas)
```

---

## Base de Datos

### Modelos Principales

| Modelo | Descripcion |
|--------|-------------|
| **User** | Usuarios del sistema (email, nombre, activo) |
| **Grupo** | Grupos/pisos (N01-N24, ~2051 elementos, ~590 toneladas) |
| **MetalElement** | Elementos estructurales (parte, perfil, longitud, cantidad, peso) |
| **ActividadElemento** | Seguimiento de 7 etapas por elemento |
| **Conexion** | Conexiones estructurales con calculos de platina y soldadura |
| **Stock** | Almacenes de materiales |
| **Producto** | Productos en stock (perfil, cantidad, dimensiones) |

### Datos Importados

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

## API Endpoints

### Grupos y Elementos

| Metodo | URL | Descripcion |
|--------|-----|-------------|
| `GET` | `/api/grupos` | Listar grupos (con actividades) |
| `POST` | `/api/grupos` | Crear grupo |
| `PUT` | `/api/grupos/:id` | Actualizar grupo |
| `DELETE` | `/api/grupos/:id` | Eliminar grupo |
| `POST` | `/api/grupos/:id/elementos` | Crear elemento |
| `PUT` | `/api/elementos/:id` | Actualizar elemento |
| `DELETE` | `/api/elementos/:id` | Eliminar elemento |

### Conexiones

| Metodo | URL | Descripcion |
|--------|-----|-------------|
| `GET` | `/api/conexiones` | Listar conexiones (ordenadas por peso) |
| `POST` | `/api/conexiones` | Crear conexion (calculo auto) |
| `PUT` | `/api/conexiones/:id` | Actualizar conexion (recalculo auto) |
| `DELETE` | `/api/conexiones/:id` | Eliminar conexion |
| `POST` | `/api/conexiones/generate-all` | Generar 1722 combinaciones |

### Usuarios

| Metodo | URL | Descripcion |
|--------|-----|-------------|
| `GET` | `/api/users` | Listar usuarios |
| `POST` | `/api/users/register` | Registrar |
| `POST` | `/api/users/login` | Login (verifica activo) |
| `PUT` | `/api/users/:id` | Actualizar |
| `PATCH` | `/api/users/:id/activo` | Toggle activo |

### BIM / Almacen

Full CRUD para archivos IFC, stocks y productos.

---

## Instalacion

### Requisitos

- **Node.js** v22.22+ (via nvm)
- **npm** 10+

### Setup

```bash
# Clonar repositorio
git clone https://github.com/gcorrea2005/orm-ctib.git
cd orm-ctib

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma db push

# Iniciar (API + Frontend)
npm run start
```

### Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend (Vite) | `localhost:5173` |
| API (Express) | `localhost:3001` |

### Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run start` | Inicia API + Frontend en paralelo |
| `npm run server` | Solo API Express |
| `npm run dev` | Solo Frontend Vite |
| `npm run build` | Build de produccion |
| `npm run prisma:push` | Sincronizar schema con DB |

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Frontend | React + TypeScript | 19 / 5.x |
| Bundler | Vite | 8.0 |
| Backend | Express.js | 4.x |
| ORM | Prisma | 5.22 |
| Database | SQLite | 3.x |
| Estilos | CSS custom (print-optimized) | - |

---

## Datos del Proyecto

- **Cliente**: Consorcio Camara
- **Ingeniero**: Hugo Bermudez Buitrago (Ing. Estructuras Metalicas HcB)
- **Ubicacion**: Bogota, Colombia
- **Entregables**: 27 archivos IFC (BIM) via OneDrive
- **Version**: 1.0

---

<div align="center">

**CTIB** - Bogota | Sistema de Gestion BIM | v1.0

_Estructuras Metalicas HcB_

</div>
