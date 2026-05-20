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
│   Incluye Steel Builder 3D: juego interactivo de construccion con AI        │
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
│ CRUD      │ 81 cats   │ IFC files │ Docs      │ Reports   │ Stock          │
│ Grupos    │ 64 perf.  │ Upload    │ tecnicos  │ 3 vistas  │ Productos      │
│ Elementos │ Auto-calc │ Rename    │           │ Markdown  │                 │
│ 7 etapas  │ 3721 comb │ Delete    │           │ Print     │                 │
│           │           │           │           │           │                 │
└───────────┴───────────┴───────────┴───────────┴───────────┴─────────────────┘
```

| Modulo | Icono | Descripcion |
|:------:|:-----:|:------------|
| **Taller** | 🔧 | CRUD completo de grupos (pisos N01-N24) y elementos con seguimiento de 7 etapas, botonera DWG/IFC/PDF con visor 3D integrado |
| **Conexiones** | 🔩 | Gestion de conexiones estructurales: 9 familias, 81 categorias, 3,721 combinaciones con calculo automatico de placas, tornillos y soldadura |
| **BIM** | 🏗️ | Gestion de archivos IFC con upload, rename y delete para visualizacion de modelos BIM |
| **Ingenieria** | 📐 | Modulo de ingenieria para documentacion tecnica y planos |
| **Informes** | 📊 | Generacion de reportes en 3 vistas (Resumen, Detallado, Por Grupo) con exportacion a Markdown |
| **Almacen** | 📦 | Control de stock de materiales y productos con CRUD completo |

---

## Steel Builder 3D — Juego Interactivo con AI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Despues del login, el usuario entra al Steel Builder 3D:                  │
│   un entorno interactivo de construccion de estructuras metalicas           │
│   powered by Three.js + AI Assistant                                        │
│                                                                             │
│   ┌──────────┐   ┌──────────────────────────────┐   ┌──────────────┐       │
│   │          │   │                              │   │              │       │
│   │ PERFILES │   │      ESCENARIO 3D            │   │  AI ASSISTANT│       │
│   │          │   │                              │   │              │       │
│   │ IPE 200  │   │   ┌──┐  ┌──┐  ┌──┐          │   │  🤖 Analysis │       │
│   │ IPE 270  │   │   │  ├──┤  ├──┤  │          │   │  📊 Score    │       │
│   │ IPE 330  │   │   │  │  │  │  │  │          │   │  💡 Tips     │       │
│   │ HEA 240  │   │   └──┘  └──┘  └──┘          │   │  🏗️ Auto     │       │
│   │ []650x45 │   │                              │   │              │       │
│   │ HI 830   │   │   Click para colocar vigas   │   │              │       │
│   │ UPN 160  │   │   con seccion real            │   │              │       │
│   │          │   │                              │   │              │       │
│   └──────────┘   └──────────────────────────────┘   └──────────────┘       │
│                                                                             │
│   Controles: Click = colocar | Arrastrar = rotar | Scroll = zoom           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Caracteristicas del Steel Builder

| Feature | Descripcion |
|:--------|:------------|
| **14 perfiles reales** | IPE, HEA, HSS, HI, TRD, UPN con seccion transversal verdadera (ExtrudeGeometry) |
| **Snap a grilla** | Precision de 0.5m para colocacion exacta |
| **Ghost preview** | Vista previa translucida antes de colocar |
| **Modo Build/Delete** | Construir o eliminar elementos |
| **AI Assistant** | Analisis estructural en tiempo real, score 0-100, tips contextuales |
| **Auto-Build** | Genera marco de 3 niveles con animacion automatica |
| **Stats en vivo** | Elementos, peso total, perfiles usados, niveles |

### Navegacion

```
  Login ──> / (Steel Builder 3D)  ←──→  /dashboard (App principal)
                  🎮                            🏗️
