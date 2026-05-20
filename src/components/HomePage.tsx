import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

// ─── Steel Profiles ───────────────────────────────────────────────────
const STEEL_PROFILES: Record<string, { h: number; b: number; color: string; family: string }> = {
  'IPE 200': { h: 200, b: 100, color: '#4a90d9', family: 'IPE' },
  'IPE 270': { h: 270, b: 135, color: '#4a90d9', family: 'IPE' },
  'IPE 330': { h: 330, b: 160, color: '#4a90d9', family: 'IPE' },
  'IPE 400': { h: 400, b: 180, color: '#4a90d9', family: 'IPE' },
  'IPE 450': { h: 450, b: 190, color: '#4a90d9', family: 'IPE' },
  'HEA 240': { h: 240, b: 240, color: '#e67e22', family: 'HEA' },
  'HEA 400': { h: 400, b: 300, color: '#e67e22', family: 'HEA' },
  'HEA 500': { h: 500, b: 300, color: '#e67e22', family: 'HEA' },
  '[]650x45': { h: 650, b: 650, color: '#e74c3c', family: 'HSS' },
  '[]350x25': { h: 350, b: 350, color: '#e74c3c', family: 'HSS' },
  'HI 830-10': { h: 830, b: 600, color: '#9b59b6', family: 'HI' },
  '∅305x10': { h: 305, b: 305, color: '#2ecc71', family: 'TRD' },
  '∅406x12': { h: 406, b: 406, color: '#2ecc71', family: 'TRD' },
  'UPN 160': { h: 160, b: 65, color: '#f39c12', family: 'UPN' },
}

type Beam = {
  id: number
  start: THREE.Vector3
  end: THREE.Vector3
  profile: string
  mesh: THREE.Mesh
  length: number
  weight: number
}

type AIMessage = {
  role: 'ai' | 'user'
  text: string
  type?: 'info' | 'success' | 'warning' | 'tip'
}

// ─── Helpers ──────────────────────────────────────────────────────────
function getBeamWeight(profile: string, length: number): number {
  const weights: Record<string, number> = {
    'IPE 200': 22.4, 'IPE 270': 36.1, 'IPE 330': 49.1, 'IPE 400': 57.4, 'IPE 450': 65.2,
    'HEA 240': 60.3, 'HEA 400': 125.1, 'HEA 500': 155.3, '[]650x45': 850, '[]350x25': 250,
    'HI 830-10': 198, '∅305x10': 71.4, '∅406x12': 113.4, 'UPN 160': 18.8,
  }
  return ((weights[profile] || 30) * length) / 1000
}

