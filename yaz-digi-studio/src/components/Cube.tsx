import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import './Cube.css'

const FACES = [
  { label: 'Process', position: [0, 0, 2], color: 0x0044ff },      // Deep Electric Blue
  { label: 'Build', position: [0, 0, -2], color: 0xff0033 },       // Deep Crimson Red
  { label: 'Care', position: [2, 0, 0], color: 0xaa00ff },         // Deep Violet Purple
  { label: 'Pricing', position: [-2, 0, 0], color: 0xffbb00 },     // Golden Amber
  { label: 'Why Yaz', position: [0, 2, 0], color: 0xff0099 },      // Hot Magenta
  { label: 'Contact', position: [0, -2, 0], color: 0x00ccff },     // Bright Cyan
]

export default function Cube() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cubeRef = useRef<THREE.Group | null>(null)
  const textMeshesRef = useRef<THREE.Mesh[]>([])
  const [selectedFace, setSelectedFace] = useState<number | null>(null)

  const isRightMouseDownRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const mouseDownPosRef = useRef({ x: 0, y: 0 })
  const autoRotateTimeRef = useRef(0)
  const lastFrameTimeRef = useRef(performance.now())
  const brandingTextRef = useRef<THREE.Mesh | null>(null)
  const brandingGlowRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 12
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000510)
    currentMount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create cube group
    const cube = new THREE.Group()
    scene.add(cube)
    cubeRef.current = cube

    // Set initial cube scale based on screen size
    const isMobile = window.innerWidth < 768
    const initialCubeScale = isMobile ? 0.7 : 1
    cube.scale.set(initialCubeScale, initialCubeScale, initialCubeScale)

    // Create the 6 faces with proper rotations
    const planeGeometry = new THREE.PlaneGeometry(4, 4)

    FACES.forEach((faceData, index) => {
      // Create canvas texture for face
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')!

      // Draw background with gradient
      const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 350)
      const baseColor = `#${faceData.color.toString(16).padStart(6, '0')}`

      // Create darker version of the color for gradient
      const r = (faceData.color >> 16) & 0xff
      const g = (faceData.color >> 8) & 0xff
      const b = faceData.color & 0xff
      const darkerColor = `rgb(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)})`

      gradient.addColorStop(0, baseColor)
      gradient.addColorStop(0.7, baseColor)
      gradient.addColorStop(1, darkerColor)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 512, 512)

      // Add noise texture for space effect
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 512
        const opacity = Math.random() * 0.3
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fillRect(x, y, 1, 1)
      }

      // Draw border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 8
      ctx.strokeRect(20, 20, 472, 472)

      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        emissive: faceData.color,
        emissiveIntensity: 0.2,
        roughness: 0.3,
        metalness: 0.3,
        side: THREE.DoubleSide,
      })

      const mesh = new THREE.Mesh(planeGeometry, material)
      
      // Position and rotate each face to form a proper cube
      switch (index) {
        case 0: // Front (Process)
          mesh.position.z = 2
          break
        case 1: // Back (Build)
          mesh.position.z = -2
          mesh.rotation.y = Math.PI
          break
        case 2: // Right (Care)
          mesh.position.x = 2
          mesh.rotation.y = Math.PI / 2
          break
        case 3: // Left (Pricing)
          mesh.position.x = -2
          mesh.rotation.y = -Math.PI / 2
          break
        case 4: // Top (Why YDS)
          mesh.position.y = 2
          mesh.rotation.x = Math.PI / 2
          break
        case 5: // Bottom (Contact)
          mesh.position.y = -2
          mesh.rotation.x = -Math.PI / 2
          break
      }
      
      mesh.userData.faceIndex = index
      mesh.userData.label = faceData.label
      cube.add(mesh)

      // Create floating text plane for this face
      const textCanvas = document.createElement('canvas')
      textCanvas.width = 512
      textCanvas.height = 256
      const textCtx = textCanvas.getContext('2d')!

      // Draw text with outline
      textCtx.font = 'bold 72px Arial'
      textCtx.textAlign = 'center'
      textCtx.textBaseline = 'middle'

      // Black outline
      textCtx.strokeStyle = '#000000'
      textCtx.lineWidth = 12
      textCtx.strokeText(faceData.label, 256, 128)

      // White fill
      textCtx.fillStyle = '#ffffff'
      textCtx.fillText(faceData.label, 256, 128)

      const textTexture = new THREE.CanvasTexture(textCanvas)
      const textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.FrontSide
      })
      const textGeometry = new THREE.PlaneGeometry(3, 1.5)
      const textMesh = new THREE.Mesh(textGeometry, textMaterial)

      // Position and rotate text plane to match cube face
      switch (index) {
        case 0: // Front
          textMesh.position.z = 2.2
          break
        case 1: // Back
          textMesh.position.z = -2.2
          textMesh.rotation.y = Math.PI
          break
        case 2: // Right
          textMesh.position.x = 2.2
          textMesh.rotation.y = Math.PI / 2
          break
        case 3: // Left
          textMesh.position.x = -2.2
          textMesh.rotation.y = -Math.PI / 2
          break
        case 4: // Top
          textMesh.position.y = 2.15
          textMesh.rotation.x = -Math.PI / 2
          break
        case 5: // Bottom
          textMesh.position.y = -2.15
          textMesh.rotation.x = Math.PI / 2
          break
      }

      cube.add(textMesh)
      textMesh.userData.faceIndex = index
      textMeshesRef.current.push(textMesh)
    })

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4444ff, 0.3)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x00ffff, 2)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff00ff, 1.5)
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)

    // Helper function to update branding text position based on screen size
    const updateBrandingPosition = () => {
      const isMobile = window.innerWidth < 768

      if (brandingTextRef.current && brandingGlowRef.current) {
        if (isMobile) {
          // Mobile: smaller text, more centered
          const scale = 0.6
          brandingTextRef.current.scale.set(scale, scale, scale)
          brandingGlowRef.current.scale.set(scale * 1.02, scale * 1.02, scale * 1.02)
          brandingTextRef.current.position.set(-2, 5, -8)
          brandingGlowRef.current.position.set(-2, 5, -8)
        } else {
          // Desktop: normal size, left aligned
          const scale = 1
          brandingTextRef.current.scale.set(scale, scale, scale)
          brandingGlowRef.current.scale.set(scale * 1.02, scale * 1.02, scale * 1.02)
          brandingTextRef.current.position.set(-6, 5.5, -8)
          brandingGlowRef.current.position.set(-6, 5.5, -8)
        }
      }

      // Scale cube for mobile
      if (cubeRef.current) {
        const cubeScale = isMobile ? 0.7 : 1
        cubeRef.current.scale.set(cubeScale, cubeScale, cubeScale)
      }
    }

    // Load font and create 3D text
    const fontLoader = new FontLoader()
    fontLoader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      (font) => {
        const textGeometry = new TextGeometry('Yaz DigiStudio', {
          font: font,
          size: 1.2,
          depth: 0.01,
          curveSegments: 4,
          bevelEnabled: false
        })

        // Center the text geometry
        textGeometry.computeBoundingBox()
        const textWidth = textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x
        textGeometry.translate(-textWidth / 2, 0, 0)

        // Create material with transparency and glow
        const textMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        })

        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        brandingTextRef.current = textMesh
        scene.add(textMesh)

        // Add glow effect with a slightly larger duplicate
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.3
        })
        const glowMesh = new THREE.Mesh(textGeometry, glowMaterial)
        brandingGlowRef.current = glowMesh
        glowMesh.scale.multiplyScalar(1.02)
        scene.add(glowMesh)

        // Initial positioning based on screen size
        updateBrandingPosition()
      }
    )

    // Mouse movement
    const onPointerMove = (e: PointerEvent) => {
      // Only rotate if left mouse button is held down
      if (!isRightMouseDownRef.current) return

      // Calculate delta (how much mouse moved)
      const deltaX = e.clientX - lastMousePosRef.current.x
      const deltaY = e.clientY - lastMousePosRef.current.y

      if (cubeRef.current) {
        // Create rotation around world Y axis for horizontal drag
        const quaternionY = new THREE.Quaternion()
        quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005)

        // Create rotation around camera's right vector for vertical drag
        const quaternionX = new THREE.Quaternion()
        const cameraRight = new THREE.Vector3(1, 0, 0)
        cameraRight.applyQuaternion(cameraRef.current!.quaternion)
        quaternionX.setFromAxisAngle(cameraRight, deltaY * 0.005)

        // Apply rotations to cube (quaternion multiplication)
        cubeRef.current.quaternion.multiplyQuaternions(quaternionY, cubeRef.current.quaternion)
        cubeRef.current.quaternion.multiplyQuaternions(quaternionX, cubeRef.current.quaternion)
      }

      // Store current position for next delta calculation
      lastMousePosRef.current.x = e.clientX
      lastMousePosRef.current.y = e.clientY
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isRightMouseDownRef.current = true
        // Store initial mouse position when starting drag
        lastMousePosRef.current.x = e.clientX
        lastMousePosRef.current.y = e.clientY
        mouseDownPosRef.current.x = e.clientX
        mouseDownPosRef.current.y = e.clientY
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 0) {
        isRightMouseDownRef.current = false

        // Check if this was a click (not a drag)
        const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x)
        const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y)
        const isClick = deltaX < 5 && deltaY < 5

        if (isClick) {
          // Use raycasting to detect which face was clicked
          const raycaster = new THREE.Raycaster()
          const mouse = new THREE.Vector2()

          // Convert mouse position to normalized device coordinates (-1 to +1)
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

          raycaster.setFromCamera(mouse, cameraRef.current!)

          // Check for intersections with cube faces
          const intersects = raycaster.intersectObjects(cubeRef.current!.children, false)

          if (intersects.length > 0) {
            // Find the first mesh (not text plane) that was clicked
            for (const intersect of intersects) {
              if (intersect.object.userData.faceIndex !== undefined) {
                setSelectedFace(intersect.object.userData.faceIndex)
                break
              }
            }
          }
        }
      }
    }

    const onContextMenu = (e: Event) => {
      e.preventDefault()
    }

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (!cubeRef.current) return

      const step = 0.15

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const quaternion = new THREE.Quaternion()

        if (e.key === 'ArrowUp') {
          const cameraRight = new THREE.Vector3(1, 0, 0)
          cameraRight.applyQuaternion(cameraRef.current!.quaternion)
          quaternion.setFromAxisAngle(cameraRight, step)
        } else if (e.key === 'ArrowDown') {
          const cameraRight = new THREE.Vector3(1, 0, 0)
          cameraRight.applyQuaternion(cameraRef.current!.quaternion)
          quaternion.setFromAxisAngle(cameraRight, -step)
        } else if (e.key === 'ArrowLeft') {
          quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), step)
        } else if (e.key === 'ArrowRight') {
          quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -step)
        }

        cubeRef.current.quaternion.multiplyQuaternions(quaternion, cubeRef.current.quaternion)
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        selectNearestFace()
      }
    }

    // Click handler
    const selectNearestFace = () => {
      if (!cubeRef.current) return

      // Find the face nearest to camera
      const cameraDirection = new THREE.Vector3(0, 0, 1)
      cameraDirection.applyQuaternion(cameraRef.current!.quaternion)

      let nearestFace = 0
      let maxDot = -Infinity

      ;(cubeRef.current.children as THREE.Mesh[]).forEach((mesh) => {
        const faceNormal = new THREE.Vector3(0, 0, 1)
        faceNormal.applyQuaternion(mesh.quaternion)

        const dot = faceNormal.dot(cameraDirection)
        if (dot > maxDot) {
          maxDot = dot
          nearestFace = mesh.userData.faceIndex
        }
      })

      setSelectedFace(nearestFace)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('keydown', onKeyDown)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Calculate delta time for frame-rate independent animation
      const currentTime = performance.now()
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000  // Convert to seconds
      lastFrameTimeRef.current = currentTime

      // Auto-rotate when not being dragged
      if (!isRightMouseDownRef.current && cubeRef.current) {
        // Increment time based on actual elapsed time (frame-rate independent)
        // 0.01 was the old per-frame increment at ~60fps, which equals 0.6 per second
        // So we use deltaTime * 0.6 to maintain the same visual speed
        autoRotateTimeRef.current += deltaTime * 0.6

        const t = autoRotateTimeRef.current

        // Use sine/cosine with different periods for organic, varying rotation
        // Multiply by deltaTime * 60 to normalize to 60fps equivalent (frame-rate independent)
        const speedX = Math.sin(t * 0.3) * 0.003 * (deltaTime * 60)
        const speedY = Math.cos(t * 0.4) * 0.003 * (deltaTime * 60)
        const speedZ = Math.sin(t * 0.5) * 0.0015 * (deltaTime * 60)

        // Create quaternions for each axis
        const qx = new THREE.Quaternion()
        qx.setFromAxisAngle(new THREE.Vector3(1, 0, 0), speedX)

        const qy = new THREE.Quaternion()
        qy.setFromAxisAngle(new THREE.Vector3(0, 1, 0), speedY)

        const qz = new THREE.Quaternion()
        qz.setFromAxisAngle(new THREE.Vector3(0, 0, 1), speedZ)

        // Apply rotations
        cubeRef.current.quaternion.multiplyQuaternions(qx, cubeRef.current.quaternion)
        cubeRef.current.quaternion.multiplyQuaternions(qy, cubeRef.current.quaternion)
        cubeRef.current.quaternion.multiplyQuaternions(qz, cubeRef.current.quaternion)
      }

      // Flip text meshes if their corresponding cube face is upside down
      textMeshesRef.current.forEach((textMesh) => {
        const faceIndex = textMesh.userData.faceIndex

        // Find the corresponding cube face mesh
        const faceMesh = cubeRef.current!.children.find(
          child => child.userData.faceIndex === faceIndex && child !== textMesh
        ) as THREE.Mesh

        if (faceMesh) {
          // Get the world quaternion of the face
          const worldQuaternion = new THREE.Quaternion()
          faceMesh.getWorldQuaternion(worldQuaternion)

          // Calculate the up vector in world space
          const up = new THREE.Vector3(0, 1, 0)
          up.applyQuaternion(worldQuaternion)

          // If the up vector is pointing down (y component is negative), flip the text
          if (faceIndex === 4) {
            // Top face: keep X rotation constant, toggle Z to flip (inverted logic)
            textMesh.rotation.x = -Math.PI / 2
            textMesh.rotation.z = up.y >= 0 ? Math.PI : 0
          } else if (faceIndex === 5) {
            // Bottom face: keep X rotation constant, toggle Z to flip (inverted logic)
            textMesh.rotation.x = Math.PI / 2
            textMesh.rotation.z = up.y >= 0 ? Math.PI : 0
          } else {
            // Side faces: rotate around Z axis
            textMesh.rotation.z = up.y < 0 ? Math.PI : 0
          }
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      updateBrandingPosition()
    }

    window.addEventListener('resize', onWindowResize)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onWindowResize)
      renderer.dispose()
      currentMount?.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="cube-container">
      <div ref={mountRef} className="cube-canvas" />
      {selectedFace !== null && (
        <div className="face-content">
          <div className="face-content-inner">
            <h1>{FACES[selectedFace].label}</h1>
            <p>Content for {FACES[selectedFace].label}</p>
            <button onClick={() => setSelectedFace(null)}>Close</button>
          </div>
        </div>
      )}
      <div className="instructions">
        <p>Swipe to rotate • Tap face to select</p>
      </div>
    </div>
  )
}
