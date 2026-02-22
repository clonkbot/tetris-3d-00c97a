import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  GameState,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_COLORS,
  TetrominoType,
  createTetromino,
  getRandomTetromino,
  rotateTetromino,
  isValidPosition,
  placePiece,
  clearLines,
  calculateScore,
  createEmptyBoard,
} from '../game/tetrisLogic'

interface TetrisGameProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  isPaused: boolean
}

const BLOCK_SIZE = 0.9
const GAP = 0.05

// Glowing block component
function Block({
  position,
  color,
  emissiveIntensity = 0.5
}: {
  position: [number, number, number]
  color: string
  emissiveIntensity?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  return (
    <RoundedBox
      ref={meshRef}
      args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]}
      radius={0.08}
      smoothness={4}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.8}
        roughness={0.2}
      />
    </RoundedBox>
  )
}

// Ghost piece showing where piece will land
function GhostPiece({ gameState }: { gameState: GameState }) {
  if (!gameState.currentPiece) return null

  // Calculate ghost position
  let ghostY = gameState.currentPiece.position.y
  while (
    isValidPosition(
      gameState.board,
      gameState.currentPiece.shape,
      { x: gameState.currentPiece.position.x, y: ghostY + 1 }
    )
  ) {
    ghostY++
  }

  const blocks: JSX.Element[] = []
  const { shape, position, type } = gameState.currentPiece
  const color = TETROMINO_COLORS[type]

  shape.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell) {
        const x = (position.x + colIdx - BOARD_WIDTH / 2 + 0.5) * (BLOCK_SIZE + GAP)
        const y = (BOARD_HEIGHT / 2 - ghostY - rowIdx - 0.5) * (BLOCK_SIZE + GAP)
        blocks.push(
          <RoundedBox
            key={`ghost-${rowIdx}-${colIdx}`}
            args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]}
            radius={0.08}
            smoothness={4}
            position={[x, y, 0]}
          >
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.2}
              emissive={color}
              emissiveIntensity={0.2}
            />
          </RoundedBox>
        )
      }
    })
  })

  return <group>{blocks}</group>
}

// Board frame
function BoardFrame() {
  const frameColor = '#1a1a2e'
  const edgeColor = '#00ffff'

  const width = (BOARD_WIDTH + 0.5) * (BLOCK_SIZE + GAP)
  const height = (BOARD_HEIGHT + 0.5) * (BLOCK_SIZE + GAP)
  const depth = BLOCK_SIZE * 2

  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, 0, -depth / 2 - 0.1]} receiveShadow>
        <boxGeometry args={[width + 0.4, height + 0.4, 0.2]} />
        <meshStandardMaterial
          color={frameColor}
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Grid lines on back */}
      {Array.from({ length: BOARD_WIDTH + 1 }).map((_, i) => (
        <mesh
          key={`v-${i}`}
          position={[(i - BOARD_WIDTH / 2) * (BLOCK_SIZE + GAP), 0, -depth / 2]}
        >
          <boxGeometry args={[0.02, height, 0.02]} />
          <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={0.3} transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, i) => (
        <mesh
          key={`h-${i}`}
          position={[0, (i - BOARD_HEIGHT / 2) * (BLOCK_SIZE + GAP), -depth / 2]}
        >
          <boxGeometry args={[width, 0.02, 0.02]} />
          <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={0.3} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Glowing edges */}
      {/* Left */}
      <mesh position={[-width / 2 - 0.15, 0, 0]}>
        <boxGeometry args={[0.1, height + 0.4, depth + 0.2]} />
        <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={0.5} metalness={0.8} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + 0.15, 0, 0]}>
        <boxGeometry args={[0.1, height + 0.4, depth + 0.2]} />
        <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={0.5} metalness={0.8} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 - 0.15, 0]}>
        <boxGeometry args={[width + 0.5, 0.1, depth + 0.2]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.5} metalness={0.8} />
      </mesh>
    </group>
  )
}

