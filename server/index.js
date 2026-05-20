import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import path from 'path'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())

// Serve static files from Vite build (dist folder)
app.use(express.static(path.join(__dirname, '..', 'dist')))

// BIM files directory
const bimDir = path.join(__dirname, '..', 'public', 'taller', 'bim')

// Multer config for IFC uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(bimDir)) fs.mkdirSync(bimDir, { recursive: true })
    cb(null, bimDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.ifc')) cb(null, true)
    else cb(new Error('Solo archivos .ifc permitidos'))
  },
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB max
})

// API routes will be handled below...

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' })
  }
})

app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'Email ya registrado' })
    }
    const user = await prisma.user.create({
      data: { email, name }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' })
  }
})

app.post('/api/users/login', async (req, res) => {
  try {
    const { email } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { email, name, activo } = req.body
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { 
        email, 
        name,
        ...(activo !== undefined && { activo })
      }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' })
  }
})

app.patch('/api/users/:id/activo', async (req, res) => {
  try {
    const { id } = req.params
    const { activo } = req.body
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { activo }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error toggling user status' })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.user.delete({ where: { id: Number(id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' })
  }
})

// Grupos
app.get('/api/grupos', async (req, res) => {
  try {
    const grupos = await prisma.nivel.findMany({
      include: { 
        elementos: {
          include: {
            actividades: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    })
    res.json(grupos)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching grupos' })
  }
})

app.post('/api/grupos', async (req, res) => {
  try {
    const { nombre, descripcion, activoInformes } = req.body
    const grupo = await prisma.nivel.create({
      data: { 
        nombre,
        descripcion: descripcion || null,
        activoInformes: activoInformes !== undefined ? activoInformes : true
      },
      include: { elementos: true }
    })
    res.json(grupo)
  } catch (error) {
    res.status(500).json({ error: 'Error creating grupo' })
  }
})

app.delete('/api/grupos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const grupoId = Number(id)
    
    // Obtener elementos del grupo
    const elementos = await prisma.metalElement.findMany({
      where: { nivelId: grupoId },
      select: { id: true }
    })
    
    const elementoIds = elementos.map(el => el.id)
    
    // Eliminar actividades de los elementos
    if (elementoIds.length > 0) {
      await prisma.actividadElemento.deleteMany({
        where: { elementoId: { in: elementoIds } }
      })
    }
    
    // Eliminar elementos
    await prisma.metalElement.deleteMany({
      where: { nivelId: grupoId }
    })
    
    // Eliminar grupo
    await prisma.nivel.delete({ where: { id: grupoId } })
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting grupo', details: error.message })
  }
})

// Actualizar grupo (PUT)
app.put('/api/grupos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, activoInformes } = req.body
    
    const grupo = await prisma.nivel.update({
      where: { id: Number(id) },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(activoInformes !== undefined && { activoInformes })
      },
      include: { elementos: true }
    })
    
    res.json(grupo)
  } catch (error) {
    res.status(500).json({ error: 'Error updating grupo', details: error.message })
  }
})

// Elementos
app.post('/api/grupos/:grupoId/elementos', async (req, res) => {
  try {
    const { grupoId } = req.params
    const { parte, perfil, longitud, cantidad, peso, observaciones } = req.body
    
    // Crear elemento
    const pesoNum = Number(peso)
    const cantidadNum = Number(cantidad)
    const pesoTotalNum = pesoNum * cantidadNum
    const elemento = await prisma.metalElement.create({
      data: {
        parte,
        perfil,
        longitud: Number(longitud),
        cantidad: cantidadNum,
        peso: pesoNum,
        pesoTotal: pesoTotalNum,
        observaciones,
        nivelId: Number(grupoId)
      }
    })
    
    // Crear las 7 actividades visibles (sin entrega, sin INFO, sin Almacenamiento)
    const actividades = [
      { tipo: 'Planos', orden: 1 },
      { tipo: 'Corte', orden: 2 },
      { tipo: 'Armado', orden: 3 },
      { tipo: 'Soldadura', orden: 4 },
      { tipo: 'Sandblasting', orden: 5 },
      { tipo: 'Pintura', orden: 6 },
      { tipo: 'Montaje', orden: 7 }
    ]
    
    await prisma.actividadElemento.createMany({
      data: actividades.map(act => ({
        elementoId: elemento.id,
        tipo: act.tipo,
        orden: act.orden,
        estado: 'pendiente'
      }))
    })
    
    // Retornar elemento con sus actividades
    const elementoCompleto = await prisma.metalElement.findUnique({
      where: { id: elemento.id },
      include: { actividades: true }
    })
    
    res.json(elementoCompleto)
  } catch (error) {
    res.status(500).json({ error: 'Error creating elemento' })
  }
})

