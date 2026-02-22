// Tetris game logic

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const BLOCK_SIZE = 1

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export interface Position {
  x: number
  y: number
}

export interface Tetromino {
  type: TetrominoType
  shape: number[][]
  position: Position
}

export interface GameState {
  board: (TetrominoType | null)[][]
  currentPiece: Tetromino | null
  nextPiece: TetrominoType
  score: number
  lines: number
  level: number
  gameOver: boolean
}

export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00ffff', // Cyan
  O: '#ffff00', // Yellow
  T: '#ff00ff', // Magenta
  S: '#00ff00', // Green
  Z: '#ff0000', // Red
  J: '#0000ff', // Blue
  L: '#ff8800', // Orange
}

export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

export const createEmptyBoard = (): (TetrominoType | null)[][] => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
}

export const getRandomTetromino = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
  return types[Math.floor(Math.random() * types.length)]
}

export const createTetromino = (type: TetrominoType): Tetromino => {
  return {
    type,
    shape: TETROMINO_SHAPES[type].map(row => [...row]),
    position: { x: Math.floor((BOARD_WIDTH - TETROMINO_SHAPES[type][0].length) / 2), y: 0 },
  }
}

export const rotateTetromino = (shape: number[][]): number[][] => {
  const rows = shape.length
  const cols = shape[0].length
  const rotated: number[][] = []

  for (let col = 0; col < cols; col++) {
    const newRow: number[] = []
    for (let row = rows - 1; row >= 0; row--) {
      newRow.push(shape[row][col])
    }
    rotated.push(newRow)
  }

  return rotated
}

export const isValidPosition = (
  board: (TetrominoType | null)[][],
  shape: number[][],
  position: Position
): boolean => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = position.x + col
        const newY = position.y + row

        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false
        }

        if (newY >= 0 && board[newY][newX] !== null) {
          return false
        }
      }
    }
  }
  return true
}

export const placePiece = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): (TetrominoType | null)[][] => {
  const newBoard = board.map(row => [...row])

  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const boardY = piece.position.y + row
        const boardX = piece.position.x + col
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type
        }
      }
    }
  }

  return newBoard
}

export const clearLines = (board: (TetrominoType | null)[][]): { newBoard: (TetrominoType | null)[][], linesCleared: number } => {
  const newBoard: (TetrominoType | null)[][] = []
  let linesCleared = 0

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    if (board[row].every(cell => cell !== null)) {
      linesCleared++
    } else {
      newBoard.push([...board[row]])
    }
  }

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null))
  }

  return { newBoard, linesCleared }
}

export const calculateScore = (linesCleared: number, level: number): number => {
  const points = [0, 100, 300, 500, 800]
  return points[linesCleared] * (level + 1)
}

export const INITIAL_GAME_STATE: GameState = {
  board: createEmptyBoard(),
  currentPiece: createTetromino(getRandomTetromino()),
  nextPiece: getRandomTetromino(),
  score: 0,
  lines: 0,
  level: 0,
  gameOver: false,
}