// Next piece preview
function NextPiecePreview({ pieceType }: { pieceType: TetrominoType }) {
  const tetromino = createTetromino(pieceType)
  const color = TETROMINO_COLORS[pieceType]
  const blocks: JSX.Element[] = []

  tetromino.shape.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell) {
        const x = (colIdx - tetromino.shape[0].length / 2 + 0.5) * (BLOCK_SIZE * 0.6)
        const y = (-rowIdx + tetromino.shape.length / 2 - 0.5) * (BLOCK_SIZE * 0.6)
        blocks.push(
          <RoundedBox
            key={`next-${rowIdx}-${colIdx}`}
            args={[BLOCK_SIZE * 0.5, BLOCK_SIZE * 0.5, BLOCK_SIZE * 0.5]}
            radius={0.05}
            smoothness={4}
            position={[x, y, 0]}
          >
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
        )
      }
    })
  })

  const previewX = (BOARD_WIDTH / 2 + 3) * (BLOCK_SIZE + GAP)
  const previewY = (BOARD_HEIGHT / 2 - 3) * (BLOCK_SIZE + GAP)

  return (
    <group position={[previewX, previewY, 0]}>
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="#00ffff"
        font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2"
        anchorX="center"
        anchorY="middle"
      >
        NEXT
      </Text>
      {/* Preview box */}
      <mesh position={[0, 0, -0.3]}>
        <boxGeometry args={[3, 3, 0.2]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.9} roughness={0.3} />
      </mesh>
      {blocks}
    </group>
  )
}

export const TetrisGame = forwardRef<
  { moveLeft: () => void; moveRight: () => void; rotate: () => void; softDrop: () => void; hardDrop: () => void },
  TetrisGameProps