app.put('/api/elementos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    // Si se actualiza peso o cantidad, recalcular pesoTotal
    if (data.peso !== undefined || data.cantidad !== undefined) {
      const current = await prisma.metalElement.findUnique({ where: { id: Number(id) } })
      if (!current) {
        return res.status(404).json({ error: 'Elemento no encontrado' })
      }
      const peso = data.peso !== undefined ? Number(data.peso) : current.peso
      const cantidad = data.cantidad !== undefined ? Number(data.cantidad) : current.cantidad
      data.pesoTotal = peso * cantidad
    }
    const elemento = await prisma.metalElement.update({
      where: { id: Number(id) },
      data
    })
    res.json(elemento)
  } catch (error) {
    res.status(500).json({ error: 'Error updating elemento' })
  }
})

app.delete('/api/elementos/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.metalElement.delete({ where: { id: Number(id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting elemento' })
  }
})

// Actividades de Elementos
app.get('/api/elementos/:id/actividades', async (req, res) => {
  try {
    const { id } = req.params
    const actividades = await prisma.actividadElemento.findMany({
      where: { elementoId: Number(id) },
      orderBy: { orden: 'asc' }
    })
    res.json(actividades)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching actividades' })
  }
})

app.put('/api/actividades/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { estado, fechaInicio, fechaFin, observaciones, datos } = req.body
    
    const updateData = {}
    if (estado !== undefined) updateData.estado = estado
    if (fechaInicio !== undefined) updateData.fechaInicio = fechaInicio ? new Date(fechaInicio) : null
    if (fechaFin !== undefined) updateData.fechaFin = fechaFin ? new Date(fechaFin) : null
    if (observaciones !== undefined) updateData.observaciones = observaciones
    if (datos !== undefined) updateData.datos = datos // string JSON
    
    const actividad = await prisma.actividadElemento.update({
      where: { id: Number(id) },
      data: updateData
    })
    res.json(actividad)
  } catch (error) {
    res.status(500).json({ error: 'Error updating actividad' })
  }
})

// Inicializar grupos por defecto
async function initDB() {
  const countGrupos = await prisma.nivel.count()
  if (countGrupos === 0) {
    const grupos = [
      ...Array.from({ length: 25 }, (_, i) => ({ nombre: `N${String(i + 1).padStart(2, '0')}` }))
    ]
    for (const g of grupos) {
      await prisma.nivel.create({ data: g })
    }
    console.log('Grupos inicializados')
  }
}

// Stock endpoints - using Prisma
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      include: { productos: true },
      orderBy: { nombre: 'asc' }
    })
    res.json(stocks)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stocks' })
  }
})

app.post('/api/stocks', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body
    const stock = await prisma.stock.create({
      data: { nombre, descripcion: descripcion || null },
      include: { productos: true }
    })
    res.json(stock)
  } catch (error) {
    res.status(500).json({ error: 'Error creating stock' })
  }
})

app.put('/api/stocks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion } = req.body
    const stock = await prisma.stock.update({
      where: { id: Number(id) },
      data: { nombre, descripcion: descripcion || null }
    })
    res.json(stock)
  } catch (error) {
    res.status(500).json({ error: 'Error updating stock' })
  }
})

app.delete('/api/stocks/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.stock.delete({ where: { id: Number(id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting stock' })
  }
})

// Productos
app.get('/api/stocks/:stockId/productos', async (req, res) => {
  try {
    const { stockId } = req.params
    const productos = await prisma.producto.findMany({
      where: { stockId: Number(stockId) },
      orderBy: { createdAt: 'desc' }
    })
    res.json(productos)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching productos' })
  }
})

