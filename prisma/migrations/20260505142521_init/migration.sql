-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Nivel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "MetalElement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parte" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "longitud" REAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "peso" REAL NOT NULL,
    "pesoTotal" REAL,
    "observaciones" TEXT,
    "nivelId" INTEGER NOT NULL,
    CONSTRAINT "MetalElement_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActividadElemento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "elementoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fechaInicio" DATETIME,
    "fechaFin" DATETIME,
    "observaciones" TEXT,
    "datos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActividadElemento_elementoId_fkey" FOREIGN KEY ("elementoId") REFERENCES "MetalElement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "perfil" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "largo" REAL NOT NULL DEFAULT 0,
    "ancho" REAL NOT NULL DEFAULT 0,
    "peso" REAL NOT NULL DEFAULT 0,
    "comentarios" TEXT,
    "stockId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Producto_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Nivel_nombre_key" ON "Nivel"("nombre");

-- CreateIndex
CREATE INDEX "ActividadElemento_elementoId_idx" ON "ActividadElemento"("elementoId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_nombre_key" ON "Stock"("nombre");