```

---

## Taller — Botonera de Archivos por Elemento

Cada tarjeta de elemento en el modulo Taller incluye una botonera para acceder a los archivos de Tekla Structures:

```
┌─────────────────────────────────────────┐
│  b/40                        3 pz  ✏️🗑️ │
│  IPE 330        600 cm                  │
│  18.8 kg/un     56.4 kg                 │
│  [═══════ TimelineBar ═══════]         │
│  [ 📐DWG ] [ 🏗️IFC ] [ 📄PDF ]         │  ← Botonera de archivos
└─────────────────────────────────────────┘
```

| Boton | Archivo | Ruta |
|:-----:|:--------|:-----|
| **DWG** | Plano del nivel | `/taller/dwg/CTIB_HCB_MET_2{num}_PLA_{nivel}.dwg` |
| **IFC** | Modelo 3D (visor integrado) | `/taller/IFC_files/{parte}_Qty_{cant}.ifc` |
| **PDF** | Dato del parte | `/taller/partes/b{num} - STANDARD.pdf` |

### Visor IFC Integrado

Al hacer click en **IFC**, se abre el visor 3D integrado (mismo que el modulo BIM):

```
┌─────────────────────────────────────────┐
│  [X]  b/40 - IPE 330          🔄  🔍   │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │         MODELO 3D IFC               │ │
│ │      (rotar, zoom, click)           │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│  Propiedades: Nombre, Material, Peso... │
└─────────────────────────────────────────┘
```

### Archivos Disponibles

| Tipo | Cantidad | Formato de nombre |
|:-----|:---------|:------------------|
| **IFC** | 1,972 | `{parte}_Qty_{cantidad}.ifc` o `b_{parte}_Qty_{cantidad}.ifc` |
| **DWG** | 55 | `CTIB_HCB_MET_{code}_PLA_{nivel}.dwg` |
| **PDF** | 183 | `b{num} - STANDARD.pdf` |

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

## Perfiles Estructurales — Clasificacion por Tipo

**Total: 2,051 elementos**

| Categoria | Perfiles |
|:----------|:---------|
| **Tubos Rectangulares (HSS)** | `[]650*45`, `[]350*25`, `[]650*64`, `[]250*10`, `[]500*35`, `[]350*22`, `[]450*38`, `[]550*38`, `[]500*42`, `[]250*8`, `[]200*100*4`, `[]70*3`, `[]250*4`, `[]255*1` |
| **Perfiles IPE** | IPE140, IPE160, IPE200, IPE240, IPE270, IPE300, IPE330, IPE400, IPE450, IPE550 |
| **Perfiles H (HEA / HI / PHI)** | HEA140, HEA240, HEA400, HEA450, HEA500, HEA600, HI420, HI440, HI450, HI590, HI830, HI1130, PHI830, PHI1130 |
| **Tubos Redondos (HSS-R)** | ∅305×10, ∅406×12, ∅508×12 |
| **UPN** | UPN80, UPN160 |

### Top 10 — Mayor Cantidad de Elementos

| # | Perfil | Elementos | Piezas |
|:-:|:-------|----------:|-------:|
| 1 | IPE270 | 319 | 1,664 |
| 2 | IPE240 | 148 | 635 |
| 3 | IPE400 | 115 | 142 |
| 4 | IPE450 | 90 | 104 |
| 5 | HEA450 | 75 | 97 |
| 6 | IPE160 | 60 | 1,452 |
| 7 | IPE330 | 68 | 268 |
| 8 | IPE300 | 36 | 163 |
| 9 | UPN160 | 26 | 182 |
| 10 | IPE200 | 14 | 520 |

---

## Perfiles Soportados — 9 Familias (61 perfiles)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  IPE (Viga IPN Europea) — 10 perfiles                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ IPE 140 │ IPE 160 │ IPE 200 │ IPE 240 │ IPE 270 │ IPE 300   │  │
│  │ IPE 330 │ IPE 400 │ IPE 450 │ IPE 550                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  HEA (Viga H Ancha) — 6 perfiles                                     │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ HEA 140 │ HEA 240 │ HEA 400 │ HEA 450 │ HEA 500 │ HEA 600   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  HSS Rectangular — 14 perfiles (dominan el 42% del peso)            │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ []70x3 │ []200x100x4 │ []250x4 │ []250x8 │ []250x10 │        │  │
│  │ []255x1│ []350x22    │ []350x25│ []450x38│ []500x35 │        │  │
│  │ []500x42│ []550x38   │ []650x45│ []650x64                     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  HI (Viga H Soldada) — 9 perfiles                                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ HI 420-10│ HI 440-10│ HI 450-32│ HI 590-10│ HI 830-10│       │  │
│  │ HI 830-11│ HI 1130-5│ HI 1130-12│ HI 1130-13                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  PHI (Columna H Soldada) — 2 perfiles                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ PHI 830-44 │ PHI 1130-5                                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Tubo Cuadrado (HSS) — 8 perfiles                                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 100x100 │ 120x120 │ 150x150 │ 200x200 │ 250x250 │ 300x300   │  │
│  │ 350x350 │ 400x400                                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Tubo Redondo (HSS-R) — 9 perfiles                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 114.3x6 │ 168.3x7 │ 219.1x8 │ 273x8   │ 305x10  │ 323.9x10 │  │
│  │ 355.6x10│ 406.4x12│ 508x12                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  UPN (Canal U) — 2 perfiles                                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ UPN 80 │ UPN 160                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Placa Base — 1 perfil (soldada a viga, anclada a concreto)         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ PLACA BASE                                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Modulo de Conexiones

Sistema completo de gestion de conexiones estructurales con **3,721 combinaciones** en 9 familias de perfiles.

### Matriz de Categorias (9 x 9 = 81)

```
                  SECUNDARIA
        IPE  HEA  HSS  HI   PHI  TCD  TRD  UPN  PLB
       ┌────┬────┬────┬────┬────┬────┬────┬────┬────┐
  IPE  │ 100│ 60 │ 140│ 90 │ 20 │ 80 │ 90 │ 20 │ 10 │
       ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
  HEA  │ 60 │ 36 │ 84 │ 54 │ 12 │ 48 │ 54 │ 12 │  6 │
       ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
  HSS  │ 140│ 84 │ 196│ 126│ 28 │ 112│ 126│ 28 │ 14 │