app.post('/api/stocks/:stockId/productos', async (req, res) => {
  try {
    const { stockId } = req.params
    const { perfil, cantidad, largo, ancho, peso, comentarios } = req.body
    const producto = await prisma.producto.create({
      data: {
        perfil,
        cantidad: Number(cantidad) || 0,
        largo: Number(largo) || 0,
        ancho: Number(ancho) || 0,
        peso: Number(peso) || 0,
        comentarios: comentarios || null,
        stockId: Number(stockId)
      }
    })
    res.json(producto)
  } catch (error) {
    res.status(500).json({ error: 'Error creating producto' })
  }
})

app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { perfil, cantidad, largo, ancho, peso, comentarios } = req.body
    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        perfil,
        cantidad,
        largo,
        ancho,
        peso,
        comentarios: comentarios || null
      }
    })
    res.json(producto)
  } catch (error) {
    res.status(500).json({ error: 'Error updating producto' })
  }
})

app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.producto.delete({ where: { id: Number(id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting producto' })
  }
})

// Conexiones helpers
const ALL_FAMILIES = ['IPE', 'HEA', 'HSS-RECT', 'HI', 'PHI', 'TUBO CUADRADO', 'TUBO REDONDO', 'UPN', 'PLACA BASE']
const ABIERTOS = ['IPE', 'HEA', 'HI', 'PHI', 'UPN'] // perfiles de seccion abierta (atornillables)

// Generar todas las combinaciones de categorias (9x9 = 81)
const CONEXION_CATEGORIAS = []
for (const p of ALL_FAMILIES) {
  for (const s of ALL_FAMILIES) {
    CONEXION_CATEGORIAS.push({ cat: `${p}-${s}`, p, s })
  }
}

// Dimensiones estandar de perfiles (mm): h=altura, b=ancho, tf=espesor ala
const PERFIL_DIM = {
  // IPE
  'IPE 140': { h: 140, b: 73, tf: 6.9 },
  'IPE 160': { h: 160, b: 82, tf: 7.4 },
  'IPE 200': { h: 200, b: 100, tf: 8.5 },
  'IPE 240': { h: 240, b: 120, tf: 9.8 },
  'IPE 270': { h: 270, b: 135, tf: 10.2 },
  'IPE 300': { h: 300, b: 150, tf: 10.7 },
  'IPE 330': { h: 330, b: 160, tf: 11.5 },
  'IPE 400': { h: 400, b: 180, tf: 13.5 },
  'IPE 450': { h: 450, b: 190, tf: 14.6 },
  'IPE 550': { h: 550, b: 210, tf: 17.2 },
  // HEA
  'HEA 140': { h: 140, b: 140, tf: 7 },
  'HEA 240': { h: 240, b: 240, tf: 12 },
  'HEA 400': { h: 400, b: 300, tf: 19 },
  'HEA 450': { h: 450, b: 300, tf: 21 },
  'HEA 500': { h: 500, b: 300, tf: 23 },
  'HEA 600': { h: 600, b: 300, tf: 25 },
  // HI (vigas H soldadas, estilo W shapes)
  'HI 420-10': { h: 420, b: 400, tf: 10 },
  'HI 440-10': { h: 440, b: 400, tf: 10 },
  'HI 450-32': { h: 450, b: 420, tf: 32 },
  'HI 590-10': { h: 590, b: 500, tf: 10 },
  'HI 830-10': { h: 830, b: 600, tf: 10 },
  'HI 830-11': { h: 830, b: 600, tf: 11 },
  'HI 1130-5': { h: 1130, b: 600, tf: 5 },
  'HI 1130-12': { h: 1130, b: 600, tf: 12 },
  'HI 1130-13': { h: 1130, b: 600, tf: 13 },
  // PHI
  'PHI 830-44': { h: 830, b: 600, tf: 44 },
  'PHI 1130-5': { h: 1130, b: 600, tf: 5 },
  // HSS Rectangulares (tubos cuadrados/rectangulares)
  '[]70x3': { h: 70, b: 70, tf: 3 },
  '[]200x100x4': { h: 200, b: 100, tf: 4 },
  '[]250x4': { h: 250, b: 250, tf: 4 },
  '[]250x8': { h: 250, b: 250, tf: 8 },
  '[]250x10': { h: 250, b: 250, tf: 10 },
  '[]255x1': { h: 255, b: 255, tf: 1 },
  '[]350x22': { h: 350, b: 350, tf: 22 },
  '[]350x25': { h: 350, b: 350, tf: 25 },
  '[]450x38': { h: 450, b: 450, tf: 38 },
  '[]500x35': { h: 500, b: 500, tf: 35 },
  '[]500x42': { h: 500, b: 500, tf: 42 },
  '[]550x38': { h: 550, b: 550, tf: 38 },
  '[]650x45': { h: 650, b: 650, tf: 45 },
  '[]650x64': { h: 650, b: 650, tf: 64 },
  // UPN (canal U)
  'UPN 80': { h: 80, b: 45, tf: 6 },
  'UPN 160': { h: 160, b: 65, tf: 7.5 },
}

const PERFILES_FAMILIA = {
  'IPE': ['IPE 140','IPE 160','IPE 200','IPE 240','IPE 270','IPE 300','IPE 330','IPE 400','IPE 450','IPE 550'],
  'HEA': ['HEA 140','HEA 240','HEA 400','HEA 450','HEA 500','HEA 600'],
  'HSS-RECT': ['[]70x3','[]200x100x4','[]250x4','[]250x8','[]250x10','[]255x1','[]350x22','[]350x25','[]450x38','[]500x35','[]500x42','[]550x38','[]650x45','[]650x64'],
  'HI': ['HI 420-10','HI 440-10','HI 450-32','HI 590-10','HI 830-10','HI 830-11','HI 1130-5','HI 1130-12','HI 1130-13'],
  'PHI': ['PHI 830-44','PHI 1130-5'],
  'TUBO CUADRADO': ['TUBO CUADRADO 100x100','TUBO CUADRADO 120x120','TUBO CUADRADO 150x150','TUBO CUADRADO 200x200','TUBO CUADRADO 250x250','TUBO CUADRADO 300x300','TUBO CUADRADO 350x350','TUBO CUADRADO 400x400'],
  'TUBO REDONDO': ['TUBO REDONDO 114.3x6','TUBO REDONDO 168.3x7','TUBO REDONDO 219.1x8','TUBO REDONDO 273x8','TUBO REDONDO 305x10','TUBO REDONDO 323.9x10','TUBO REDONDO 355.6x10','TUBO REDONDO 406.4x12','TUBO REDONDO 508x12'],
  'UPN': ['UPN 80','UPN 160'],
  'PLACA BASE': ['PLACA BASE'],
}

function getDimLibres(perfil) {
  const dim = PERFIL_DIM[perfil]
  if (!dim) return { ancho: null, largo: null }
  return {
    ancho: Math.round((dim.b - dim.tf) / 2 * 10) / 10,
    largo: Math.round((dim.h - 2 * dim.tf) * 10) / 10
  }
}

function calcPesoPlatina(ancho, largo, espesor) {
  if (!ancho || !largo || !espesor) return null
  return Math.round(ancho * largo * espesor * 0.00000785 * 100) / 100
}

function calcCordon(longitud, filete) {
  if (!longitud || !filete) return { volumen: null, peso: null }
  const volumen = Math.round(longitud * (filete * filete) / 2 * 100) / 100
  const peso = Math.round(volumen * 0.00000785 * 10000) / 10000
  return { volumen, peso }
}

function getFamilia(perfil) {
  if (perfil.startsWith('IPE')) return 'IPE'
  if (perfil.startsWith('HEA')) return 'HEA'
  if (perfil.startsWith('HI ')) return 'HI'
  if (perfil.startsWith('PHI ')) return 'PHI'
  if (perfil.startsWith('[]')) return 'HSS-RECT'
  if (perfil.startsWith('TUBO CUADRADO')) return 'TUBO CUADRADO'
  if (perfil.startsWith('TUBO REDONDO')) return 'TUBO REDONDO'
  if (perfil.startsWith('UPN')) return 'UPN'
  if (perfil === 'PLACA BASE') return 'PLACA BASE'
  return ''
}

function calcCategoria(principal, secundaria) {
  const fP = getFamilia(principal)
  const fS = getFamilia(secundaria)
  if (!fP || !fS) return null
  const combo = CONEXION_CATEGORIAS.find(c => c.p === fP && c.s === fS)
  return combo ? combo.cat : null
}

// Conexiones
app.get('/api/conexiones', async (req, res) => {
  try {
    const conexiones = await prisma.conexion.findMany()
    // Ordenar de mas pesado a mas liviano por familia y tamaño
    const familiaOrder = { 'HEA': 0, 'IPE': 1, 'TUBO CUADRADO': 2, 'TUBO REDONDO': 3, 'PLACA BASE': 4 }
    function getNum(p) { const m = p.match(/[\d.]+/); return m ? parseFloat(m[0]) : 0 }
    function getFam(p) { return p.startsWith('HEA') ? 'HEA' : p.startsWith('IPE') ? 'IPE' : p.startsWith('TUBO CUADRADO') ? 'TUBO CUADRADO' : p.startsWith('TUBO REDONDO') ? 'TUBO REDONDO' : 'PLACA BASE' }
    conexiones.sort((a, b) => {
      const fa = familiaOrder[getFam(a.vigaPrincipal)] ?? 5
      const fb = familiaOrder[getFam(b.vigaPrincipal)] ?? 5
      if (fa !== fb) return fa - fb
      const na = getNum(a.vigaPrincipal), nb = getNum(b.vigaPrincipal)
      if (na !== nb) return nb - na
      const fsa = familiaOrder[getFam(a.vigaSecundaria)] ?? 5
      const fsb = familiaOrder[getFam(b.vigaSecundaria)] ?? 5
      if (fsa !== fsb) return fsa - fsb
      return getNum(b.vigaSecundaria) - getNum(a.vigaSecundaria)
    })
    res.json(conexiones)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching conexiones' })
  }
})

app.post('/api/conexiones', async (req, res) => {
  try {
    const { vigaPrincipal, vigaSecundaria, tipoConexion, platinaAnclaje, anchoPlatina, largoPlatina, espesorPlatina, perforaciones, numTornillos, diametroTornillo, largoTornillo, longitudCordon, tamanoFilete, observaciones } = req.body
    const categoria = calcCategoria(vigaPrincipal, vigaSecundaria)
    const cordon = calcCordon(Number(longitudCordon), Number(tamanoFilete))
    const conexion = await prisma.conexion.create({
      data: {
        vigaPrincipal,
        vigaSecundaria,
        categoria,
        tipoConexion,
        platinaAnclaje: platinaAnclaje ?? false,
        anchoPlatina: anchoPlatina ? Number(anchoPlatina) : null,
        largoPlatina: largoPlatina ? Number(largoPlatina) : null,
        espesorPlatina: espesorPlatina ? Number(espesorPlatina) : null,
        pesoPlatina: calcPesoPlatina(Number(anchoPlatina), Number(largoPlatina), Number(espesorPlatina)),
        perforaciones: perforaciones || null,
        numTornillos: numTornillos ? Number(numTornillos) : null,
        diametroTornillo: diametroTornillo ? Number(diametroTornillo) : null,
        largoTornillo: largoTornillo ? Number(largoTornillo) : null,
        longitudCordon: longitudCordon ? Number(longitudCordon) : null,
        tamanoFilete: tamanoFilete ? Number(tamanoFilete) : null,
        volumenCordon: cordon.volumen,
        pesoCordon: cordon.peso,
        observaciones: observaciones || null
      }
    })
    res.json(conexion)
  } catch (error) {
    res.status(500).json({ error: 'Error creating conexion' })
  }
})

app.put('/api/conexiones/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { vigaPrincipal, vigaSecundaria, tipoConexion, platinaAnclaje, anchoPlatina, largoPlatina, espesorPlatina, perforaciones, numTornillos, diametroTornillo, largoTornillo, longitudCordon, tamanoFilete, observaciones } = req.body
    // Recalcular categoria si cambian las vigas
    let categoria
    if (vigaPrincipal !== undefined || vigaSecundaria !== undefined) {
      const existing = await prisma.conexion.findUnique({ where: { id: Number(id) } })
      const p = vigaPrincipal ?? existing.vigaPrincipal
      const s = vigaSecundaria ?? existing.vigaSecundaria
      categoria = calcCategoria(p, s)
    }
    // Recalcular peso platina si cambian dimensiones
    let pesoPlatina
    if (anchoPlatina !== undefined || largoPlatina !== undefined || espesorPlatina !== undefined) {
      const existing = await prisma.conexion.findUnique({ where: { id: Number(id) } })
      const a = anchoPlatina !== undefined ? Number(anchoPlatina) : existing.anchoPlatina
      const l = largoPlatina !== undefined ? Number(largoPlatina) : existing.largoPlatina
      const e = espesorPlatina !== undefined ? Number(espesorPlatina) : existing.espesorPlatina
      pesoPlatina = calcPesoPlatina(a, l, e)
    }
    // Recalcular cordón si cambian longitud o filete
    let volumenCordon, pesoCordon
    if (longitudCordon !== undefined || tamanoFilete !== undefined) {
      const existing = await prisma.conexion.findUnique({ where: { id: Number(id) } })
      const lo = longitudCordon !== undefined ? Number(longitudCordon) : existing.longitudCordon
      const fi = tamanoFilete !== undefined ? Number(tamanoFilete) : existing.tamanoFilete
      const c = calcCordon(lo, fi)
      volumenCordon = c.volumen
      pesoCordon = c.peso
    }
    const conexion = await prisma.conexion.update({
      where: { id: Number(id) },
      data: {
        ...(vigaPrincipal !== undefined && { vigaPrincipal }),
        ...(vigaSecundaria !== undefined && { vigaSecundaria }),
        ...(categoria !== undefined && { categoria }),
        ...(tipoConexion !== undefined && { tipoConexion }),
        ...(platinaAnclaje !== undefined && { platinaAnclaje }),
        ...(anchoPlatina !== undefined && { anchoPlatina: anchoPlatina ? Number(anchoPlatina) : null }),
        ...(largoPlatina !== undefined && { largoPlatina: largoPlatina ? Number(largoPlatina) : null }),
        ...(espesorPlatina !== undefined && { espesorPlatina: espesorPlatina ? Number(espesorPlatina) : null }),
        ...(pesoPlatina !== undefined && { pesoPlatina }),
        ...(perforaciones !== undefined && { perforaciones: perforaciones || null }),
        ...(numTornillos !== undefined && { numTornillos: numTornillos ? Number(numTornillos) : null }),
        ...(diametroTornillo !== undefined && { diametroTornillo: diametroTornillo ? Number(diametroTornillo) : null }),
        ...(largoTornillo !== undefined && { largoTornillo: largoTornillo ? Number(largoTornillo) : null }),
        ...(longitudCordon !== undefined && { longitudCordon: longitudCordon ? Number(longitudCordon) : null }),
        ...(tamanoFilete !== undefined && { tamanoFilete: tamanoFilete ? Number(tamanoFilete) : null }),
        ...(volumenCordon !== undefined && { volumenCordon }),
        ...(pesoCordon !== undefined && { pesoCordon }),
        ...(observaciones !== undefined && { observaciones: observaciones || null })
      }
    })
    res.json(conexion)
  } catch (error) {
    res.status(500).json({ error: 'Error updating conexion' })
  }
})

