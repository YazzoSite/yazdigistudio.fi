import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useLanguage } from '../contexts/LanguageContext'
import { ProcessCard } from './cards/ProcessCard'
import { BuildCard } from './cards/BuildCard'
import { CareCard } from './cards/CareCard'
import { PricingCard } from './cards/PricingCard'
import { WhyYazCard } from './cards/WhyYazCard'
import { ContactCard } from './cards/ContactCard'
import './Cube.css'

const FACES = [
  { contentType: 'process', position: [0, 0, 2], color: 0x0044ff },      // Deep Electric Blue
  { contentType: 'build', position: [0, 0, -2], color: 0xff0033 },       // Deep Crimson Red
  { contentType: 'care', position: [2, 0, 0], color: 0xaa00ff },         // Deep Violet Purple
  { contentType: 'pricing', position: [-2, 0, 0], color: 0xffbb00 },     // Golden Amber
  { contentType: 'why-yaz', position: [0, 2, 0], color: 0xff0099 },      // Hot Magenta
  { contentType: 'contact', position: [0, -2, 0], color: 0x00ccff },     // Bright Cyan
] as const

type CubeProps = {
  selectedFace: number | null
  onFaceSelect: (faceIndex: number | null) => void
}

export default function Cube({ selectedFace, onFaceSelect }: CubeProps) {
  const { language } = useLanguage()
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cubeRef = useRef<THREE.Group | null>(null)
  const textMeshesRef = useRef<THREE.Mesh[]>([])
  const [faceLabels, setFaceLabels] = useState<string[]>([
    'Process', 'Build', 'Care', 'Pricing', 'Why Yaz', 'Contact'
  ])
  const [faceContent, setFaceContent] = useState<unknown>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [uiContent, setUiContent] = useState<{ instructions: { desktop: string; mobile: string } } | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showModal, setShowModal] = useState(false)

  const isRightMouseDownRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const mouseDownPosRef = useRef({ x: 0, y: 0 })
  const autoRotateTimeRef = useRef(0)
  const lastFrameTimeRef = useRef(performance.now())
  const starsRef = useRef<THREE.Points | null>(null)

  // Animation mode tracking
  const animationModeRef = useRef<'idle' | 'positioning' | 'paused'>('idle')
  const positionStartTimeRef = useRef(0)
  const targetRotationRef = useRef<THREE.Quaternion | null>(null)
  const pendingFaceIndexRef = useRef<number | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)

  // Load UI content when language changes
  useEffect(() => {
    const loadUiContent = async () => {
      try {
        const response = await fetch(`/content/ui-${language}.json`)
        if (response.ok) {
          const data = await response.json()
          setUiContent(data)
        }
      } catch (error) {
        console.error('Error loading UI content:', error)
      }
    }

    loadUiContent()
  }, [language])

  // Load content for all faces when language changes
  useEffect(() => {
    const loadAllContent = async () => {
      try {
        const labels: string[] = []

        for (const face of FACES) {
          const response = await fetch(`/content/${face.contentType}-${language}.json`)
          if (response.ok) {
            const data = await response.json()
            // Use shortTitle for cube faces
            labels.push(data.shortTitle || data.title || face.contentType)
          } else {
            labels.push(face.contentType)
          }
        }

        setFaceLabels(labels)
      } catch (error) {
        console.error('Error loading face labels:', error)
      }
    }

    loadAllContent()
  }, [language])

  // Load full content when a face is selected
  useEffect(() => {
    if (selectedFace === null) {
      setFaceContent(null)
      return
    }

    const loadFaceContent = async () => {
      setLoadingContent(true)
      try {
        const contentType = FACES[selectedFace].contentType
        const response = await fetch(`/content/${contentType}-${language}.json`)
        if (response.ok) {
          const data = await response.json()
          setFaceContent(data)
        }
      } catch (error) {
        console.error('Error loading face content:', error)
      } finally {
        setLoadingContent(false)
      }
    }

    loadFaceContent()
  }, [selectedFace, language])

  // Update text meshes when face labels change (language switch)
  useEffect(() => {
    if (textMeshesRef.current.length === 0 || faceLabels.length === 0) return

    textMeshesRef.current.forEach((textMesh, index) => {
      // Create a new canvas with the updated label
      const textCanvas = document.createElement('canvas')
      textCanvas.width = 512
      textCanvas.height = 256
      const textCtx = textCanvas.getContext('2d')!

      const label = faceLabels[index] || FACES[index].contentType
      textCtx.font = 'bold 72px Arial'
      textCtx.textAlign = 'center'
      textCtx.textBaseline = 'middle'

      // Black outline
      textCtx.strokeStyle = '#000000'
      textCtx.lineWidth = 12
      textCtx.strokeText(label, 256, 128)

      // White fill
      textCtx.fillStyle = '#ffffff'
      textCtx.fillText(label, 256, 128)

      // Update the texture
      const newTexture = new THREE.CanvasTexture(textCanvas)
      const material = textMesh.material as THREE.MeshBasicMaterial
      if (material.map) {
        material.map.dispose()
      }
      material.map = newTexture
      material.needsUpdate = true
    })
  }, [faceLabels])

  // Watch selectedFace prop changes (from header navigation)
  // Trigger cube rotation animation when header button is clicked
  useEffect(() => {
    if (selectedFace === null || !cubeRef.current) return

    // If modal is already open, just keep it open and switch content
    // (content will be loaded by the useEffect at lines 101-124)
    if (showModal) {
      return
    }

    // Modal not open yet, animate cube rotation before showing modal
    const targetQuaternion = new THREE.Quaternion()

    switch (selectedFace) {
      case 0: // Front face - already facing camera, just make it upright
        targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0)
        break
      case 1: // Back face - rotate 180° around Y
        targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
        break
      case 2: // Right face - rotate -90° around Y
        targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2)
        break
      case 3: // Left face - rotate 90° around Y
        targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
        break
      case 4: // Top face - rotate 90° around X (tilt down to face camera)
        targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
        break
      case 5: // Bottom face - rotate -90° around X (tilt up to face camera)
        targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
        break
    }

    // Trigger positioning animation (same as click)
    animationModeRef.current = 'positioning'
    positionStartTimeRef.current = performance.now()
    pendingFaceIndexRef.current = selectedFace
    targetRotationRef.current = targetQuaternion
    setShowModal(false) // Hide modal during animation
  }, [selectedFace, showModal])

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current

    // Reset text meshes ref to prevent duplicates in Strict Mode
    textMeshesRef.current = []

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
      mesh.userData.contentType = faceData.contentType
      cube.add(mesh)

      // Create floating text plane for this face
      const textCanvas = document.createElement('canvas')
      textCanvas.width = 512
      textCanvas.height = 256
      const textCtx = textCanvas.getContext('2d')!

      // Draw text with outline (using initial label from state)
      const label = faceLabels[index] || faceData.contentType
      textCtx.font = 'bold 72px Arial'
      textCtx.textAlign = 'center'
      textCtx.textBaseline = 'middle'

      // Black outline
      textCtx.strokeStyle = '#000000'
      textCtx.lineWidth = 12
      textCtx.strokeText(label, 256, 128)

      // White fill
      textCtx.fillStyle = '#ffffff'
      textCtx.fillText(label, 256, 128)

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

    // Create star field background
    const starCount = 200
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    const starPhases = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      // Random position in a sphere around the scene
      const radius = 50 + Math.random() * 50
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = radius * Math.cos(phi)

      // Random color between light yellow and light blue
      const colorMix = Math.random()
      const lightYellow = new THREE.Color(0xffffcc) // Light yellow
      const lightBlue = new THREE.Color(0xccddff) // Light blue
      const starColor = lightYellow.lerp(lightBlue, colorMix)

      starColors[i * 3] = starColor.r
      starColors[i * 3 + 1] = starColor.g
      starColors[i * 3 + 2] = starColor.b

      // Random phase for varied brightness (not animated, just for variety)
      starPhases[i] = Math.random()
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    starGeometry.setAttribute('phase', new THREE.BufferAttribute(starPhases, 1))

    // Shader material for circular stars with varied static brightness
    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float phase;
        varying vec3 vColor;
        varying float vPhase;

        void main() {
          vColor = color;
          vPhase = phase;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 150.0 / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vPhase;

        void main() {
          // Circular point shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;

          // Static opacity based on phase (0.3 to 1.0 range for variety)
          float opacity = 0.3 + 0.7 * vPhase;

          gl_FragColor = vec4(vColor, opacity);
        }
      `,
      transparent: true,
      vertexColors: true
    })

    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)
    starsRef.current = stars

    // Helper function to update cube scale based on screen size
    const updateCubeScale = () => {
      const isMobile = window.innerWidth < 768

      // Scale cube for mobile
      if (cubeRef.current) {
        const cubeScale = isMobile ? 0.7 : 1
        cubeRef.current.scale.set(cubeScale, cubeScale, cubeScale)
      }
    }

    // Initial cube scaling
    updateCubeScale()

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
                const faceIndex = intersect.object.userData.faceIndex

                // Start positioning animation - turn selected face to front
                animationModeRef.current = 'positioning'
                positionStartTimeRef.current = performance.now()
                pendingFaceIndexRef.current = faceIndex

                // Calculate target rotation based on which face was clicked
                // Each face needs a different rotation to face camera upright
                const targetQuaternion = new THREE.Quaternion()

                switch (faceIndex) {
                  case 0: // Front face - already facing camera, just make it upright
                    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0)
                    break
                  case 1: // Back face - rotate 180° around Y
                    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
                    break
                  case 2: // Right face - rotate -90° around Y
                    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2)
                    break
                  case 3: // Left face - rotate 90° around Y
                    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
                    break
                  case 4: // Top face - rotate 90° around X (tilt down to face camera)
                    targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
                    break
                  case 5: // Bottom face - rotate -90° around X (tilt up to face camera)
                    targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
                    break
                }

                targetRotationRef.current = targetQuaternion
                break
              }
            }
          }
        }
      }
    }

    const onContextMenu = (e: MouseEvent) => {
      // Allow context menu when Ctrl/Cmd is held (for browser dev tools)
      if (e.ctrlKey || e.metaKey) {
        return
      }
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

      onFaceSelect(nearestFace)
      setShowModal(true) // Show modal immediately for drag release
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('keydown', onKeyDown)

    // Animation loop with frame rate limiting
    const fpsLimit = 60
    const frameDelay = 1000 / fpsLimit
    let lastRenderTime = 0

    const animate = (currentTime: number) => {
      // Keep the animation loop running always
      animationFrameIdRef.current = requestAnimationFrame(animate)

      const mode = animationModeRef.current

      // Skip rendering when paused (modal is open)
      if (mode === 'paused') {
        return
      }

      // Limit to 60fps for better performance
      const timeSinceLastRender = currentTime - lastRenderTime
      if (timeSinceLastRender < frameDelay) return

      lastRenderTime = currentTime - (timeSinceLastRender % frameDelay)

      // Calculate delta time for frame-rate independent animation
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000  // Convert to seconds
      lastFrameTimeRef.current = currentTime

      // Handle different animation modes
      if (!isRightMouseDownRef.current && cubeRef.current) {
        if (mode === 'positioning') {
          // Smoothly rotate to face forward, then pause before showing modal
          const elapsed = (currentTime - positionStartTimeRef.current) / 1000
          const rotationDuration = 0.8 // Rotate for 0.8 seconds
          const pauseDuration = 0.3 // Pause for 0.3 seconds
          const totalDuration = rotationDuration + pauseDuration

          if (elapsed < rotationDuration && targetRotationRef.current) {
            // Smooth interpolation to target rotation
            const progress = elapsed / rotationDuration // 0 to 1 over rotation duration
            const easedProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

            cubeRef.current.quaternion.slerp(targetRotationRef.current, easedProgress * 0.2)
          } else if (elapsed >= totalDuration) {
            // Animation and pause complete, show modal and stop rendering
            animationModeRef.current = 'paused'
            if (pendingFaceIndexRef.current !== null) {
              onFaceSelect(pendingFaceIndexRef.current)
              pendingFaceIndexRef.current = null
              setShowModal(true) // Show modal after animation completes
            }
            // Stop the animation loop (will be handled in next frame)
            return
          }
          // Between rotationDuration and totalDuration, just pause (no rotation)
        } else if (mode === 'idle') {
          // Normal auto-rotate
          autoRotateTimeRef.current += deltaTime * 0.6

          const t = autoRotateTimeRef.current

          const speedX = Math.sin(t * 0.3) * 0.003 * (deltaTime * 60)
          const speedY = Math.cos(t * 0.4) * 0.003 * (deltaTime * 60)
          const speedZ = Math.sin(t * 0.5) * 0.0015 * (deltaTime * 60)

          const qx = new THREE.Quaternion()
          qx.setFromAxisAngle(new THREE.Vector3(1, 0, 0), speedX)

          const qy = new THREE.Quaternion()
          qy.setFromAxisAngle(new THREE.Vector3(0, 1, 0), speedY)

          const qz = new THREE.Quaternion()
          qz.setFromAxisAngle(new THREE.Vector3(0, 0, 1), speedZ)

          cubeRef.current.quaternion.multiplyQuaternions(qx, cubeRef.current.quaternion)
          cubeRef.current.quaternion.multiplyQuaternions(qy, cubeRef.current.quaternion)
          cubeRef.current.quaternion.multiplyQuaternions(qz, cubeRef.current.quaternion)
        }
        // If mode === 'paused', don't animate at all
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

    requestAnimationFrame(animate)

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      updateCubeScale()
      setIsMobile(window.innerWidth < 768)
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

  const renderCard = () => {
    if (selectedFace === null || !faceContent) return null

    const contentType = FACES[selectedFace].contentType
    const handleClose = () => {
      setShowModal(false)
      onFaceSelect(null)
      // Resume animation when modal closes (main loop is always running)
      animationModeRef.current = 'idle'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = faceContent as any

    switch (contentType) {
      case 'process':
        return <ProcessCard content={content} onClose={handleClose} />
      case 'build':
        return <BuildCard content={content} onClose={handleClose} />
      case 'care':
        return <CareCard content={content} onClose={handleClose} />
      case 'pricing':
        return <PricingCard content={content} onClose={handleClose} />
      case 'why-yaz':
        return <WhyYazCard content={content} onClose={handleClose} />
      case 'contact':
        return <ContactCard content={content} onClose={handleClose} />
      default:
        return null
    }
  }

  return (
    <div className="cube-container">
      <div
        ref={mountRef}
        className="cube-canvas"
        style={{
          opacity: selectedFace !== null && showModal ? 0 : 1,
          pointerEvents: selectedFace !== null && showModal ? 'none' : 'auto'
        }}
      />
      {selectedFace !== null && showModal && (
        <div
          className="face-content"
          style={{
            background: `#${FACES[selectedFace].color.toString(16).padStart(6, '0')}`
          }}
        >
          <div className="face-content-inner">
            {loadingContent ? (
              <div className="loading">Loading...</div>
            ) : (
              renderCard()
            )}
          </div>
        </div>
      )}
      {selectedFace === null && uiContent && (
        <div className="instructions">
          <p>
            {isMobile
              ? uiContent.instructions.mobile
              : uiContent.instructions.desktop}
          </p>
        </div>
      )}
    </div>
  )
}
