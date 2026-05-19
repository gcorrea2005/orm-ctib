import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Rotate3D, ZoomIn, ZoomOut, Building2 } from 'lucide-react';

interface IFCViewerProps {
  filePath: string;
  fileName: string;
  onClose: () => void;
}

export default function IFCViewer({ filePath, fileName, onClose }: IFCViewerProps) {
  // Formateo de nombres de propiedades IFC
  const formatPropKey = (key: string) => {
    const map: Record<string, string> = {
      GlobalId: 'ID Global', Name: 'Nombre', Description: 'Descripción',
      LongName: 'Nombre Largo', ObjectType: 'Tipo de Objeto',
      Tag: 'Tag', PredefinedType: 'Tipo Predefinido',
      NominalValue: 'Valor', Unit: 'Unidad',
      OverallWidth: 'Ancho Total', OverallHeight: 'Alto Total',
      OverallLength: 'Largo Total', GrossWeight: 'Peso Bruto',
      NetWeight: 'Peso Neto', GrossArea: 'Área Bruta', NetArea: 'Área Neta',
      Volume: 'Volumen', Area: 'Área', Perimeter: 'Perímetro',
      Width: 'Ancho', Height: 'Alto', Length: 'Largo', Depth: 'Fondo',
      Thickness: 'Espesor', Diameter: 'Diámetro', Radius: 'Radio',
      Material: 'Material', Grade: 'Grado', LoadBearing: 'Portante',
      IsExternal: 'Exterior', FireRating: 'Resistencia Fuego',
      AcousticalRating: 'Aislamiento Acústico',
      ThermalTransmittance: 'Transmitancia Térmica',
    };
    if (map[key]) return map[key];
    // camelCase -> Palabras
    return key.replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
              .replace(/^./, s => s.toUpperCase());
  };

  const formatPropVal = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'object') {
      if (val.value !== undefined) return formatPropVal(val.value);
      if (val.label !== undefined) return String(val.label);
      return JSON.stringify(val).slice(0, 50);
    }
    return String(val);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const ifcManagerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressIndeterminate, setProgressIndeterminate] = useState(true);
  const [viewerReady, setViewerReady] = useState(false);
  const [stats, setStats] = useState<{ name: string; count: number; color: string }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<any>(null);
  const [selectedProps, setSelectedProps] = useState<any>(null);
  const [propLoading, setPropLoading] = useState(false);
  const [spatialTree, setSpatialTree] = useState<any>(null);
  const [showTree, setShowTree] = useState(false);
  const [isOrtho, setIsOrtho] = useState(false);
  const subsetMapRef = useRef<Map<string, any>>(new Map());
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<{ screenshot: string; stats: { name: string; count: number; color: string; isType?: boolean }[]; fileName: string; date: string } | null>(null);
  
  const toggleGroupVis = (name: string) => {
    setHiddenGroups(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      const subset = subsetMapRef.current.get(name);
      if (subset) subset.visible = next.has(name) ? false : true;
      return next;
    });
  };

  const toggleProjection = async () => {
    const v = viewerRef.current;
    if (!v?.context?.ifcCamera) return;
    const cam = v.context.ifcCamera;
    
    if (!isOrtho) {
      // 2D: vista en planta
      try {
        // Obtener modelo
        const model = (v.IFC.models?.size ?? 0) > 0
          ? v.IFC.models.values().next().value
          : null;
        const THREE = await import('three');
        let target = new THREE.Vector3(0, 0, 0);
        let dist = 30;
        if (model) {
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(target);
          dist = Math.max(size.x, size.z) * 1.5 || 30;
          // Fit camara al bounding box
          await cam.cameraControls.fitToBox(box, false);
        }
        // 2. Posicionar camara arriba
        await cam.cameraControls.setLookAt(
          target.x, target.y + dist, target.z + 0.01,
          target.x, target.y, target.z,
          false
        );
        // 3. Cambiar a ortografica (ya posicionada)
        cam.projection = 1; // Orthographic
      } catch (e) {
        console.warn('2D error:', e);
      }
      setIsOrtho(true);
    } else {
      // 3D: perspectiva
      try {
        const model = (v.IFC.models?.size ?? 0) > 0
          ? v.IFC.models.values().next().value
          : null;
        const THREE = await import('three');
        cam.projection = 0; // Perspective
        if (model) {
          const box = new THREE.Box3().setFromObject(model);
          await cam.cameraControls.fitToBox(box, false);
        }
      } catch (_) {}
      setIsOrtho(false);
    }
  };

  // ==============================================
  // EFECTO 1: Inicializar visor + config (como IfcContainer)
  // ==============================================
  useEffect(() => {
    let cancelled = false;

    const initViewer = async () => {
      try {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';
        containerRef.current.style.width = '100%';
        containerRef.current.style.height = '100%';

        const THREE = await import('three');
        const ViewerModule = await import('web-ifc-viewer');
        const IfcViewerAPI = ViewerModule.IfcViewerAPI || ViewerModule.default?.IfcViewerAPI || ViewerModule.default;
        if (!IfcViewerAPI) throw new Error('No se pudo encontrar IfcViewerAPI');

        if (cancelled) return;

        const ifcViewer = new IfcViewerAPI({
          container: containerRef.current,
          backgroundColor: new THREE.Color(0xf5f5f5),
        });

        viewerRef.current = ifcViewer;

        // Grid y ejes
        ifcViewer.axes.setAxes();
        ifcViewer.grid.setGrid();

        // Config (MULTI_THREADING: false) — como IfcContainer
        console.log('⚙️ Configurando...');
        await ifcViewer.IFC.loader.ifcManager.applyWebIfcConfig({
          COORDINATE_TO_ORIGIN: true,
          USE_FAST_BOOLS: false,
          MULTI_THREADING: false
        });

        if (!cancelled) {
          setViewerReady(true);
        }

        // Escuchar cambios de proyeccion (2D/3D)
        ifcViewer.context.ifcCamera.onChangeProjection.on((cam: any) => {
          setIsOrtho(cam === ifcViewer.context.ifcCamera.orthographicCamera);
        });
      } catch (err) {
        console.error('❌ Error iniciando visor:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al iniciar visor');
          setLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try { viewerRef.current.dispose(); } catch (e) {}
        viewerRef.current = null;
      }
    };
  }, []);

  // ==============================================
  // EFECTO 2: Cargar modelo (despues de que el visor este listo)
  // ==============================================
  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return;

    let cancelled = false;

    const loadModel = async () => {
      try {
        const viewer = viewerRef.current;

        // setWasmPath como IfcContainer
        console.log('📁 Configurando WASM...');
        await viewer.IFC.setWasmPath('./');

        // Fetch IFC
        console.log('📥 Cargando modelo:', filePath);
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Archivo no encontrado (HTTP ${response.status})`);

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) throw new Error('Archivo IFC vacío');
        console.log(`📦 IFC: ${(arrayBuffer.byteLength / 1024).toFixed(0)} KB`);

        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        console.log('🔄 Cargando modelo IFC...');
        
        // Usar el IFCLoader del viewer (unico, evita conflictos de IfcAPI entre cargas)
        const ifcLoader = viewer.IFC.loader;
        
        // Configurar ruta WASM si es primera vez
        try {
          ifcLoader.ifcManager.state.api.SetWasmPath('/', true);
          ifcLoader.ifcManager.state.api.isWasmPathAbsolute = true;
        } catch (_) {}
        
        // Establecer config del modelo
        ifcLoader.ifcManager.state.webIfcSettings = {
          COORDINATE_TO_ORIGIN: true,
          USE_FAST_BOOLS: false,
        };
        
        // Progress bar callback (se activa durante loadAllGeometry)
        ifcLoader.ifcManager.setOnProgress(({ loaded, total }: any) => {
          if (total > 0) {
            setProgressIndeterminate(false); // progreso real comienza
            const pct = Math.round((loaded / total) * 100);
            setProgress(Math.min(pct, 100));
          }
        });
        
        // Parsear buffer -> llama Init, OpenModel, loadAllGeometry
        const model = await ifcLoader.parse(arrayBuffer);
        
        // Guardar ifcManager para getProperties (el viewer.IFC usa otro IfcAPI)
        ifcManagerRef.current = ifcLoader.ifcManager;
        
        // Agregar modelo al viewer
        if (model) {
          viewer.IFC.addIfcModel(model);
          console.log(`✅ Modelo cargado, ID=${model.modelID}`);
        } else {
          throw new Error('IFCLoader.parse devolvió null/undefined');
        }
        
        URL.revokeObjectURL(url);

        if (!model || (model.modelID === undefined && model.modelID === null)) {
          throw new Error('Modelo cargado sin modelID');
        }
        console.log(`✅ Modelo OK, ID=${model.modelID}`);

        // Sombra y clipper como IfcContainer
        try { viewer.shadowDropper.renderShadow(model.modelID); } catch (e) {}
        viewer.clipper.active = true;

        // Aplicar colores por nombre de elemento (IPE270, HEA300, etc.)
        try {
          const webIfc = await import('web-ifc');
          const three = await import('three');
          
          // Poner el modelo base en gris muy tenue
          if (model.material) {
            const baseColor = new three.Color(0xdddddd);
            if (Array.isArray(model.material)) {
              model.material.forEach(m => { 
                m.color = baseColor;
                m.transparent = true;
                m.opacity = 0.15;
              });
            } else {
              model.material.color = baseColor;
              model.material.transparent = true;
              model.material.opacity = 0.15;
            }
          }
          
          const ifcApi = ifcLoader.ifcManager.state.api;
          const scene = viewer.context.getScene();
          
          // 1. Recolectar todos los IDs de todos los tipos IFC
          const allTypes = [webIfc.IFCCOLUMN, webIfc.IFCBEAM, webIfc.IFCSLAB, webIfc.IFCWALL,
            webIfc.IFCPLATE, webIfc.IFCMEMBER, webIfc.IFCSTAIR, webIfc.IFCSTAIRFLIGHT,
            webIfc.IFCRAILING, webIfc.IFCFOOTING, webIfc.IFCPILE, webIfc.IFCOPENINGELEMENT,
            webIfc.IFCELEMENTASSEMBLY, webIfc.IFCDISCRETEACCESSORY,
            webIfc.IFCMECHANICALFASTENER, webIfc.IFCFASTENER,
            webIfc.IFCREINFORCINGBAR, webIfc.IFCREINFORCINGMESH, webIfc.IFCTENDON,
            1903848743 // IFCBUILDINGELEMENTPROXY
          ];
          
          const allIds: number[] = [];
          let api = ifcApi;
          
          // Primero: obtener solo tipos geometricos (IFCBEAM, IFCCOLUMN, etc.)
          for (const type of allTypes) {
            try {
              const lines = await api.GetLineIDsWithType(model.modelID, type);
              if (!lines) continue;
              const size = typeof lines.size === 'function' ? lines.size() : (lines as any).length || 0;
              if (size === 0) continue;
              for (let i = 0; i < size; i++) {
                const id = typeof lines.get === 'function' ? lines.get(i) : (lines as any)[i];
                if (id !== undefined) allIds.push(id);
              }
            } catch (e) {
              console.warn(`Error GetLineIDsWithType tipo ${type}:`, e);
            }
          }
          
          // Si no encontro nada por tipo, fallback a GetAllLines
          if (allIds.length === 0) {
            try {
              const allLines = await api.GetAllLines(model.modelID);
              const totalLines = allLines && typeof allLines.size === 'function' ? allLines.size() : 0;
              if (totalLines > 0) {
                for (let i = 0; i < totalLines; i++) allIds.push(allLines.get(i));
              }
            } catch (e) {
              console.warn('GetAllLines falló:', e);
            }
          }
          console.log(`📊 IDs recolectados: ${allIds.length}, modelID: ${model.modelID}`);
          
          // 2. Concreto: keywords para filtro. Mapa tipo IFC -> nombre legible
          const CONCRETE_KEYWORDS = ['hormi', 'concreto', 'hormigón', 'concrete', 'Hormi'];
          const typeNameMap: Record<number, string> = {
            [webIfc.IFCCOLUMN]: 'Columnas', [webIfc.IFCBEAM]: 'Vigas',
            [webIfc.IFCSLAB]: 'Losas', [webIfc.IFCWALL]: 'Muros',
            [webIfc.IFCPLATE]: 'Platinas', [webIfc.IFCMEMBER]: 'Miembros',
            [webIfc.IFCSTAIR]: 'Escaleras', [webIfc.IFCSTAIRFLIGHT]: 'Rampas',
            [webIfc.IFCRAILING]: 'Barandas', [webIfc.IFCFOOTING]: 'Zapatas',
            [webIfc.IFCPILE]: 'Pilotes', [webIfc.IFCOPENINGELEMENT]: 'Aberturas',
            [webIfc.IFCELEMENTASSEMBLY]: 'Ensamblajes',
            [webIfc.IFCDISCRETEACCESSORY]: 'Accesorios',
            [webIfc.IFCMECHANICALFASTENER]: 'Pernos',
            [webIfc.IFCFASTENER]: 'Fijaciones',
            [webIfc.IFCREINFORCINGBAR]: 'Armaduras',
            [webIfc.IFCREINFORCINGMESH]: 'Mallas', [webIfc.IFCTENDON]: 'Tendones',
            1903848743: 'Genéricos',
          };
          const concreteIds: number[] = [];
          const nameGroups = new Map<string, number[]>();
          const typeGroups = new Map<string, number[]>(); // unnamed por tipo
          const nameMap = new Map<string, string>();
          
          for (const id of allIds) {
            try {
              const raw = await api.GetLine(model.modelID, id);
              // Extraer nombre del objeto IFC
              let name = '';
              try {
                const str = JSON.stringify(raw);
                let descMatch = str.match(/"Description"\s*:\s*\{[^}]*"value"\s*:\s*"([^"]+)"/);
                if (!descMatch) descMatch = str.match(/"Description"\s*:\s*"([^"]+)"/);
                if (descMatch) name = descMatch[1].trim();
                if (!name) {
                  let nameMatch = str.match(/"Name"\s*:\s*\{[^}]*"value"\s*:\s*"([^"]+)"/);
                  if (!nameMatch) nameMatch = str.match(/"Name"\s*:\s*"([^"]+)"/);
                  if (nameMatch) name = nameMatch[1].trim();
                }
                if (!name) {
                  let otMatch = str.match(/"ObjectType"\s*:\s*\{[^}]*"value"\s*:\s*"([^"]+)"/);
                  if (!otMatch) otMatch = str.match(/"ObjectType"\s*:\s*"([^"]+)"/);
                  if (otMatch) name = otMatch[1].trim();
                }
              } catch (_) {}
              
              // Detectar concreto por keywords en el JSON completo
              const rawStr = JSON.stringify(raw).toLowerCase();
              const esConcreto = CONCRETE_KEYWORDS.some(kw => rawStr.includes(kw));
              
              if (esConcreto) {
                concreteIds.push(id);
                continue;
              }
              
              if (name) {
                // Filtrar descripciones genericas no estructurales
                const genericNames = ['beam', 'column', 'plate', 'diag', 'opening', 'recess',
                  'weld', 'bolt assembly', 'bolt', 'steel plate', 'support section', 'placa',
                  'concrete', 'concreto', 'hormigón', 'hormi', 'generic', 'default',
                  'opening element', 'fastener', 'mechanical fastener', 'reinforcing bar',
                  'reinforcing mesh', 'tendon', 'discrete accessory', 'element assembly',
                  'member', 'stair', 'railing', 'footing', 'pile', 'stair flight',
                  'building element proxy', 'proxy', 'space', 'site', 'building', 'storey',
                ];
                const nameLower = name.toLowerCase().trim();
                if (genericNames.includes(nameLower)) {
                  // No agregar a nameGroups, pero tampoco a typeGroups - skip completamente
                  continue;
                }
                const key = nameLower;
                if (!nameGroups.has(key)) {
                  nameGroups.set(key, []);
                  nameMap.set(key, name);
                }
                nameGroups.get(key)!.push(id);
              } else {
                // Sin nombre: agrupar por tipo IFC
                const typeCode: number = raw?.type ?? 0;
                const typeName = typeNameMap[typeCode] || `Tipo ${typeCode}`;
                if (!typeGroups.has(typeName)) typeGroups.set(typeName, []);
                typeGroups.get(typeName)!.push(id);
              }
            } catch (_) {}
          }
          
          // 3. Asignar colores a cada nombre unico
          const uniqueNames = Array.from(nameGroups.keys()).sort();
          const statsData: { name: string; count: number; color: string }[] = [];
          let coloredCount = 0;
          
          console.log(`🧩 Grupos por nombre: ${uniqueNames.length}, IDs totales: ${allIds.length}, IDs sin nombre: ${allIds.length - coloredCount - concreteIds.length}`);
          
          // Paleta de colores vibrantes y muy distintos
          const palette = [
            0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6,
            0x1abc9c, 0xe67e22, 0x2980b9, 0x27ae60, 0xc0392b,
            0x8e44ad, 0x16a085, 0xd35400, 0x2c3e50, 0xf1c40f,
            0x7f8c8d, 0x00bcd4, 0xff6b6b, 0x48dbfb, 0xff9ff3,
            0x54a0ff, 0x5f27cd, 0x01a3a4, 0xf368e0, 0xff6348,
            0x7bed9f, 0x70a1ff, 0xf8a5c2, 0x63cdda, 0xcf6a87,
          ];
          
          for (let i = 0; i < uniqueNames.length; i++) {
            const key = uniqueNames[i];
            const ids = nameGroups.get(key)!;
            const displayName = nameMap.get(key) || (key === '__default__' ? 'Elemento' : key);
            
            // Color de paleta ciclica con hash del nombre para distribucion
            const colorIdx = Math.abs(key.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)) % palette.length;
            const color = new three.Color(palette[colorIdx]);
            
            try {
              const subset = ifcLoader.ifcManager.createSubset({
                scene,
                modelID: model.modelID,
                ids,
                removePrevious: true,
                customID: 'name-' + key,
                material: new three.MeshLambertMaterial({
                  color,
                  transparent: true,
                  opacity: 0.92
                })
              });
              if (subset) subsetMapRef.current.set(displayName, subset);
              coloredCount += ids.length;
              statsData.push({ name: displayName, count: ids.length, color: '#' + color.getHexString() });
            } catch (e) {
              console.warn(`Error subset ${displayName}:`, e);
            }
          }
          
          // 3b. Subsets para elementos sin nombre (agrupados por tipo IFC)
          const typeNames = Array.from(typeGroups.keys()).sort();
          for (const typeName of typeNames) {
            const ids = typeGroups.get(typeName)!;
            const colorIdx = Math.abs(typeName.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7)) % palette.length;
            const color = new three.Color(palette[colorIdx]);
            try {
              const subset = ifcLoader.ifcManager.createSubset({
                scene, modelID: model.modelID, ids,
                removePrevious: true, customID: 'type-' + typeName,
                material: new three.MeshLambertMaterial({ color, transparent: true, opacity: 0.92 })
              });
              if (subset) subsetMapRef.current.set(typeName, subset);
              coloredCount += ids.length;
              statsData.push({ name: typeName, count: ids.length, color: '#' + color.getHexString(), isType: true });
            } catch (e) {
              console.warn(`Error subset tipo ${typeName}:`, e);
            }
          }
          
          // 4. Concreto: subset gris muy transparente
          if (concreteIds.length > 0) {
            try {
              ifcLoader.ifcManager.createSubset({
                scene,
                modelID: model.modelID,
                ids: concreteIds,
                removePrevious: true,
                material: new three.MeshLambertMaterial({
                  color: new three.Color(0x999999),
                  transparent: true,
                  opacity: 0.04
                })
              });
              statsData.push({ name: 'Concreto', count: concreteIds.length, color: '#999999' });
            } catch (_) {}
          }
          
          // 5. Stats
          setStats(statsData);
          console.log(`✅ Colores: ${coloredCount} elementos steel${concreteIds.length > 0 ? `, ${concreteIds.length} concreto` : ''}`);
          
        } catch (e) {
          console.warn('Colorización no disponible:', e);
        }

        // Enfocar camara
        setTimeout(() => {
          try { viewer.IFC.fitToFrame([model.modelID]); } catch (e) {}
        }, 200);

        if (!cancelled) {
          setLoading(false);
          setProgress(100);
        }
        
        // Cargar arbol espacial IFC manual (evita getSpatialStructure que falla con web-ifc v0.0.39)
        setTimeout(async () => {
          try {
            const ifcApi2 = ifcLoader.ifcManager.state.api;
            const threeColors = await import('three');
            
            // Obtener proyecto
            const projLines = ifcApi2.GetLineIDsWithType(model.modelID, 103090709); // IFCPROJECT
            if (!projLines || projLines.size() === 0) return;
            
            const projectId = projLines.get(0);
            
            // Construir arbol manualmente
            const buildSpatialTree = async (expressID: number): Promise<any> => {
              const line = await ifcApi2.GetLine(model.modelID, expressID, false, false);
              const typeCode = line?.type || 0;
              const typeName = line?.type?.toString ? line.type.toString() : 'Unknown';
              const name = line?.Name?.value || line?.LongName?.value || typeName;
              
              const node: any = { expressID, type: typeName, name, children: [] };
              
              // Buscar hijos via IfcRelAggregates
              const relAggIds = ifcApi2.GetLineIDsWithType(model.modelID, 160246688);
              if (relAggIds) {
                for (let i = 0; i < relAggIds.size(); i++) {
                  const relData = await ifcApi2.GetLine(model.modelID, relAggIds.get(i), false, false);
                  if (relData?.RelatingObject?.value === expressID && relData?.RelatedObjects) {
                    const objs = relData.RelatedObjects;
                    for (let j = 0; j < (objs.length || 1); j++) {
                      const childId = objs[j]?.value || (objs.size ? objs.get(j) : null);
                      if (childId != null) {
                        const childNode = await buildSpatialTree(childId);
                        if (childNode) node.children.push(childNode);
                      }
                    }
                  }
                }
              }
              
              // Para storeys (3124254112), buscar elementos contenidos
              if (typeCode === 3124254112 || String(typeCode).includes('3124')) {
                const relContIds = ifcApi2.GetLineIDsWithType(model.modelID, 3242617779);
                if (relContIds) {
                  for (let i = 0; i < relContIds.size(); i++) {
                    const relData = await ifcApi2.GetLine(model.modelID, relContIds.get(i), false, false);
                    if (relData?.RelatingStructure?.value === expressID && relData?.RelatedElements) {
                      const elems = relData.RelatedElements;
                      for (let j = 0; j < (elems.length || 1); j++) {
                        const elemId = elems[j]?.value || (elems.size ? elems.get(j) : null);
                        if (elemId != null) {
                          const elemLine = await ifcApi2.GetLine(model.modelID, elemId, false, false);
                          node.children.push({
                            expressID: elemId,
                            type: String(elemLine?.type || ''),
                            name: elemLine?.Name?.value || String(elemLine?.type || '') || `#${elemId}`,
                            children: [],
                          });
                        }
                      }
                    }
                  }
                }
              }
              
              // Si es proyecto (103090709) o sitio (4097777520) o building (4031249490), seguir buscando
              
              return node;
            };
            
            const tree = await buildSpatialTree(projectId);
            setSpatialTree(tree);
            console.log('🌳 Arbol IFC cargado manualmente');
          } catch (e) {
            console.warn('Arbol IFC no disponible:', e);
          }
        }, 500);
      } catch (err) {
        console.error('❌ Error cargando modelo:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido al cargar el modelo');
          setLoading(false);
        }
      }
    };

    loadModel();

    return () => { cancelled = true; };
  }, [viewerReady, filePath]);

  // ⏱️ Timer de carga directo con ref
  useEffect(() => {
    if (!loading) return;
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 200);
    timerRef.current = id;
    return () => clearInterval(id);
  }, [loading]);

  // Controles
  const handleZoomIn = () => {
    const v = viewerRef.current;
    v?.context?.camera?.zoomIn();
  };
  const handleZoomOut = () => {
    const v = viewerRef.current;
    v?.context?.camera?.zoomOut();
  };
  const handleResetView = async () => {
    const v = viewerRef.current;
    if (!v?.context?.ifcCamera) return;
    try {
      const THREE = await import('three');
      const scene = v.context.getScene();
      const box = new THREE.Box3().setFromObject(scene);
      if (!box.isEmpty()) {
        v.context.ifcCamera.cameraControls.fitToBox(box, false);
      }
    } catch (_) {}
  };

  // Zoom Extend: ajusta la camara para que quepan todos los elementos visibles
  const handleZoomExtend = async () => {
    const v = viewerRef.current;
    if (!v?.context?.ifcCamera) return;
    try {
      const THREE = await import('three');
      const scene = v.context.getScene();
      const box = new THREE.Box3();
      scene.traverse((child: any) => {
        if ((child as any).isMesh && child.visible) {
          box.expandByObject(child);
        }
      });
      if (!box.isEmpty()) {
        await v.context.ifcCamera.cameraControls.fitToBox(box, false);
      }
    } catch (_) {}
  };
  
  // Atajo: click en un punto del modelo para ver propiedades
  const handleOrbitClick = async (event: React.MouseEvent) => {
    const v = viewerRef.current;
    if (!v || loading) return;
    try {
      // Usar raycaster directo de Three.js para obtener el elemento clickeado
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Normalizar coordenadas del mouse
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const three = await import('three');
      const raycaster = new three.Raycaster();
      const camera = v.context.getCamera();
      raycaster.setFromCamera(new three.Vector2(x, y), camera);
      
      // Obtener todos los objetos pickeables (modelos IFC)
      const models = v.context.items.pickableIfcModels;
      if (!models || models.length === 0) return;
      
      const intersects = raycaster.intersectObjects(models, true);
      if (intersects.length > 0) {
        const hit = intersects[0];
        const mesh = hit.object;
        const geo = mesh.geometry;
        
        // Obtener expressID usando el metodo oficial del IFCManager
        let expressID = undefined;
        try {
          const mgr = ifcManagerRef.current;
          if (mgr && hit.faceIndex !== undefined) {
            expressID = mgr.getExpressId(geo, hit.faceIndex);
          }
        } catch (_) {}
        
        if (expressID === undefined || expressID === null) {
          setSelectedProps({ type: 'ID no disponible' });
          return;
        }
        
        // Actualizar centro de orbita (omitir si no es OrbitControls)
        if (hit.point) {
          try {
            const camControls = v.context.ifcCamera?.cameraControls || v.camera?.controls;
            if (camControls && typeof (camControls as any).target?.copy === 'function') {
              (camControls as any).target.copy(hit.point);
              (camControls as any).update();
            }
          } catch (_) {}
        }
        
        // Obtener propiedades usando ifcManager del loader
        setPropLoading(true);
        try {
          const mgr = ifcManagerRef.current;
          const modelsObj = mgr?.state?.models;
          const modelIDs = modelsObj ? Object.keys(modelsObj) : [];
          const modelID = modelIDs.length > 0 ? Number(modelIDs[0]) : -1;
          if (modelID < 0) {
            setSelectedProps({ expressID, type: 'Model ID no encontrado' });
            setPropLoading(false);
            return;
          }
          const props = await mgr.getItemProperties(modelID, expressID, true);
          // Cargar propiedades adicionales en paralelo
          const [psets, materials, typeProps] = await Promise.all([
            mgr.getPropertySets(modelID, expressID, true).catch(() => []),
            mgr.getMaterialsProperties(modelID, expressID, true).catch(() => []),
            mgr.getTypeProperties(modelID, expressID, true).catch(() => null)
          ]);
          setSelectedProps({ ...props, psets, materials, typeProps });
        } catch (e) {
          console.warn('Error cargando propiedades:', e);
          setSelectedProps({ expressID, type: 'Error al cargar propiedades' });
        }
        setPropLoading(false);
      } else {
        setSelectedProps(null);
      }
    } catch (e) {
      console.warn('Error en click:', e);
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const v = viewerRef.current;
      if (!v) return;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); v.context?.camera?.zoomIn(); }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); v.context?.camera?.zoomOut(); }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (v?.IFC?.models?.size > 0) {
          const modelId = Array.from(v.IFC.models.values())[0].modelID;
          v.IFC.fitToFrame([modelId]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generar reporte con screenshot (usando readPixels para captura confiable)
  const handleGenerateReport = async () => {
    try {
      let screenshot = '';
      const v = viewerRef.current;
      if (v?.context?.renderer?.renderer) {
        const renderer = v.context.renderer.renderer;
        const gl = renderer.getContext();
        const scene = v.context.getScene();
        const camera = v.context.getCamera();
        if (gl && scene && camera) {
          // Forzar render para asegurar frame actual
          renderer.render(scene, camera);
          const w = gl.drawingBufferWidth;
          const h = gl.drawingBufferHeight;
          const pixels = new Uint8Array(w * h * 4);
          gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          // Crear canvas 2D y dibujar los pixels invertidos (readPixels da bottom-up)
          const canvas2d = document.createElement('canvas');
          canvas2d.width = w;
          canvas2d.height = h;
          const ctx = canvas2d.getContext('2d')!;
          const imageData = ctx.createImageData(w, h);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const srcIdx = (y * w + x) * 4;
              const dstIdx = ((h - 1 - y) * w + x) * 4;
              imageData.data[dstIdx] = pixels[srcIdx];
              imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
              imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
              imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
            }
          }
          ctx.putImageData(imageData, 0, 0);
          screenshot = canvas2d.toDataURL('image/png');
        }
      }
      const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      setReportData({ screenshot, stats, fileName, date });
      setShowReport(true);
    } catch (e) {
      console.warn('Error capturando screenshot:', e);
      const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      setReportData({ screenshot: '', stats, fileName, date });
      setShowReport(true);
    }
  };

  // Descargar reporte MD (con imagen embebida)
  const handleDownloadReport = (screenshot: string, stats: { name: string; count: number; color: string; isType?: boolean }[], fileName: string, date: string) => {
    const rows = stats.filter(s => !s.isType).map(s => `| ${s.name} | ${s.count} |`).join('\n');
    const typeRows = stats.filter(s => s.isType).map(s => `| ${s.name} | ${s.count} |`).join('\n');
    const total = stats.reduce((s, x) => s + x.count, 0);
    let md = `# Informe de Secciones\n\n**Modelo:** ${fileName.replace('.ifc','')}  \n**Fecha:** ${date}  \n**Total:** ${total} elementos\n\n`;
    if (screenshot) {
      md += `## Vista del modelo\n\n![Vista del modelo](${screenshot})\n\n`;
    }
    md += `## Secciones\n\n| Sección | Cant |\n|---------|-----:|\n${rows}\n${typeRows ? `\n### Sin descripción\n\n| Tipo | Cant |\n|------|-----:|\n${typeRows}` : ''}\n\n---\nHCB Estructuras Metálicas — ${new Date().toLocaleDateString('es-ES')}\n`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${fileName.replace('.ifc','')}_secciones.md`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 999999, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1rem 2rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e0e0e0', zIndex: 10 }}>
        <div>
          <h2 style={{ margin: 0, color: '#333', fontSize: '1.3rem' }}>🏗️ {fileName}</h2>
          <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Visor BIM - Modelo IFC 3D</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#f0f0f0', padding: '6px', borderRadius: '8px' }}>
            <button onClick={handleZoomIn} style={{ background: 'transparent', border: '1px solid #ddd', color: '#333', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} title="Acercar"><ZoomIn size={16} /></button>
            <button onClick={handleZoomOut} style={{ background: 'transparent', border: '1px solid #ddd', color: '#333', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} title="Alejar"><ZoomOut size={16} /></button>
            <button onClick={handleZoomExtend} style={{ background: '#ff9800', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }} title="Zoom Extend">🔲 Ext</button>
            <button onClick={handleResetView} style={{ background: 'transparent', border: '1px solid #ddd', color: '#333', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} title="Restablecer vista"><Rotate3D size={16} /></button>
            <button onClick={toggleProjection} style={{ background: isOrtho ? '#667eea' : 'transparent', border: `1px solid ${isOrtho ? '#667eea' : '#ddd'}`, color: isOrtho ? 'white' : '#333', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }} title="Alternar 2D/3D">
              {isOrtho ? '2D' : '3D'}
            </button>
            <button onClick={() => setShowTree(!showTree)} style={{ background: showTree ? '#27ae60' : 'transparent', border: `1px solid ${showTree ? '#27ae60' : '#ddd'}`, color: showTree ? 'white' : '#333', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={showTree ? 'Ocultar estructura del edificio' : 'Mostrar estructura del edificio'}>
              <Building2 size={14} /> {showTree ? 'ON' : 'OFF'}
            </button>
          </div>
          <button onClick={handleDownload} style={{ background: '#667eea', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}><Download size={18} /> DESCARGAR</button>
          <button onClick={handleGenerateReport} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}><Download size={18} /> INFORME</button>
          <button onClick={onClose} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}><X size={18} /> CERRAR</button>
        </div>
      </div>

      {/* Contenido: sidebar + 3D */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar izquierdo: arbol, secciones, props */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', color: '#ccc', fontSize: '0.75rem', borderRight: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          {/* Arbol espacial */}
          {showTree && spatialTree && (
            <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.8rem', color: '#eee', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '4px' }}>
                🌳 Estructura del edificio
              </div>
              <TreeNode node={spatialTree} depth={0} />
            </div>
          )}
          {/* Secciones */}
          {!loading && !error && stats.length > 0 && (
            <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.8rem', color: '#eee' }}>📊 SECCIONES</div>
              {stats.filter(s => !(s as any).isType).map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', padding: '1px 0' }}>
                  <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }} onClick={() => toggleGroupVis(s.name)} title={hiddenGroups.has(s.name) ? 'Mostrar' : 'Ocultar'}>
                    <span style={{ color: hiddenGroups.has(s.name) ? '#555' : s.color, fontSize: '0.85rem' }}>{hiddenGroups.has(s.name) ? '👁‍🗨' : '👁'}</span>
                    <span style={{ color: hiddenGroups.has(s.name) ? '#666' : '#ccc' }}>{s.name}</span>
                  </span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{s.count}</span>
                </div>
              ))}
              {stats.filter(s => !(s as any).isType).length > 0 && stats.filter(s => (s as any).isType).length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '4px 0', paddingTop: '4px' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>Sin descripción</div>
                </div>
              )}
              {stats.filter(s => (s as any).isType).map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', padding: '1px 0' }}>
                  <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }} onClick={() => toggleGroupVis(s.name)} title={hiddenGroups.has(s.name) ? 'Mostrar' : 'Ocultar'}>
                    <span style={{ color: hiddenGroups.has(s.name) ? '#555' : s.color, fontSize: '0.85rem' }}>{hiddenGroups.has(s.name) ? '👁‍🗨' : '👁'}</span>
                    <span style={{ color: hiddenGroups.has(s.name) ? '#666' : '#ccc' }}>{s.name}</span>
                  </span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
          {/* Propiedades abajo */}
          {!loading && !error && selectedProps && (
            <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.8rem', color: '#eee', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>📋 Propiedades</span>
                <span onClick={() => setSelectedProps(null)} style={{ cursor: 'pointer', color: '#888' }}>✕</span>
              </div>
              {propLoading ? (
                <div style={{ padding: '8px', textAlign: 'center', color: '#888' }}>Cargando...</div>
              ) : (
                <>
                  {selectedProps.type && (
                    <div style={{ marginBottom: '6px' }}>
                      <span className="badge ifc" style={{ background: 'rgba(102, 126, 234, 0.2)', color: '#667eea', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {typeof selectedProps.type === 'string' ? selectedProps.type.replace('IFC', '') : selectedProps.type?.name || '—'}
                      </span>
                    </div>
                  )}
                  {selectedProps.expressID !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '2px 0' }}>
                      <span style={{ color: '#999' }}>ID</span>
                      <span style={{ color: '#88ff88', textAlign: 'right' }}>#{selectedProps.expressID}</span>
                    </div>
                  )}
                  {Object.entries(selectedProps).filter(([k]) => !['psets', 'type', 'expressID', 'materials', 'typeProps', 'OwnerHistory', 'HasPropertySets', 'HasAssignments', 'HasAssociations', 'IsDecomposedBy', 'Decomposes', 'HasOpenings', 'IsTypedBy', 'IsDefinedBy', 'Representation', 'ObjectPlacement', 'ContainedInStructure', 'ObjectType', 'Tag'].includes(k)).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2px 0' }}>
                      <span style={{ color: '#999', whiteSpace: 'nowrap' }}>{formatPropKey(key)}</span>
                      <span style={{ color: '#fff', textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatPropVal(val)}</span>
                    </div>
                  ))}
                  {selectedProps.psets?.length > 0 && (
                    <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Property Sets</div>
                      {selectedProps.psets.map((pset: any, i: number) => (
                        <div key={`pset-${i}`} style={{ marginBottom: '4px' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.7rem', color: '#aaa', marginBottom: '2px' }}>📎 {pset.Name?.value || `PSet ${i}`}</div>
                          {pset.HasProperties?.map((prop: any, j: number) => (
                            <div key={`prop-${j}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '1px 0', fontSize: '0.65rem' }}>
                              <span style={{ color: '#999' }}>{formatPropKey(prop.Name?.value || prop.name || `Prop ${j}`)}</span>
                              <span style={{ color: '#fff', textAlign: 'right', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatPropVal(prop.NominalValue?.value ?? prop.value)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedProps.materials?.length > 0 && (
                    <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Materiales</div>
                      {selectedProps.materials.map((mat: any, i: number) => (
                        <div key={`mat-${i}`} style={{ marginBottom: '4px' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.7rem', color: '#cc9', marginBottom: '2px' }}>🧱 {mat.Name?.value || `Material ${i}`}</div>
                          {Object.entries(mat).filter(([k]) => !['Name', 'psets', 'type'].includes(k)).map(([key, val]) => (
                            <div key={`m-${key}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '1px 0', fontSize: '0.65rem' }}>
                              <span style={{ color: '#999' }}>{formatPropKey(key)}</span>
                              <span style={{ color: '#fff', textAlign: 'right', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatPropVal(val)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Viewport 3D */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <div ref={containerRef} onClick={handleOrbitClick} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
        </div>
      </div>
      
      {/* Overlay de carga/error FUERA del contenedor Three.js para evitar conflictos DOM */}
      {loading && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#333', zIndex: 200, pointerEvents: 'none', width: '400px', maxWidth: '90vw' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏗️</div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#333' }}>Cargando modelo BIM...</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#888', fontSize: '0.9rem' }}>{fileName}</p>
          {/* Barra de progreso: indeterminada (pulsante) durante Init/OpenModel, determinada durante geometria */}
          {progressIndeterminate ? (
            <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: '30%',
                height: '100%',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '4px',
                animation: 'progressPulse 1.5s ease-in-out infinite',
              }} />
            </div>
          ) : (
            <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          )}
          <p style={{ margin: '0.5rem 0 0 0', color: '#999', fontSize: '0.8rem' }}>
            {progressIndeterminate ? `Inicializando... ${elapsed}s` : `${progress}% (${elapsed}s)`}
          </p>
        </div>
      )}

      {error && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#333', background: 'rgba(255, 82, 82, 0.08)', padding: '2rem', borderRadius: '12px', border: '1px solid #ff5252', zIndex: 200, maxWidth: '600px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: '#ff5252' }}>Error al cargar el modelo</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#ff8282', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{error}</p>
          <p style={{ fontSize: '0.85rem', color: '#888' }}>Revisa la consola (F12) para más detalles</p>
          <button onClick={onClose} style={{ background: '#f44336', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>CERRAR VISOR</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', color: '#ccc', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', zIndex: 200, pointerEvents: 'none' }}>
          <span>🖱️ Click elemento: propiedades + órbita | + / - : Zoom | R: Reset</span>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes progressPulse { 0% { transform: translateX(-100%); } 50% { transform: translateX(200%); } 100% { transform: translateX(400%); } }`}</style>

      {/* Modal de Reporte */}
      {showReport && reportData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>📋 Informe de Secciones</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleDownloadReport(reportData.screenshot, reportData.stats, reportData.fileName, reportData.date)} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '0.85rem' }}><Download size={16} /> Descargar .md</button>
                <button onClick={() => setShowReport(false)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>✕ Cerrar</button>
              </div>
            </div>
            {/* Cuerpo del reporte */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                <strong>Modelo:</strong> {reportData.fileName.replace('.ifc','')} &nbsp;|&nbsp; <strong>Fecha:</strong> {reportData.date} &nbsp;|&nbsp; <strong>Total:</strong> {reportData.stats.reduce((s, x) => s + x.count, 0)} elementos
              </p>
              {reportData.screenshot && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#333', fontSize: '1rem', marginBottom: '0.5rem' }}>Vista del modelo</h3>
                  <img src={reportData.screenshot} alt="Vista del modelo" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '8px' }} />
                </div>
              )}
              <h3 style={{ color: '#333', fontSize: '1rem', marginBottom: '0.5rem' }}>Secciones</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#667eea', color: 'white' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Sección</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Cant</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.stats.filter(s => !s.isType).map((s, i) => (
                    <tr key={s.name} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9ff' }}>
                      <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', color: '#1a1a2e' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: s.color, marginRight: '8px', verticalAlign: 'middle' }}></span>
                        {s.name}
                      </td>
                      <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold', color: '#1a1a2e' }}>{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.stats.filter(s => s.isType).length > 0 && (
                <>
                  <h3 style={{ color: '#333', fontSize: '1rem', margin: '1rem 0 0.5rem' }}>Sin descripción</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#888', color: 'white' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Tipo</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Cant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.stats.filter(s => s.isType).map((s, i) => (
                        <tr key={s.name} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                          <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', color: '#1a1a2e' }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: s.color, marginRight: '8px', verticalAlign: 'middle' }}></span>
                            {s.name}
                          </td>
                          <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold', color: '#1a1a2e' }}>{s.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding: '0.8rem 1.5rem', borderTop: '1px solid #eee', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
              HCB Estructuras Metálicas — {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para renderizar el arbol IFC recursivamente
function TreeNode({ node, depth }: { node: any; depth: number }) {
  if (!node) return null;
  const icon = node.type?.includes('Project') ? '🏗️' :
               node.type?.includes('Site') ? '🌍' :
               node.type?.includes('Building') ? '🏢' :
               node.type?.includes('Storey') ? '📐' :
               node.type?.includes('Space') ? '⬜' : '📦';
  const name = node.name || node.type || `ID:${node.expressID}`;
  const children = node.children || [];
  
  return (
    <div style={{ paddingLeft: depth > 0 ? '16px' : '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: depth === 0 ? '#eee' : depth === 1 ? '#ddd' : '#ccc', fontSize: depth === 0 ? '0.8rem' : '0.75rem' }}>
        <span>{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        {node.expressID && <span style={{ color: '#666', fontSize: '0.65rem' }}>#{node.expressID}</span>}
      </div>
      {children.map((child: any, i: number) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