app.delete('/api/conexiones/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.conexion.delete({ where: { id: Number(id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting conexion' })
  }
})

app.post('/api/conexiones/generate-all', async (req, res) => {
  try {
    const existing = await prisma.conexion.findMany({ select: { vigaPrincipal: true, vigaSecundaria: true } })
    const existingSet = new Set(existing.map(e => `${e.vigaPrincipal}||${e.vigaSecundaria}`))

    const records = []
    for (const combo of CONEXION_CATEGORIAS) {
      const principals = PERFILES_FAMILIA[combo.p] || []
      const secondaries = PERFILES_FAMILIA[combo.s] || []
      for (const pr of principals) {
        for (const sec of secondaries) {
          const key = `${pr}||${sec}`
          if (existingSet.has(key)) continue
          const dim = getDimLibres(pr)
          const esPlatina = combo.s === 'PLACA BASE'
          const esAbiertoP = ABIERTOS.includes(combo.p)
          // Viga abierta -> atornillada con platina; Tubo -> soldada; PLACA BASE -> soldada
          const tipo = esPlatina ? 'soldada' : (esAbiertoP ? 'atornillada' : 'soldada')
          const conPlatina = esPlatina || esAbiertoP
          records.push({
            vigaPrincipal: pr,
            vigaSecundaria: sec,
            categoria: combo.cat,
            tipoConexion: tipo,
            platinaAnclaje: conPlatina,
            anchoPlatina: conPlatina ? dim.ancho : null,
            largoPlatina: conPlatina ? dim.largo : null,
            perforaciones: conPlatina ? 'alargadas' : null,
            longitudCordon: conPlatina ? Math.round(2 * ((dim.largo || 0) + 2 * (dim.ancho || 0)) * 10) / 10 : null,
            tamanoFilete: conPlatina ? 6 : null,
            numTornillos: conPlatina ? 3 : null,
            diametroTornillo: conPlatina ? 16 : null,
            largoTornillo: conPlatina ? 38 : null,
            volumenCordon: conPlatina && dim.ancho && dim.largo ? Math.round(Math.round(2 * (dim.largo + 2 * dim.ancho) * 10) / 10 * 36 / 2 * 100) / 100 : null,
            pesoCordon: conPlatina && dim.ancho && dim.largo ? Math.round(Math.round(2 * (dim.largo + 2 * dim.ancho) * 10) / 10 * 36 / 2 * 0.00000785 * 10000) / 10000 : null,
          })
        }
      }
    }

    if (records.length === 0) {
      return res.json({ count: 0, message: 'Todas las combinaciones ya existen' })
    }

    const result = await prisma.$transaction(
      records.map(r => prisma.conexion.create({ data: r }))
    )
    res.json({ count: result.length, message: `${result.length} conexiones generadas` })
  } catch (error) {
    console.error('Error generating conexiones:', error)
    res.status(500).json({ error: 'Error generating conexiones' })
  }
})

