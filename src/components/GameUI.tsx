import { GameState } from '../game/tetrisLogic'

interface GameUIProps {
  gameState: GameState
  isPaused: boolean
  onRestart: () => void
  onPause: () => void
}

export function GameUI({ gameState, isPaused, onRestart, onPause }: GameUIProps) {
  return (
    <>
      {/* Score panel - top left */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <div
          className="bg-black/60 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-3 md:p-4 min-w-[140px] md:min-w-[180px]"
          style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.05)' }}
        >
          <div className="space-y-2 md:space-y-3">
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-cyan-400/70" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Score
              </p>
              <p className="text-xl md:text-3xl font-bold text-cyan-400" style={{ fontFamily: 'VT323, monospace', textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>
                {gameState.score.toString().padStart(6, '0')}
              </p>
            </div>
            <div className="flex gap-3 md:gap-4">
              <div>
                <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-pink-400/70" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Lines
                </p>
                <p className="text-lg md:text-xl font-bold text-pink-400" style={{ fontFamily: 'VT323, monospace', textShadow: '0 0 10px rgba(255, 0, 255, 0.8)' }}>
                  {gameState.lines}
                </p>
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-lime-400/70" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Level
                </p>
                <p className="text-lg md:text-xl font-bold text-lime-400" style={{ fontFamily: 'VT323, monospace', textShadow: '0 0 10px rgba(0, 255, 0, 0.8)' }}>
                  {gameState.level}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title - top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.3em] text-transparent bg-clip-text"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: 'linear-gradient(180deg, #00ffff 0%, #ff00ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
            filter: 'drop-shadow(0 0 20px rgba(255, 0, 255, 0.5))'
          }}
        >
          TETRIS
        </h1>
      </div>

      {/* Controls - top right */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <div className="flex gap-2">
          <button
            onClick={onPause}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/60 backdrop-blur-sm border border-yellow-500/50 text-yellow-400 text-lg md:text-xl font-bold transition-all hover:bg-yellow-500/20 hover:scale-105 active:scale-95"
            style={{ fontFamily: 'VT323, monospace', boxShadow: '0 0 15px rgba(255, 255, 0, 0.2)' }}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            onClick={onRestart}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/60 backdrop-blur-sm border border-pink-500/50 text-pink-400 text-lg md:text-xl font-bold transition-all hover:bg-pink-500/20 hover:scale-105 active:scale-95"
            style={{ fontFamily: 'VT323, monospace', boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)' }}
          >
            ↺
          </button>
        </div>
      </div>

      {/* Controls help - bottom right (desktop only) */}
      <div className="absolute bottom-8 right-6 z-20 hidden md:block">
        <div
          className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4"
          style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)' }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/70 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Controls
          </p>
          <div className="space-y-1 text-xs" style={{ fontFamily: 'VT323, monospace' }}>
            <p className="text-cyan-400/80">← → <span className="text-white/50">Move</span></p>
            <p className="text-pink-400/80">↑ <span className="text-white/50">Rotate</span></p>
            <p className="text-lime-400/80">↓ <span className="text-white/50">Soft Drop</span></p>
            <p className="text-yellow-400/80">SPACE <span className="text-white/50">Hard Drop</span></p>
          </div>
        </div>
      </div>

      {/* Game Over overlay */}
      {gameState.gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="text-center p-6 md:p-8 rounded-2xl border border-pink-500/50 bg-black/80"
            style={{
              boxShadow: '0 0 50px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.1)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            <h2
              className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                background: 'linear-gradient(180deg, #ff0000 0%, #ff00ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GAME OVER
            </h2>
            <p className="text-2xl md:text-3xl text-cyan-400 mb-2" style={{ fontFamily: 'VT323, monospace' }}>
              Final Score
            </p>
            <p
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              style={{ fontFamily: 'VT323, monospace', textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
            >
              {gameState.score}
            </p>
            <button
              onClick={onRestart}
              className="px-6 py-3 md:px-8 md:py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 text-white text-lg md:text-xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && !gameState.gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="text-center p-6 md:p-8 rounded-2xl border border-yellow-500/50 bg-black/80"
            style={{ boxShadow: '0 0 50px rgba(255, 255, 0, 0.3)' }}
          >
            <h2
              className="text-4xl md:text-6xl font-bold mb-6 text-yellow-400"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 20px rgba(255, 255, 0, 0.8)'
              }}
            >
              PAUSED
            </h2>
            <button
              onClick={onPause}
              className="px-6 py-3 md:px-8 md:py-4 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-lg md:text-xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              RESUME
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  )
}
