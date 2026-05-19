import express from 'express'
import cors from 'cors'
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