>(({ gameState, setGameState, isPaused }, ref) => {
  const lastDropTime = useRef(0)
  const groupRef = useRef<THREE.Group>(null!)

  const moveLeft = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver) return

    const newPosition = {
      x: gameState.currentPiece.position.x - 1,
      y: gameState.currentPiece.position.y,
    }

    if (isValidPosition(gameState.board, gameState.currentPiece.shape, newPosition)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: prev.currentPiece ? {
          ...prev.currentPiece,
          position: newPosition,
        } : null,
      }))
    }
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, setGameState])

  const moveRight = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver) return

    const newPosition = {
      x: gameState.currentPiece.position.x + 1,
      y: gameState.currentPiece.position.y,
    }

    if (isValidPosition(gameState.board, gameState.currentPiece.shape, newPosition)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: prev.currentPiece ? {
          ...prev.currentPiece,
          position: newPosition,
        } : null,
      }))
    }
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, setGameState])

  const rotate = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver) return

    const rotatedShape = rotateTetromino(gameState.currentPiece.shape)

    if (isValidPosition(gameState.board, rotatedShape, gameState.currentPiece.position)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: prev.currentPiece ? {
          ...prev.currentPiece,
          shape: rotatedShape,
        } : null,
      }))
    }
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, setGameState])

  const softDrop = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver) return

    const newPosition = {
      x: gameState.currentPiece.position.x,
      y: gameState.currentPiece.position.y + 1,
    }

    if (isValidPosition(gameState.board, gameState.currentPiece.shape, newPosition)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: prev.currentPiece ? {
          ...prev.currentPiece,
          position: newPosition,
        } : null,
        score: prev.score + 1,
      }))
    }
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, setGameState])

  const hardDrop = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver) return

    let dropDistance = 0
    let newY = gameState.currentPiece.position.y

    while (
      isValidPosition(
        gameState.board,
        gameState.currentPiece.shape,
        { x: gameState.currentPiece.position.x, y: newY + 1 }
      )
    ) {
      newY++
      dropDistance++
    }

    const droppedPiece = {
      ...gameState.currentPiece,
      position: { x: gameState.currentPiece.position.x, y: newY },
    }

    const newBoard = placePiece(gameState.board, droppedPiece)
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
    const newLines = gameState.lines + linesCleared
    const newLevel = Math.floor(newLines / 10)
    const scoreIncrease = calculateScore(linesCleared, gameState.level) + dropDistance * 2

    const nextType = getRandomTetromino()
    const newPiece = createTetromino(gameState.nextPiece)

    const isGameOver = !isValidPosition(clearedBoard, newPiece.shape, newPiece.position)

    setGameState(prev => ({
      ...prev,
      board: clearedBoard,
      currentPiece: isGameOver ? null : newPiece,
      nextPiece: nextType,
      score: prev.score + scoreIncrease,
      lines: newLines,
      level: newLevel,
      gameOver: isGameOver,
    }))
  }, [gameState, setGameState])

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
  }), [moveLeft, moveRight, rotate, softDrop, hardDrop])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver || isPaused) return

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          moveLeft()
          break
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          moveRight()
          break
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          rotate()
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          softDrop()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.gameOver, isPaused, moveLeft, moveRight, rotate, softDrop, hardDrop])

  // Game loop for automatic dropping
  useFrame((state) => {
    if (gameState.gameOver || isPaused || !gameState.currentPiece) return

    const dropInterval = Math.max(100, 1000 - gameState.level * 100)
    const currentTime = state.clock.getElapsedTime() * 1000

    if (currentTime - lastDropTime.current > dropInterval) {
      lastDropTime.current = currentTime

      const newPosition = {
        x: gameState.currentPiece.position.x,
        y: gameState.currentPiece.position.y + 1,
      }

      if (isValidPosition(gameState.board, gameState.currentPiece.shape, newPosition)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: prev.currentPiece ? {
            ...prev.currentPiece,
            position: newPosition,
          } : null,
        }))
      } else {
        // Lock piece
        const newBoard = placePiece(gameState.board, gameState.currentPiece)
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
        const newLines = gameState.lines + linesCleared
        const newLevel = Math.floor(newLines / 10)
        const scoreIncrease = calculateScore(linesCleared, gameState.level)

        const nextType = getRandomTetromino()
        const newPiece = createTetromino(gameState.nextPiece)

        const isGameOver = !isValidPosition(clearedBoard, newPiece.shape, newPiece.position)

        setGameState(prev => ({
          ...prev,
          board: clearedBoard,
          currentPiece: isGameOver ? null : newPiece,
          nextPiece: nextType,
          score: prev.score + scoreIncrease,
          lines: newLines,
          level: newLevel,
          gameOver: isGameOver,
        }))
      }
    }

    // Subtle floating animation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.02
    }
  })

  // Render board blocks
  const boardBlocks: JSX.Element[] = []
  gameState.board.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell) {
        const x = (colIdx - BOARD_WIDTH / 2 + 0.5) * (BLOCK_SIZE + GAP)
        const y = (BOARD_HEIGHT / 2 - rowIdx - 0.5) * (BLOCK_SIZE + GAP)
        boardBlocks.push(
          <Block
            key={`board-${rowIdx}-${colIdx}`}
            position={[x, y, 0]}
            color={TETROMINO_COLORS[cell]}
            emissiveIntensity={0.4}
          />
        )
      }
    })
  })

  // Render current piece
  const currentPieceBlocks: JSX.Element[] = []
  if (gameState.currentPiece) {
    const { shape, position, type } = gameState.currentPiece
    const color = TETROMINO_COLORS[type]

    shape.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell) {
          const x = (position.x + colIdx - BOARD_WIDTH / 2 + 0.5) * (BLOCK_SIZE + GAP)
          const y = (BOARD_HEIGHT / 2 - position.y - rowIdx - 0.5) * (BLOCK_SIZE + GAP)
          currentPieceBlocks.push(
            <Block
              key={`current-${rowIdx}-${colIdx}`}
              position={[x, y, 0]}
              color={color}
              emissiveIntensity={0.8}
            />
          )
        }
      })
    })
  }

  return (
    <group ref={groupRef}>
      <BoardFrame />
      <GhostPiece gameState={gameState} />
      {boardBlocks}
      {currentPieceBlocks}
      <NextPiecePreview pieceType={gameState.nextPiece} />
    </group>
  )
})