function getAnalysis(beams: Beam[]): { score: number; messages: AIMessage[] } {
  const msgs: AIMessage[] = []
  let score = 0
  if (beams.length === 0) return { score: 0, messages: [{ role: 'ai', text: '¡Empieza colocando tu primera viga! Selecciona un perfil y haz clic en el plano.', type: 'tip' }] }

  const columns = beams.filter(b => Math.abs(b.start.x - b.end.x) < 0.1 && Math.abs(b.start.z - b.end.z) < 0.1)
  const horizontals = beams.filter(b => Math.abs(b.start.y - b.end.y) < 0.1)
  const diagonals = beams.filter(b => !columns.includes(b) && !horizontals.includes(b))
  const totalWeight = beams.reduce((s, b) => s + b.weight, 0)
  const uniqueY = new Set(beams.flatMap(b => [Math.round(b.start.y), Math.round(b.end.y)]))

  if (columns.length > 0) { score += 20; msgs.push({ role: 'ai', text: `✓ ${columns.length} columnas detectadas. Buena base estructural.`, type: 'success' }) }
  if (horizontals.length > 0) { score += 20; msgs.push({ role: 'ai', text: `✓ ${horizontals.length} vigas horizontales. Distribución de cargas activa.`, type: 'success' }) }
  if (diagonals.length > 0) { score += 25; msgs.push({ role: 'ai', text: `✓ ${diagonals.length} diagonales/arándolas. Estabilidad lateral mejorada.`, type: 'success' }) }
  if (uniqueY.size >= 3) { score += 15; msgs.push({ role: 'ai', text: `✓ Estructura de ${uniqueY.size} niveles. Altura: ${Math.max(...uniqueY)}m.`, type: 'success' }) }
  if (columns.length < beams.length * 0.2) msgs.push({ role: 'ai', text: '⚠ Pocas columnas. Agrega soportes verticales.', type: 'warning' })
  if (diagonals.length === 0 && beams.length > 5) msgs.push({ role: 'ai', text: '⚠ Sin diagonales. Agrega arriostramiento para viento/sismo.', type: 'warning' })

  const profiles = new Set(beams.map(b => b.profile))
  if (profiles.size >= 3) { score += 10; msgs.push({ role: 'ai', text: `✓ Usando ${profiles.size} perfiles diferentes. Optimización de material.`, type: 'success' }) }
  score += Math.min(beams.length * 2, 10)
  msgs.push({ role: 'ai', text: `📊 Peso total: ${totalWeight.toFixed(0)} kg | ${beams.length} elementos | Score: ${Math.min(score, 100)}/100`, type: 'info' })
  return { score: Math.min(score, 100), messages: msgs }
}

function generateAIBuild(): { profile: string; start: [number, number, number]; end: [number, number, number] }[] {
  const b: { profile: string; start: [number, number, number]; end: [number, number, number] }[] = []
  const COL = 'IPE 330', BEAM = 'HEA 400', BRACE = 'IPE 200'
  const W = 12, D = 8, H = 4, levels = 3

  for (let lv = 0; lv < levels; lv++) {
    const y = lv * H
    // Columns
    for (let x = 0; x <= W; x += W) for (let z = 0; z <= D; z += D) {
      b.push({ profile: COL, start: [x, y, z], end: [x, y + H, z] })
    }
    // Horizontal beams X
    for (let z = 0; z <= D; z += D) {
      b.push({ profile: BEAM, start: [0, y + H, z], end: [W, y + H, z] })
    }
    // Horizontal beams Z
    for (let x = 0; x <= W; x += W) {
      b.push({ profile: BEAM, start: [x, y + H, 0], end: [x, y + H, D] })
    }
    // X-bracing on sides
    if (lv < levels - 1) {
      b.push({ profile: BRACE, start: [0, y, 0], end: [W / 2, y + H, 0] })
      b.push({ profile: BRACE, start: [W, y, 0], end: [W / 2, y + H, 0] })
      b.push({ profile: BRACE, start: [0, y, D], end: [W / 2, y + H, D] })
      b.push({ profile: BRACE, start: [W, y, D], end: [W / 2, y + H, D] })
    }
  }
  return b
}