P      ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
R  HI  │ 90 │ 54 │ 126│ 81 │ 18 │ 72 │ 81 │ 18 │  9 │
I      ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
N  PHI │ 20 │ 12 │ 28 │ 18 │  4 │ 16 │ 18 │  4 │  2 │
C      ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
I  TCD │ 80 │ 48 │ 112│ 72 │ 16 │ 64 │ 72 │ 16 │  8 │
P      ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
A  TRD │ 90 │ 54 │ 126│ 81 │ 18 │ 72 │ 81 │ 18 │  9 │
L      ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
   UPN │ 20 │ 12 │ 28 │ 18 │  4 │ 16 │ 18 │  4 │  2 │
       ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
   PLB │ 10 │  6 │ 14 │  9 │  2 │  8 │  9 │  2 │  1 │
       └────┴────┴────┴────┴────┴────┴────┴────┴────┘

  HSS = HSS Rectangular ([])    TCD = Tubo Cuadrado
  TRD = Tubo Redondo            UPN = Canal U
  PLB = Placa Base              HI/PHI = Viga H soldada
```

### Reglas de Tipo de Conexion

```
  Viga abierta como principal (IPE/HEA/HI/PHI/UPN)
    → ATORNILLADA con platina soldada
    → Platina: ancho = (b-tf)/2, largo = h-2*tf
    → Perforaciones: alargadas (default)

  Tubo como principal (HSS-RECT/TCUAD/TRDON)
    → SOLDADA directa, sin platina

  PLACA BASE como secundaria
    → SOLDADA + platina de anclaje
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
│   │       ├── ConexionesPanel    ← Conexiones (9 familias, 3721)
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
  GET    /api/conexiones                Listar todas las conexiones
  POST   /api/conexiones                Crear (calculo automatico)
  PUT    /api/conexiones/:id            Actualizar (recalculo auto)
  DELETE /api/conexiones/:id            Eliminar
  POST   /api/conexiones/generate-all   Generar 3,721 combinaciones (9x9)
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
│  Empresa:       Estructuras Metalicas HcB                   │
│  Ubicacion:     Bogota, Colombia                            │
│  Entregables:   27 archivos IFC (BIM) via OneDrive          │
│  Version:       1.0                                         │
│  Elementos:     2,051 estructurales                         │
│  Peso total:    ~590 toneladas                              │
│  Conexiones:    3,721 combinaciones                         │
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