// BIM Files API
app.get('/api/bim-files', (req, res) => {
  try {
    if (!fs.existsSync(bimDir)) return res.json([])
    const files = fs.readdirSync(bimDir)
      .filter(f => f.toLowerCase().endsWith('.ifc'))
      .map((f, i) => {
        const stat = fs.statSync(path.join(bimDir, f))
        const sizeKB = stat.size / 1024
        let tamano
        if (sizeKB >= 1024) tamano = (sizeKB / 1024).toFixed(1) + ' MB'
        else if (sizeKB >= 1) tamano = Math.round(sizeKB) + ' KB'
        else tamano = Math.round(stat.size) + ' B'
        return { id: i, nombre: f, codigo: f.replace(/\.ifc$/i, ''), path: '/taller/bim/' + f, tamano, bytes: stat.size, mtime: stat.mtimeMs }
      })
    function sortKey(c) {
      if (c.startsWith('CTIB-HCB')) return '00_' + c
      if (c.startsWith('N0')) return '01_' + c.padStart(10, '0')
      if (c.startsWith('COL') || c.startsWith('col') || (c.startsWith('c_') && !/[AB]_\d/.test(c))) return '02_' + c
      if (c === '01' || c === 'b43') return '03_' + c
      return '09_' + c
    }
    files.sort((a, b) => sortKey(a.codigo).localeCompare(sortKey(b.codigo)))
    files.forEach((f, i) => f.id = i)
    res.json(files)
  } catch (error) {
    res.status(500).json({ error: 'Error listing BIM files' })
  }
})

app.post('/api/bim/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    res.json({ success: true, filename: req.file.originalname, size: req.file.size })
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' })
  }
})

app.delete('/api/bim/:filename', (req, res) => {
  try {
    const filePath = path.join(bimDir, req.params.filename)
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' })
    fs.unlinkSync(filePath)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' })
  }
})

app.put('/api/bim/rename', (req, res) => {
  try {
    const { oldName, newName } = req.body
    if (!oldName || !newName) return res.status(400).json({ error: 'Missing oldName or newName' })
    const oldPath = path.join(bimDir, oldName)
    const newNameFixed = newName.toLowerCase().endsWith('.ifc') ? newName : newName + '.ifc'
    const newPath = path.join(bimDir, newNameFixed)
    if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'File not found' })
    if (fs.existsSync(newPath)) return res.status(409).json({ error: 'File already exists' })
    fs.renameSync(oldPath, newPath)
    res.json({ success: true, oldName, newName: newNameFixed })
  } catch (error) {
    res.status(500).json({ error: 'Error renaming file' })
  }
})

// Catch-all handler for SPA (serve index.html for all non-API routes)
app.get(/.*/, (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
  } else {
    res.status(404).json({ error: 'API route not found' })
  }
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`)
  })
})