// ─── Component ────────────────────────────────────────────────────────
export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef = useRef<number>(0)
  const beamsRef = useRef<Beam[]>([])
  const beamGroupRef = useRef<THREE.Group>(new THREE.Group())
  const ghostRef = useRef<THREE.Mesh | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const groundRef = useRef<THREE.Mesh | null>(null)
  const idRef = useRef(0)

  const [selectedProfile, setSelectedProfile] = useState('IPE 330')
  const [startPoint, setStartPoint] = useState<THREE.Vector3 | null>(null)
  const [beams, setBeams] = useState<Beam[]>([])
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'ai', text: '🏗️ ¡Bienvenido a Steel Builder! Selecciona un perfil y haz clic para colocar vigas.', type: 'info' },
    { role: 'ai', text: '💡 Tip: Usa el botón "Auto-Build" para ver el AI construir una estructura.', type: 'tip' },
  ])
  const [score, setScore] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [mode, setMode] = useState<'build' | 'delete'>('build')
  const navigate = useNavigate()

  const addMessage = useCallback((msg: AIMessage) => {
    setMessages(prev => [...prev.slice(-15), msg])
  }, [])

  const snap = useCallback((v: THREE.Vector3) => {
    const g = 0.5
    return new THREE.Vector3(Math.round(v.x / g) * g, Math.round(v.y / g) * g, Math.round(v.z / g) * g)
  }, [])

  const createBeamMesh = useCallback((start: THREE.Vector3, end: THREE.Vector3, profile: string, ghost = false) => {
    const p = STEEL_PROFILES[profile] || { h: 200, b: 100, color: '#888' }
    const hScale = p.h / 500, bScale = p.b / 500
    const dir = new THREE.Vector3().subVectors(end, start)
    const length = dir.length()
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const geo = new THREE.BoxGeometry(bScale, hScale, length)
    const mat = ghost
      ? new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.4, wireframe: true })
      : new THREE.MeshPhysicalMaterial({ color: p.color, metalness: 0.8, roughness: 0.3, clearcoat: 0.3 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(mid)
    const axis = new THREE.Vector3(0, 0, 1)
    mesh.quaternion.setFromUnitVectors(axis, dir.clone().normalize())
    if (!ghost) {
      const edges = new THREE.EdgesGeometry(geo)
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }))
      mesh.add(line)
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
    return { mesh, length: Math.round(length * 100) }
  }, [])

  const placeBeam = useCallback((start: THREE.Vector3, end: THREE.Vector3) => {
    const scene = sceneRef.current
    if (!scene || start.distanceTo(end) < 0.3) return
    const { mesh, length } = createBeamMesh(start, end, selectedProfile)
    scene.add(mesh)
    const weight = getBeamWeight(selectedProfile, length)
    const beam: Beam = { id: idRef.current++, start: start.clone(), end: end.clone(), profile: selectedProfile, mesh, length, weight }
    beamsRef.current.push(beam)
    setBeams([...beamsRef.current])
    setStartPoint(null)
    if (ghostRef.current) { scene.remove(ghostRef.current); ghostRef.current = null }
    // AI feedback
    const prof = STEEL_PROFILES[selectedProfile]
    const family = prof?.family || ''
    const isVert = Math.abs(start.x - end.x) < 0.1 && Math.abs(start.z - end.z) < 0.1
    const isHoriz = Math.abs(start.y - end.y) < 0.1
    if (isVert) addMessage({ role: 'ai', text: `🔧 Columna ${selectedProfile} colocada — ${length}cm, ${weight.toFixed(0)}kg`, type: 'success' })
    else if (isHoriz) addMessage({ role: 'ai', text: `🔧 Viga ${selectedProfile} — ${length}cm, ${weight.toFixed(0)}kg`, type: 'success' })
    else addMessage({ role: 'ai', text: `🔧 Diagonal ${selectedProfile} — ${length}cm, ${weight.toFixed(0)}kg`, type: 'success' })
    if (family === 'IPE' && isHoriz) addMessage({ role: 'ai', text: '💡 IPE como viga horizontal — excelente relación peso/resistencia.', type: 'tip' })
    if (family === 'HSS') addMessage({ role: 'ai', text: '💡 HSS: ideal para columnas y arriostramientos por su resistencia biaxial.', type: 'tip' })
  }, [selectedProfile, createBeamMesh, addMessage])

  const autoBuild = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    addMessage({ role: 'ai', text: '🤖 Iniciando construcción automática... Nivel 1', type: 'info' })
    const plan = generateAIBuild()
    let delay = 0
    plan.forEach((item, i) => {
      delay += 80
      setTimeout(() => {
        const s = new THREE.Vector3(...item.start)
        const e = new THREE.Vector3(...item.end)
        const prev = selectedProfile
        setSelectedProfile(item.profile)
        placeBeam(s, e)
        setSelectedProfile(prev)
        if (i === plan.length - 1) {
          const analysis = getAnalysis(beamsRef.current)
          setScore(analysis.score)
          analysis.messages.forEach(m => addMessage(m))
          addMessage({ role: 'ai', text: '✅ ¡Estructura AI completada! Ahora modifícala a tu gusto.', type: 'success' })
        }
        const lv = Math.floor(item.start[1] / 4) + 1
        if (i > 0 && i % 12 === 0) addMessage({ role: 'ai', text: `🤖 Nivel ${lv} completado...`, type: 'info' })
      }, delay)
    })
  }, [addMessage, placeBeam, selectedProfile])

  const analyze = useCallback(() => {
    const analysis = getAnalysis(beamsRef.current)
    setScore(analysis.score)
    analysis.messages.forEach(m => addMessage(m))
  }, [addMessage])

  const clearAll = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    beamsRef.current.forEach(b => scene.remove(b.mesh))
    beamsRef.current = []
    setBeams([])
    setStartPoint(null)
    setScore(0)
    if (ghostRef.current) { scene.remove(ghostRef.current); ghostRef.current = null }
    addMessage({ role: 'ai', text: '🗑️ Escenario limpiado. ¡Empecemos de nuevo!', type: 'info' })
  }, [addMessage])

  const deleteBeam = useCallback((id: number) => {
    const scene = sceneRef.current
    if (!scene) return
    const beam = beamsRef.current.find(b => b.id === id)
    if (beam) {
      scene.remove(beam.mesh)
      beamsRef.current = beamsRef.current.filter(b => b.id !== id)
      setBeams([...beamsRef.current])
      addMessage({ role: 'ai', text: `🗑️ Viga eliminada. Quedan ${beamsRef.current.length} elementos.`, type: 'info' })
    }
  }, [addMessage])

  // ─── Three.js Setup ─────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const W = container.clientWidth, H = container.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    scene.fog = new THREE.Fog(0x1a1a2e, 50, 120)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200)
    camera.position.set(20, 15, 20)
    camera.lookAt(6, 4, 4)
    cameraRef.current = camera

    // OrbitControls inline (minimal)
    let isDragging = false, prevMouse = { x: 0, y: 0 }
    let theta = Math.PI / 4, phi = Math.PI / 4, radius = 28
    const target = new THREE.Vector3(6, 4, 4)
    const updateCamera = () => {
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.cos(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.sin(theta)
      )
      camera.lookAt(target)
    }
    updateCamera()
    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY } }
    const onMouseMove2 = (e: MouseEvent) => {
      if (!isDragging) return
      theta -= (e.clientX - prevMouse.x) * 0.005
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, phi - (e.clientY - prevMouse.y) * 0.005))
      prevMouse = { x: e.clientX, y: e.clientY }
      updateCamera()
    }
    const onMouseUp2 = () => { isDragging = false }
    const onWheel = (e: WheelEvent) => { radius = Math.max(8, Math.min(60, radius + e.deltaY * 0.05)); updateCamera() }
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove2)
    window.addEventListener('mouseup', onMouseUp2)
    renderer.domElement.addEventListener('wheel', onWheel)

    // Lighting
    scene.add(new THREE.AmbientLight(0x404060, 0.6))
    const dir = new THREE.DirectionalLight(0xffeedd, 1.5)
    dir.position.set(15, 20, 10)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.near = 0.5
    dir.shadow.camera.far = 60
    dir.shadow.camera.left = dir.shadow.camera.bottom = -20
    dir.shadow.camera.right = dir.shadow.camera.top = 20
    scene.add(dir)
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x362c1d, 0.4))

    // Ground
    const groundGeo = new THREE.PlaneGeometry(60, 60)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.name = 'ground'
    scene.add(ground)
    groundRef.current = ground

    // Grid
    const grid = new THREE.GridHelper(60, 60, 0x444466, 0x333355)
    grid.position.y = 0.01
    scene.add(grid)

    // Axis labels
    const makeLabel = (text: string, pos: [number, number, number], color: string) => {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = color
      ctx.font = 'bold 40px monospace'
      ctx.fillText(text, 10, 45)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }))
      sprite.position.set(...pos)
      sprite.scale.set(1.5, 0.75, 1)
      scene.add(sprite)
    }
    for (let i = 0; i <= 12; i += 4) makeLabel(`${i}m`, [i, 0.3, -1], '#66aaff')
    for (let i = 0; i <= 8; i += 4) makeLabel(`${i}m`, [-1, 0.3, i], '#66aaff')
    for (let i = 0; i <= 12; i += 4) makeLabel(`${i}m`, [-1.5, i, -1.5], '#ffaa66')

    scene.add(beamGroupRef.current)

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove2)
      window.removeEventListener('mouseup', onMouseUp2)
      renderer.domElement.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  // ─── Mouse Interaction ──────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    const renderer = rendererRef.current
    const camera = cameraRef.current
    const scene = sceneRef.current
    if (!container || !renderer || !camera || !scene) return

    const getGroundPoint = (e: MouseEvent): THREE.Vector3 | null => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const hits = raycasterRef.current.intersectObject(groundRef.current!)
      return hits.length > 0 ? snap(hits[0].point) : null
    }

    const onMove = (e: MouseEvent) => {
      if (mode !== 'build' || !startPoint) return
      const pt = getGroundPoint(e)
      if (!pt) return
      if (ghostRef.current) scene.remove(ghostRef.current)
      const { mesh } = createBeamMesh(startPoint, pt, selectedProfile, true)
      scene.add(mesh)
      ghostRef.current = mesh
    }

    const onClick = (e: MouseEvent) => {
      // Check if click is on sidebar or AI panel
      const target = e.target as HTMLElement
      if (target.closest('.sb-sidebar') || target.closest('.sb-ai-panel') || target.closest('button')) return

      const pt = getGroundPoint(e)
      if (!pt) return

      if (mode === 'delete') {
        // Find nearest beam
        const rc = raycasterRef.current
        rc.setFromCamera(mouseRef.current, camera)
        const meshes = beamsRef.current.map(b => b.mesh)
        const hits = rc.intersectObjects(meshes)
        if (hits.length > 0) {
          const beam = beamsRef.current.find(b => b.mesh === hits[0].object)
          if (beam) deleteBeam(beam.id)
        }
        return
      }

      if (!startPoint) {
        setStartPoint(pt)
        addMessage({ role: 'ai', text: `📍 Punto inicio: (${pt.x}, ${pt.y}, ${pt.z}) — clic para colocar`, type: 'info' })
      } else {
        placeBeam(startPoint, pt)
      }
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('click', onClick)
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('click', onClick)
    }
  }, [startPoint, selectedProfile, mode, snap, createBeamMesh, placeBeam, deleteBeam, addMessage])

  // ─── Render ─────────────────────────────────────────────────────────
  const totalWeight = beams.reduce((s, b) => s + b.weight, 0)
  const profiles = new Set(beams.map(b => b.profile))

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a1a', color: '#fff', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

      {/* ─── Sidebar ─── */}
      <div className="sb-sidebar" style={{ width: 240, background: 'linear-gradient(180deg, #111827, #0d1117)', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>STEEL BUILDER</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>CTIB — AI Powered</div>
        </div>

        {/* Nav to Dashboard */}
        <button onClick={() => navigate('/dashboard')} style={{
          margin: '8px 16px', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#3b82f6',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>🏗️</span> Ir al Dashboard →
        </button>

        {/* Score */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Score</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444' }}>{score}</span>
          </div>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', background: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444', borderRadius: 2, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Elementos', value: beams.length, color: '#3b82f6' },
            { label: 'Peso (kg)', value: totalWeight.toFixed(0), color: '#8b5cf6' },
            { label: 'Perfiles', value: profiles.size, color: '#06b6d4' },
            { label: 'Niveles', value: new Set(beams.flatMap(b => [Math.round(b.start.y), Math.round(b.end.y)])).size, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1e293b', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode Toggle */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 6 }}>
          {(['build', 'delete'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '6px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              background: mode === m ? (m === 'build' ? '#3b82f6' : '#ef4444') : '#1e293b',
              color: mode === m ? '#fff' : '#94a3b8',
            }}>
              {m === 'build' ? '🔧 Build' : '🗑️ Delete'}
            </button>
          ))}
        </div>

        {/* Profiles */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Perfiles</div>
          {Object.entries(STEEL_PROFILES).map(([name, p]) => (
            <button key={name} onClick={() => setSelectedProfile(name)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4,
              borderRadius: 8, border: selectedProfile === name ? '2px solid #3b82f6' : '1px solid #1e293b',
              background: selectedProfile === name ? '#1e3a5f' : 'transparent', cursor: 'pointer', color: '#e2e8f0', fontSize: 12, textAlign: 'left',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: p.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>{p.family} — {p.h}×{p.b}mm</div>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '12px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={autoBuild} style={{ padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            🤖 Auto-Build
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={analyze} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #1e293b', background: 'transparent', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>
              📊 Analizar
            </button>
            <button onClick={clearAll} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #1e293b', background: 'transparent', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3D Canvas ─── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {/* Mode indicator */}
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '8px 20px', borderRadius: 20, fontSize: 13, color: '#e2e8f0', backdropFilter: 'blur(8px)' }}>
          {mode === 'build' ? (startPoint ? `📍 Click para colocar — ${selectedProfile}` : `🔧 Click para iniciar — ${selectedProfile}`) : '🗑️ Click en viga para eliminar'}
        </div>
        {/* Help button */}
        <button onClick={() => setShowHelp(!showHelp)} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', border: '1px solid #334155', background: 'rgba(0,0,0,0.5)', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>?</button>
        {showHelp && (
          <div style={{ position: 'absolute', top: 60, right: 16, background: 'rgba(15,23,42,0.95)', borderRadius: 12, padding: 16, width: 280, border: '1px solid #1e293b', fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, backdropFilter: 'blur(12px)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#f1f5f9' }}>Controles</div>
            <div><b>Click</b> — Colocar punto de viga</div>
            <div><b>Arrastrar</b> — Rotar cámara</div>
            <div><b>Scroll</b> — Zoom</div>
            <div><b>Delete mode</b> — Click en viga para eliminar</div>
            <div style={{ marginTop: 8, color: '#8b5cf6' }}><b>Auto-Build</b> — El AI construye automáticamente</div>
          </div>
        )}
      </div>

      {/* ─── AI Panel ─── */}
      <div className="sb-ai-panel" style={{ width: 300, background: 'linear-gradient(180deg, #111827, #0d1117)', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>AI Assistant</div>
            <div style={{ fontSize: 10, color: '#22c55e' }}>● Online</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              marginBottom: 8, padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
              background: m.role === 'ai' ? '#1e293b' : '#1e3a5f',
              borderLeft: m.type === 'success' ? '3px solid #22c55e' : m.type === 'warning' ? '3px solid #eab308' : m.type === 'tip' ? '3px solid #8b5cf6' : '3px solid #3b82f6',
              color: '#cbd5e1',
            }}>
              {m.text}
            </div>
          ))}
        </div>
        {/* Quick actions */}
        <div style={{ padding: '12px', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Acciones AI</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: '🏗️ Construir marco 3 niveles', action: autoBuild },
              { label: '📊 Analizar estructura', action: analyze },
              { label: '🔄 Reset total', action: clearAll },
            ].map(a => (
              <button key={a.label} onClick={a.action} style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b',
                background: 'transparent', color: '#94a3b8', fontSize: 11, cursor: 'pointer', textAlign: 'left',
              }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
