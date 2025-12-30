// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#00f0f0', // I - Cyan
    '#f0f000', // O - Yellow
    '#a000f0', // T - Purple
    '#00f000', // S - Green
    '#f00000', // Z - Red
    '#0000f0', // J - Blue
    '#f0a000'  // L - Orange
];

// Tetromino shapes (7 pieces, 4 rotations each)
const SHAPES = [
    // I piece
    [
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
        [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    // O piece
    [
        [[0,2,2,0], [0,2,2,0], [0,0,0,0], [0,0,0,0]],
        [[0,2,2,0], [0,2,2,0], [0,0,0,0], [0,0,0,0]],
        [[0,2,2,0], [0,2,2,0], [0,0,0,0], [0,0,0,0]],
        [[0,2,2,0], [0,2,2,0], [0,0,0,0], [0,0,0,0]]
    ],
    // T piece
    [
        [[0,3,0,0], [3,3,3,0], [0,0,0,0], [0,0,0,0]],
        [[0,3,0,0], [0,3,3,0], [0,3,0,0], [0,0,0,0]],
        [[0,0,0,0], [3,3,3,0], [0,3,0,0], [0,0,0,0]],
        [[0,3,0,0], [3,3,0,0], [0,3,0,0], [0,0,0,0]]
    ],
    // S piece
    [
        [[0,4,4,0], [4,4,0,0], [0,0,0,0], [0,0,0,0]],
        [[0,4,0,0], [0,4,4,0], [0,0,4,0], [0,0,0,0]],
        [[0,0,0,0], [0,4,4,0], [4,4,0,0], [0,0,0,0]],
        [[4,0,0,0], [4,4,0,0], [0,4,0,0], [0,0,0,0]]
    ],
    // Z piece
    [
        [[5,5,0,0], [0,5,5,0], [0,0,0,0], [0,0,0,0]],
        [[0,0,5,0], [0,5,5,0], [0,5,0,0], [0,0,0,0]],
        [[0,0,0,0], [5,5,0,0], [0,5,5,0], [0,0,0,0]],
        [[0,5,0,0], [5,5,0,0], [5,0,0,0], [0,0,0,0]]
    ],
    // J piece
    [
        [[6,0,0,0], [6,6,6,0], [0,0,0,0], [0,0,0,0]],
        [[0,6,6,0], [0,6,0,0], [0,6,0,0], [0,0,0,0]],
        [[0,0,0,0], [6,6,6,0], [0,0,6,0], [0,0,0,0]],
        [[0,6,0,0], [0,6,0,0], [6,6,0,0], [0,0,0,0]]
    ],
    // L piece
    [
        [[0,0,7,0], [7,7,7,0], [0,0,0,0], [0,0,0,0]],
        [[0,7,0,0], [0,7,0,0], [0,7,7,0], [0,0,0,0]],
        [[0,0,0,0], [7,7,7,0], [7,0,0,0], [0,0,0,0]],
        [[7,7,0,0], [0,7,0,0], [0,7,0,0], [0,0,0,0]]
    ]
];

// Game state
let board = [];
let currentPiece = null;
let score = 0;
let gameRunning = false;
let dropTime = 0;
let lastTime = 0;
let dropInterval = 1000; // 1 second

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Initialize board
function initBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// Create a new piece
function createPiece() {
    const type = Math.floor(Math.random() * SHAPES.length);
    return {
        type: type,
        shape: SHAPES[type][0],
        x: Math.floor(COLS / 2) - 2,
        y: 0,
        rotation: 0
    };
}

// Draw a single block
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the board
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, COLORS[board[y][x]]);
            }
        }
    }
}

// Draw the current piece
function drawPiece() {
    if (!currentPiece) return;
    
    const shape = currentPiece.shape;
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (shape[y][x]) {
                const blockX = currentPiece.x + x;
                const blockY = currentPiece.y + y;
                if (blockY >= 0) {
                    drawBlock(blockX, blockY, COLORS[shape[y][x]]);
                }
            }
        }
    }
}

// Check collision
function checkCollision(piece, dx = 0, dy = 0, newRotation = null) {
    const shape = newRotation !== null ? SHAPES[piece.type][newRotation] : piece.shape;
    const newX = piece.x + dx;
    const newY = piece.y + dy;
    
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (shape[y][x]) {
                const boardX = newX + x;
                const boardY = newY + y;
                
                // Check boundaries
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return true;
                }
                
                // Check collision with existing blocks (only if below top)
                if (boardY >= 0 && board[boardY][boardX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Lock piece to board
function lockPiece() {
    const shape = currentPiece.shape;
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (shape[y][x]) {
                const boardX = currentPiece.x + x;
                const boardY = currentPiece.y + y;
                if (boardY >= 0) {
                    board[boardY][boardX] = shape[y][x];
                }
            }
        }
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // Remove the line
            board.splice(y, 1);
            // Add a new empty line at the top
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    
    // Update score
    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] || 0;
        scoreElement.textContent = score;
    }
}

// Move piece
function movePiece(dx, dy) {
    if (!checkCollision(currentPiece, dx, dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

// Rotate piece
function rotatePiece() {
    const newRotation = (currentPiece.rotation + 1) % 4;
    const newShape = SHAPES[currentPiece.type][newRotation];
    
    if (!checkCollision(currentPiece, 0, 0, newRotation)) {
        currentPiece.rotation = newRotation;
        currentPiece.shape = newShape;
        return true;
    }
    return false;
}

// Drop piece
function dropPiece() {
    if (!movePiece(0, 1)) {
        lockPiece();
        clearLines();
        currentPiece = createPiece();
        
        // Check game over
        if (checkCollision(currentPiece)) {
            gameOver();
        }
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

// Start game
function startGame() {
    initBoard();
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    currentPiece = createPiece();
    gameOverElement.classList.add('hidden');
    lastTime = performance.now();
    gameLoop();
}

// Game loop
function gameLoop(time = 0) {
    if (!gameRunning) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropTime += deltaTime;
    
    if (dropTime > dropInterval) {
        dropPiece();
        dropTime = 0;
    }
    
    drawBoard();
    drawPiece();
    
    requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (movePiece(0, 1)) {
                score += 1; // Small bonus for soft drop
                scoreElement.textContent = score;
            }
            break;
        case ' ':
            e.preventDefault();
            rotatePiece();
            break;
    }
});

// Restart button
restartBtn.addEventListener('click', () => {
    startGame();
});

// Start the game
startGame();

