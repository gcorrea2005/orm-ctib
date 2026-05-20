const API_URL = 'http://localhost:3001/api'

export const api = {
  // Users
  async getUsers() {
    const res = await fetch(`${API_URL}/users`)
    return res.json()
  },

  async registerUser(email: string, name: string) {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error)
    }
    return res.json()
  },

  async loginUser(email: string) {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error)
    }
    return res.json()
  },

  async updateUser(id: number, email: string, name: string) {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    })
    return res.json()
  },

  async toggleUserActivo(id: number, activo: boolean) {
    const res = await fetch(`${API_URL}/users/${id}/activo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo })
    })
    return res.json()
  },

  async deleteUser(id: number) {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  },

  // Grupoes (usando endpoints /grupos del backend)
  async getGrupoes() {
    const res = await fetch(`${API_URL}/grupos`)
    return res.json()
  },

  async createGrupo(nombre: string, descripcion?: string, activoInformes?: boolean) {
    const res = await fetch(`${API_URL}/grupos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, activoInformes })
    })
    return res.json()
  },

  async deleteGrupo(id: number) {
    const res = await fetch(`${API_URL}/grupos/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  },

  async updateGrupo(id: number, data: { nombre?: string; descripcion?: string; activoInformes?: boolean }) {
    const res = await fetch(`${API_URL}/grupos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Elementos
  async createElemento(grupoId: number, elemento: {
    parte: string
    perfil: string
    longitud: number
    cantidad: number
    peso: number
    observaciones?: string | null
  }) {
    const res = await fetch(`${API_URL}/grupos/${grupoId}/elementos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(elemento)
    })
    return res.json()
  },

  async updateElemento(id: number, data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/elementos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async deleteElemento(id: number) {
    const res = await fetch(`${API_URL}/elementos/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  },

  // Actividades
  async getActividades(elementoId: number) {
    const res = await fetch(`${API_URL}/elementos/${elementoId}/actividades`)
    return res.json()
  },

  async updateActividad(id: number, data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/actividades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Conexiones
  async getConexiones() {
    const res = await fetch(`${API_URL}/conexiones`)
    return res.json()
  },

  async generateAllConexiones() {
    const res = await fetch(`${API_URL}/conexiones/generate-all`, { method: 'POST' })
    return res.json()
  },

  async createConexion(data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/conexiones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async updateConexion(id: number, data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/conexiones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async deleteConexion(id: number) {
    const res = await fetch(`${API_URL}/conexiones/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  },

  // Stock
  async getStocks() {
    const res = await fetch(`${API_URL}/stocks`)
    return res.json()
  },

  async createStock(nombre: string, descripcion: string) {
    const res = await fetch(`${API_URL}/stocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion })
    })
    return res.json()
  },

  async updateStock(id: number, nombre: string, descripcion: string) {
    const res = await fetch(`${API_URL}/stocks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion })
    })
    return res.json()
  },

  async deleteStock(id: number) {
    const res = await fetch(`${API_URL}/stocks/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  },

  async getProductos(stockId: number) {
    const res = await fetch(`${API_URL}/stocks/${stockId}/productos`)
    return res.json()
  },

  async createProducto(stockId: number, producto: {
    perfil: string
    cantidad: number
    largo: number
    ancho: number
    peso: number
    comentarios?: string | null
  }) {
    const res = await fetch(`${API_URL}/stocks/${stockId}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    })
    return res.json()
  },

  async updateProducto(id: number, producto: {
    perfil: string
    cantidad: number
    largo: number
    ancho: number
    peso: number
    comentarios?: string | null
  }) {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    })
    return res.json()
  },

  async deleteProducto(id: number) {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  }
}