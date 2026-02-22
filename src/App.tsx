import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment } from '@react-three/drei'
import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { TetrisGame } from './components/TetrisGame'
import { GameUI } from './components/GameUI'
import { GameState, INITIAL_GAME_STATE } from './game/tetrisLogic'

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [isPaused, setIsPaused] = useState(false)
  const gameRef = useRef<{ moveLeft: () => void; moveRight: () => void; rotate: () => void; softDrop: () => void; hardDrop: () => void } | null>(null)

  const handleRestart = useCallback(() => {
    setGameState(INITIAL_GAME_STATE)
    setIsPaused(false)
  }, [])

  const handlePause = useCallback(() => {
    setIsPaused(p => !p)
  }, [])

  // Touch controls for mobile
  const handleTouchControl = useCallback((action: string) => {
    if (!gameRef.current || gameState.gameOver || isPaused) return
    switch (action) {
      case 'left':
        gameRef.current.moveLeft()
        break
      case 'right':
        gameRef.current.moveRight()
        break
      case 'rotate':
        gameRef.current.rotate()
        break
      case 'drop':
        gameRef.current.softDrop()
        break
      case 'hardDrop':
        gameRef.current.hardDrop()
        break
    }
  }, [gameState.gameOver, isPaused])

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 18], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #0a0014 0%, #000008 50%, #000a14 100%)' }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff00ff" />
          <spotLight
            position={[0, 20, 0]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color="#ffffff"
            castShadow
          />

          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <TetrisGame
            ref={gameRef}
            gameState={gameState}
            setGameState={setGameState}
            isPaused={isPaused}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={12}
            maxDistance={30}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            enableDamping
            dampingFactor={0.05}
          />

          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* Game UI Overlay */}
      <GameUI
        gameState={gameState}
        isPaused={isPaused}
        onRestart={handleRestart}
        onPause={handlePause}
      />

      {/* Mobile Touch Controls */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 md:hidden z-20 px-4">
        <button
          onTouchStart={() => handleTouchControl('left')}
          className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 font-bold text-2xl active:bg-cyan-500/40 transition-all"
        >
          ◀
        </button>
        <button
          onTouchStart={() => handleTouchControl('rotate')}
          className="w-14 h-14 rounded-xl bg-magenta-500/20 border border-pink-400/50 text-pink-400 font-bold text-xl active:bg-pink-500/40 transition-all"
          style={{ backgroundColor: 'rgba(255,0,255,0.2)' }}
        >
          ↻
        </button>
        <button
          onTouchStart={() => handleTouchControl('drop')}
          className="w-14 h-14 rounded-xl bg-lime-500/20 border border-lime-400/50 text-lime-400 font-bold text-2xl active:bg-lime-500/40 transition-all"
        >
          ▼
        </button>
        <button
          onTouchStart={() => handleTouchControl('right')}
          className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 font-bold text-2xl active:bg-cyan-500/40 transition-all"
        >
          ▶
        </button>
        <button
          onTouchStart={() => handleTouchControl('hardDrop')}
          className="w-14 h-14 rounded-xl bg-yellow-500/20 border border-yellow-400/50 text-yellow-400 font-bold text-sm active:bg-yellow-500/40 transition-all"
        >
          ⇊
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-3 left-0 right-0 text-center z-20">
        <p className="text-[10px] md:text-xs tracking-widest" style={{ color: 'rgba(0,255,255,0.3)', fontFamily: 'VT323, monospace' }}>
          Requested by @Koock12 · Built by @clonkbot
        </p>
      </footer>
    </div>
  )
}
