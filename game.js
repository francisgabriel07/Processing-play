// =================================================================
// === JUEGOS.JS: VERSIÓN FINAL Y COMPLETA CON TODAS LAS MEJORAS ===
// =================================================================

// --- CLASE BASE PARA TODOS LOS JUEGOS (Abstracción/Herencia) ---
class JuegoBase {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.nombre = 'Juego Base';
    }
    // ESTA FUNCIÓN SOLO SE EJECUTARÍA SI UNA CLASE HIJA NO LA SOBREESCRIBE
    render() {
        this.container.innerHTML = `<h2 style="color: #e74c3c;">${this.nombre}</h2><p>El juego base solo define la estructura, esto es un error.</p>`;
    }
    cleanup() {
        this.container.innerHTML = '';
        // Limpiar todos los listeners y timers
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.keyListeners) {
            document.removeEventListener('keydown', this.keyListeners);
        }
        // Desactivar el manejo especial de teclas para Dino Runner
        if (this.handleDinoKeys) {
            document.removeEventListener('keydown', this.handleDinoKeys);
            document.removeEventListener('keyup', this.handleDinoKeys);
        }
    }
}


// --- LÓGICA DE PANTALLA COMPLETA ---
function requestFullscreen() {
    const element = document.documentElement; 
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { 
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { 
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { 
        element.msRequestFullscreen();
    }
}


// ----------------------------------------------------------------
// --- 1. TRIQUI (Tic-Tac-Toe) ---

class Triqui extends JuegoBase {
    constructor(containerId) {
        super(containerId);
        this.nombre = 'Triqui (X y O)';
        this.size = null; 
        this.board = [];
        this.currentPlayer = 'X';
        this.gameMode = null; 
        this.cpuDifficulty = null; 
        this.gameActive = true;
    }
    
    render() {
        if (!this.size) {
            this.renderSizeMenu();
        } else if (!this.gameMode) {
            this.renderModeMenu();
        } else {
            this.renderBoard();
        }
    }

    renderSizeMenu() {
        this.container.innerHTML = `
            <h2 style="color: #34495e; margin-bottom: 20px;">${this.nombre} - Elige Tamaño de Mesa</h2>
            <div id="triqui-menu">
                <button onclick="app.currentGame.setSize(3)">Tablero 3x3 (Clásico)</button>
                <button onclick="app.currentGame.setSize(5)">Tablero 5x5 (Grande)</button>
            </div>
        `;
    }
    
    setSize(size) {
        this.size = size;
        this.board = Array(size * size).fill(null);
        this.renderModeMenu();
    }
    
    renderModeMenu() {
        this.container.innerHTML = `
            <h2 style="color: #34495e; margin-bottom: 20px;">${this.nombre} (${this.size}x${this.size})</h2>
            <div id="triqui-menu">
                <h3>Elige el Modo de Juego:</h3>
                <button onclick="app.currentGame.setMode('2P')" style="background-color: #1abc9c;">Jugador vs. Jugador</button>
                <button onclick="app.currentGame.setMode('CPU')" style="background-color: #3498db;">Jugador vs. Máquina</button>
            </div>
             <button onclick="app.currentGame.resetGame(true)" style="margin-top: 15px;">⬅️ Volver a Tamaño</button>
        `;
    }

    setMode(mode) {
        this.gameMode = mode;
        if (mode === 'CPU') {
            this.renderDifficulty();
        } else {
            this.renderBoard();
        }
    }

    renderDifficulty() {
        this.container.innerHTML = `
            <h2 style="color: #34495e; margin-bottom: 20px;">Máquina - Elige Dificultad:</h2>
            <div id="triqui-menu">
                <button onclick="app.currentGame.setDifficulty('Facil')">Fácil (Aleatorio)</button>
                <button onclick="app.currentGame.setDifficulty('Intermedio')">Intermedio (Bloquea/Gana Inmediato)</button>
                <button onclick="app.currentGame.setDifficulty('Dificil')">Difícil (Minimax)</button>
                <button onclick="app.currentGame.setDifficulty('Elegido')">Elegido (Siempre Gana o Empata)</button>
            </div>
            <button onclick="app.currentGame.renderModeMenu()" style="margin-top: 15px;">⬅️ Volver a Modo</button>
        `;
    }

    setDifficulty(difficulty) {
        this.cpuDifficulty = difficulty;
        this.renderBoard();
    }
    
    renderBoard() {
        const totalCells = this.size * this.size;
        let boardHTML = '';
        for (let i = 0; i < totalCells; i++) {
            const playerClass = this.board[i] === 'X' ? 'playerX' : (this.board[i] === 'O' ? 'playerO' : '');
            
            boardHTML += `<div class="triqui-cell ${playerClass}" onclick="app.currentGame.handleMove(${i})">${this.board[i] || ''}</div>`;
        }

        const status = this.gameActive ? `Turno de: ${this.currentPlayer}` : 'Juego Terminado';
        const boardClass = this.size === 5 ? 'triqui-board-large' : '';
        
        this.container.innerHTML = `
            <h2 style="color: #34495e;">${this.nombre} (${this.size}x${this.size})</h2>
            <div id="triqui-menu">
                <p>Modo: ${this.gameMode === '2P' ? '2 Jugadores' : `Vs. Máquina (${this.cpuDifficulty})`}</p>
                <p style="font-weight: bold; font-size: 1.2em;">${status}</p>
            </div>
            <div id="triqui-board" class="${boardClass}" style="grid-template-columns: repeat(${this.size}, auto);">${boardHTML}</div>
            <button onclick="app.currentGame.resetGame(true)" style="background-color: #e74c3c; padding: 10px 20px; border-radius: 5px; color: white; border: none; margin-top: 20px;">Reiniciar Todo</button>
        `;

        if (this.gameActive && this.gameMode === 'CPU' && this.currentPlayer === 'O') {
            document.getElementById('triqui-board').style.pointerEvents = 'none'; 
            setTimeout(() => {
                this.cpuMove(); 
            }, 800); 
        } else if (!this.gameActive) {
             document.getElementById('triqui-board').style.pointerEvents = 'none'; 
        }
    }

    handleMove(index) {
        if (!this.gameActive || this.board[index] || (this.gameMode === 'CPU' && this.currentPlayer === 'O')) return;

        this.board[index] = this.currentPlayer;
        
        if (this.checkWin()) {
            this.gameActive = false;
            setTimeout(() => { alert(`¡${this.currentPlayer} ha ganado!`); this.renderBoard(); }, 10);
        } else if (this.board.every(cell => cell)) {
            this.gameActive = false;
            setTimeout(() => { alert("¡Empate!"); this.renderBoard(); }, 10);
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
        
        this.renderBoard();
    }

    checkWin() {
        const size = this.size;
        const board = this.board;
        const totalCells = size * size;
        const winLength = size === 3 ? 3 : 4; 

        for (let i = 0; i < totalCells; i++) {
            if (board[i] === null) continue;
            
            const row = Math.floor(i / size);
            const col = i % size;

            if (col <= size - winLength) { 
                let win = true;
                for (let k = 0; k < winLength; k++) { if (board[i + k] !== board[i]) { win = false; break; } }
                if (win) return true;
            }
            if (row <= size - winLength) { 
                let win = true;
                for (let k = 0; k < winLength; k++) { if (board[i + k * size] !== board[i]) { win = false; break; } }
                if (win) return true;
            }
            if (col <= size - winLength && row <= size - winLength) { 
                let win = true;
                for (let k = 0; k < winLength; k++) { if (board[i + k * (size + 1)] !== board[i]) { win = false; break; } }
                if (win) return true;
            }
            if (col >= winLength - 1 && row <= size - winLength) { 
                let win = true;
                for (let k = 0; k < winLength; k++) { if (board[i + k * (size - 1)] !== board[i]) { win = false; break; } }
                if (win) return true;
            }
        }
        return false;
    }


    resetGame(fullReset = false) {
        this.board = Array(this.size * this.size).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        if (fullReset) {
            this.size = null;
            this.gameMode = null;
            this.cpuDifficulty = null;
            this.render();
        } else {
             this.renderBoard();
        }
    }
    
    cpuMove() {
        const availableMoves = this.board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
        
        if (availableMoves.length > 0) {
            let moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            
            this.board[moveIndex] = this.currentPlayer;
            
            if (this.checkWin()) {
                this.gameActive = false;
                setTimeout(() => { alert(`¡${this.currentPlayer} ha ganado!`); this.renderBoard(); }, 10);
            } else if (this.board.every(cell => cell)) {
                this.gameActive = false;
                setTimeout(() => { alert("¡Empate!"); this.renderBoard(); }, 10);
            } else {
                this.currentPlayer = 'X'; 
            }
        } 
        
        this.renderBoard();
    }
}


// ----------------------------------------------------------------
// --- 2. DAMAS (Checkers) - ¡MEJORADO: Captura Obligatoria y Variantes! ---

class Damas extends JuegoBase {
    constructor(containerId) {
        super(containerId);
        this.nombre = 'Juego de Damas';
        this.gameMode = null;
        this.boardSize = null; // 8 (Inglesas) o 10 (Internacionales)
        this.board = []; 
        this.currentPlayer = 'red';
        this.selectedPieceIndex = null;
        this.mustJump = false; // Indica si existe una captura obligatoria
        this.winner = null;
    }

    render() {
        if (!this.boardSize) {
            this.renderVariantMenu();
        } else if (!this.gameMode) {
            this.renderModeMenu();
        } else {
            this.renderBoard();
        }
    }
    
    renderVariantMenu() {
         this.container.innerHTML = `
            <h2 style="color: #34495e; margin-bottom: 20px;">${this.nombre} - Elige Variante</h2>
            <div id="damas-menu">
                <h3>Elige el Tablero:</h3>
                <button onclick="app.currentGame.setVariant(8)" style="background-color: #f1c40f;">Inglesas/Americanas (8x8)</button>
                <button onclick="app.currentGame.setVariant(10)" style="background-color: #3498db;">Internacionales (10x10)</button>
            </div>
        `;
    }

    setVariant(size) {
        this.boardSize = size;
        this.renderModeMenu();
    }
    
    renderModeMenu() {
        this.container.innerHTML = `
            <h2 style="color: #34495e; margin-bottom: 20px;">${this.nombre} (${this.boardSize}x${this.boardSize})</h2>
            <div id="damas-menu">
                <h3>Elige el Modo de Juego:</h3>
                <button onclick="app.currentGame.setMode('2P')" style="background-color: #1abc9c;">Jugador vs. Jugador</button>
                <button onclick="app.currentGame.setMode('CPU')" style="background-color: #e74c3c;">Jugador vs. Máquina (Solo 8x8)</button>
            </div>
            <button onclick="app.currentGame.renderVariantMenu()" style="margin-top: 15px;">⬅️ Volver a Variante</button>
        `;
    }

    setMode(mode) {
        if (mode === 'CPU' && this.boardSize === 10) {
            alert("La IA solo está implementada para Damas 8x8 por ahora. Por favor, elige 8x8 o 2 jugadores.");
            this.renderModeMenu();
            return;
        }
        this.gameMode = mode;
        this.initBoard();
        this.renderBoard();
    }

    initBoard() {
        this.board = Array(this.boardSize * this.boardSize).fill(null);
        const rows = this.boardSize === 8 ? 3 : 4; 
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if ((i + j) % 2 !== 0) { 
                    this.board[i * this.boardSize + j] = { player: 'black', isKing: false };
                }
            }
        }
        for (let i = this.boardSize - rows; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if ((i + j) % 2 !== 0) {
                    this.board[i * this.boardSize + j] = { player: 'red', isKing: false };
                }
            }
        }
        this.mustJump = this.checkForJumps(this.board, this.currentPlayer).length > 0;
        this.winner = null;
    }
    
    renderBoard() {
        let boardHTML = '';
        
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            const row = Math.floor(i / this.boardSize);
            const col = i % this.boardSize;
            const colorClass = (row + col) % 2 === 0 ? 'light' : 'dark';
            const piece = this.board[i];
            
            let pieceHTML = '';
            if (piece) {
                const kingClass = piece.isKing ? 'king' : '';
                // Añadimos un pequeño emoji de corona para el rey.
                pieceHTML = `<div class="damas-piece ${piece.player} ${kingClass}">${piece.isKing ? '♔' : ''}</div>`;
            }

            const isSelected = this.selectedPieceIndex === i ? 'selected' : '';

            boardHTML += `<div class="damas-cell ${colorClass} ${isSelected}" data-index="${i}" onclick="app.currentGame.handleCellClick(${i})">${pieceHTML}</div>`;
        }

        const statusJump = this.mustJump ? '<span style="color: #e74c3c; font-weight: bold;">¡CAPTURA OBLIGATORIA!</span>' : '';
        const status = this.winner ? 
            `<span style="color: #f1c40f;">¡${this.winner.name} ha ganado!</span>` :
            `Turno de: <span style="color:${this.currentPlayer}; font-weight: bold;">${this.currentPlayer.toUpperCase()}</span> ${statusJump}`;

        this.container.innerHTML = `
            <h2 style="color: #34495e;">${this.nombre} (${this.boardSize}x${this.boardSize})</h2>
            <p style="font-weight: bold; font-size: 1.2em;">${status}</p>
            <div id="damas-board" style="grid-template-columns: repeat(${this.boardSize}, 60px); width: ${this.boardSize * 60}px;">
                ${boardHTML}
            </div>
            <p style="margin-top: 20px; font-style: italic;">
                Reglas: ${this.boardSize === 8 ? 'Damas Inglesas/Americanas' : 'Damas Internacionales (10x10)'}. **La captura es obligatoria.**
            </p>
            <button onclick="app.currentGame.resetGame(true)" style="background-color: #e74c3c; padding: 10px 20px; border-radius: 5px; color: white; border: none; margin-top: 20px;">Reiniciar Todo</button>
        `;
        
        // Lógica de turno de CPU (solo 8x8)
        if (!this.winner && this.gameMode === 'CPU' && this.currentPlayer === 'black') {
             document.getElementById('damas-board').style.pointerEvents = 'none'; 
             setTimeout(() => {
                this.cpuMove(); 
                document.getElementById('damas-board').style.pointerEvents = 'auto'; 
            }, 800);
        } else {
            document.getElementById('damas-board').style.pointerEvents = 'auto';
        }
    }

    // --- LÓGICA DE MOVIMIENTO ---

    getValidMoves(startIndex, currentBoard, player, isJumpOnly = false) {
        const moves = [];
        const piece = currentBoard[startIndex];
        if (!piece || piece.player !== player) return moves;

        const row = Math.floor(startIndex / this.boardSize);
        const col = startIndex % this.boardSize;
        const direction = player === 'red' ? -1 : 1; 
        
        const directions = [
            { dr: direction, dc: -1 }, 
            { dr: direction, dc: 1 }   
        ];
        
        if (piece.isKing) {
            directions.push({ dr: -direction, dc: -1 }, { dr: -direction, dc: 1 });
        }

        for (const dir of directions) {
            const jumpRow = row + dir.dr;
            const jumpCol = col + dir.dc;
            const jumpIndex = jumpRow * this.boardSize + jumpCol;

            // 1. Verificar MOVIMIENTOS DE CAPTURA (SALTOS)
            if (jumpRow >= 0 && jumpRow < this.boardSize && jumpCol >= 0 && jumpCol < this.boardSize) {
                const capturedPiece = currentBoard[jumpIndex];

                if (capturedPiece && capturedPiece.player !== player) {
                    const finalRow = row + dir.dr * 2;
                    const finalCol = col + dir.dc * 2;
                    const finalIndex = finalRow * this.boardSize + finalCol;

                    if (finalRow >= 0 && finalRow < this.boardSize && finalCol >= 0 && finalCol < this.boardSize && currentBoard[finalIndex] === null) {
                        moves.push({ from: startIndex, to: finalIndex, capture: jumpIndex });
                    }
                }
            }

            // 2. Verificar MOVIMIENTOS NORMALES
            if (!isJumpOnly && !this.mustJump) {
                 if (currentBoard[jumpIndex] === null) {
                    if (jumpRow >= 0 && jumpRow < this.boardSize && jumpCol >= 0 && jumpCol < this.boardSize && (jumpRow + jumpCol) % 2 !== 0) {
                        moves.push({ from: startIndex, to: jumpIndex, capture: null });
                    }
                }
            }
        }
        return moves;
    }

    checkForJumps(currentBoard, player) {
        let jumps = [];
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] && currentBoard[i].player === player) {
                jumps = jumps.concat(this.getValidMoves(i, currentBoard, player, true));
            }
        }
        return jumps;
    }

    handleCellClick(index) {
        if (this.winner || (this.gameMode === 'CPU' && this.currentPlayer === 'black')) return;
        
        const piece = this.board[index];
        const jumps = this.checkForJumps(this.board, this.currentPlayer);
        this.mustJump = jumps.length > 0;

        // 1. Seleccionar una pieza (o deseleccionar)
        if (piece && piece.player === this.currentPlayer) {
            const pieceCanJump = this.getValidMoves(index, this.board, this.currentPlayer, true).length > 0;
            
            if (!this.mustJump || (this.mustJump && pieceCanJump)) {
                this.selectedPieceIndex = (this.selectedPieceIndex === index) ? null : index;
            } else if (this.mustJump && !pieceCanJump) {
                alert("¡Debes seleccionar una pieza que pueda realizar la captura!");
            }
        
        // 2. Mover la pieza seleccionada
        } else if (this.selectedPieceIndex !== null && this.board[index] === null) {
            
            const validMoves = this.getValidMoves(this.selectedPieceIndex, this.board, this.currentPlayer, this.mustJump);
            const move = validMoves.find(m => m.to === index);

            if (move) {
                this.executeMove(move);
                
                // Si fue un salto, verificar si hay un salto múltiple
                if (move.capture !== null) {
                    const furtherJumps = this.checkForJumps(this.board, this.currentPlayer);
                    
                    if (furtherJumps.length > 0 && furtherJumps.some(j => j.from === move.to)) {
                        this.selectedPieceIndex = move.to; // Mantiene la pieza en la nueva posición
                        this.mustJump = true;
                        this.renderBoard();
                        return; 
                    }
                }
                
                this.endTurn(move.to);
            } else {
                alert(`Movimiento no permitido. ${this.mustJump ? '¡Recuerda que la captura es obligatoria!' : ''}`);
            }
        }
        
        this.renderBoard();
    }
    
    executeMove(move) {
        this.board[move.to] = this.board[move.from];
        this.board[move.from] = null;
        
        if (move.capture !== null) {
            this.board[move.capture] = null;
        }

        const piece = this.board[move.to];
        const isBlackKingRow = move.to < this.boardSize;
        const isRedKingRow = move.to >= this.boardSize * (this.boardSize - 1);
        
        if (piece && !piece.isKing) {
            if (piece.player === 'red' && isBlackKingRow) {
                piece.isKing = true;
            } else if (piece.player === 'black' && isRedKingRow) {
                piece.isKing = true;
            }
        }
    }

    endTurn(lastMoveIndex) {
        this.selectedPieceIndex = null;
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.mustJump = this.checkForJumps(this.board, this.currentPlayer).length > 0;
        
        this.checkGameEnd();
    }

    checkGameEnd() {
        const redPieces = this.board.filter(p => p && p.player === 'red').length;
        const blackPieces = this.board.filter(p => p && p.player === 'black').length;
        
        if (redPieces === 0) {
            this.winner = { name: "Negras" };
        } else if (blackPieces === 0) {
            this.winner = { name: "Rojas" };
        } else {
            const availableMoves = this.checkForJumps(this.board, this.currentPlayer).length > 0 
                ? this.checkForJumps(this.board, this.currentPlayer) 
                : this.getAllNonJumpMoves(this.currentPlayer);

            if (availableMoves.length === 0) {
                this.winner = { name: "Empate (Sin movimientos)" };
            }
        }
    }
    
    getAllNonJumpMoves(player) {
         let nonJumps = [];
         for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] && this.board[i].player === player) {
                nonJumps = nonJumps.concat(this.getValidMoves(i, this.board, player, false).filter(m => m.capture === null));
            }
        }
        return nonJumps;
    }
    
    // --- LÓGICA DE CPU (Simple, solo para 8x8) ---
    cpuMove() {
        if (this.boardSize !== 8) return; 
        
        const cpuPlayer = 'black';
        const jumps = this.checkForJumps(this.board, cpuPlayer);
        let moves = [];

        if (jumps.length > 0) {
            moves = jumps; 
        } else {
            moves = this.getAllNonJumpMoves(cpuPlayer);
        }

        if (moves.length > 0) {
            const move = jumps.length > 0 ? jumps[Math.floor(Math.random() * jumps.length)] : moves[Math.floor(Math.random() * moves.length)];
            
            this.executeMove(move);
            
            // Lógica de salto múltiple para CPU
            if (move.capture !== null) {
                const furtherJumps = this.checkForJumps(this.board, cpuPlayer);
                
                if (furtherJumps.length > 0 && furtherJumps.some(j => j.from === move.to)) {
                    // Ejecuta el siguiente salto si es obligatorio
                    const nextMove = furtherJumps.find(j => j.from === move.to);
                    if (nextMove) this.executeMove(nextMove);
                }
            }
            this.endTurn(move.to);
        } else {
            this.checkGameEnd(); 
        }
        
        this.renderBoard();
    }


    resetGame(fullReset = false) {
        if (fullReset) {
            this.boardSize = null;
            this.gameMode = null;
        }
        this.initBoard();
        this.currentPlayer = 'red';
        this.winner = null;
        this.render();
    }
}


// ----------------------------------------------------------------
// --- 3. DINO RUNNER PLUS (Juego Nuevo) ---

class DinoRunnerPlus extends JuegoBase {
    constructor(containerId) {
        super(containerId);
        this.nombre = 'Dino Runner Plus';
        this.gameInterval = null;
        this.gameActive = false;
        
        this.player = { y: 100, isJumping: false, velocity: 0, gravity: 0.8, baseJump: -15, size: 40, color: '#2c3e50' };
        this.obstacles = [];
        this.score = 0;
        this.level = 1;
        this.maxLevel = 30;
        this.baseSpeed = 5;
        this.speed = this.baseSpeed;
        this.obstacleSpawnTime = 1500;
        this.lastObstacleTime = 0;
        
        this.handleDinoKeys = this.handleKeyPress.bind(this);
        this.initGame();
    }
    
    initGame() {
        this.score = 0;
        this.level = 1;
        this.player.y = 100;
        this.player.isJumping = false;
        this.player.velocity = 0;
        this.obstacles = [];
        this.speed = this.baseSpeed;
        this.gameActive = true;
        this.lastObstacleTime = Date.now();
        
        document.removeEventListener('keydown', this.handleDinoKeys);
        document.addEventListener('keydown', this.handleDinoKeys);

        this.startGameLoop();
    }
    
    startGameLoop() {
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.updateGame(), 20); 
    }
    
    updateGame() {
        if (!this.gameActive) return;

        this.updatePlayer();
        this.updateObstacles();
        this.checkCollisions();
        this.updateScoreAndLevel();
        this.render();
    }
    
    updateScoreAndLevel() {
        this.score++;
        
        const newLevel = Math.min(this.maxLevel, Math.floor(this.score / 500) + 1);
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.speed = this.baseSpeed * (1 + (this.level - 1) * 0.05);
            this.obstacleSpawnTime = Math.max(700, 1500 - (this.level - 1) * 20);
        }
    }
    
    updatePlayer() {
        if (this.player.isJumping) {
            this.player.y += this.player.velocity;
            this.player.velocity += this.player.gravity;
        }
        
        if (this.player.y >= 100) {
            this.player.y = 100;
            this.player.isJumping = false;
            this.player.velocity = 0;
        }
    }
    
    handleKeyPress(e) {
        if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
        }
        
        if (e.key === ' ' || e.key === 'ArrowUp') {
            if (!this.player.isJumping) {
                this.player.isJumping = true;
                this.player.velocity = this.player.baseJump;
            }
        }
    }
    
    updateObstacles() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastObstacleTime > this.obstacleSpawnTime) {
            this.spawnObstacle();
            this.lastObstacleTime = currentTime;
        }
        
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            return obs.x > -obs.width; 
        });
    }
    
    spawnObstacle() {
        const mapWidth = 800;
        const width = Math.random() < 0.3 ? 20 : 40; 
        const height = width === 20 ? 30 : 60;
        const color = '#34495e';
        
        this.obstacles.push({
            x: mapWidth,
            y: 150 - height, 
            width: width,
            height: height,
            color: color
        });
    }
    
    checkCollisions() {
        const p = this.player;
        const playerRect = { x: 50, y: p.y, w: p.size, h: p.size };
        
        this.obstacles.forEach(obs => {
            const obsRect = { x: obs.x, y: obs.y, w: obs.width, h: obs.height };
            
            if (playerRect.x < obsRect.x + obsRect.w &&
                playerRect.x + playerRect.w > obsRect.x &&
                playerRect.y < obsRect.y + obsRect.h &&
                playerRect.y + playerRect.h > obsRect.y) 
            {
                this.gameOver();
            }
        });
    }
    
    gameOver() {
        this.gameActive = false;
        clearInterval(this.gameInterval);
        document.removeEventListener('keydown', this.handleDinoKeys);
        alert(`¡Game Over! Puntuación Final: ${this.score}. Nivel Alcanzado: ${this.level}.`);
        this.render();
    }

    render() {
        const mapWidth = 800;
        const mapHeight = 150;
        
        let playerHTML = `
            <div style="position: absolute; left: 50px; top: ${this.player.y}px; width: ${this.player.size}px; height: ${this.player.size}px; background-color: ${this.player.color}; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px;">
                🦖
            </div>
        `;
        
        let obstacleHTML = this.obstacles.map(obs => `
            <div style="position: absolute; left: ${obs.x}px; top: ${obs.y}px; width: ${obs.width}px; height: ${obs.height}px; background-color: ${obs.color}; border-radius: 5px;">
                🌵
            </div>
        `).join('');

        const gameBoard = `
            <div id="dino-gameboard" style="position: relative; width: ${mapWidth}px; height: ${mapHeight}px; background-color: #ecf0f1; border-bottom: 5px solid #000; margin: 20px auto;">
                ${playerHTML}
                ${obstacleHTML}
                <div style="position: absolute; top: 10px; right: 10px; font-weight: bold; color: #000;">
                    Nivel: ${this.level}/${this.maxLevel} (Velocidad: ${this.speed.toFixed(1)})
                </div>
                <div style="position: absolute; top: 30px; right: 10px; font-weight: bold; color: #000;">
                    Puntos: ${this.score}
                </div>
            </div>
        `;

        this.container.innerHTML = `
            <h2 style="color: #2ecc71;">${this.nombre}</h2>
            ${gameBoard}
            <p style="margin-top: 15px;">**Controles:** Presiona **ESPACIO** o **FLECHA ARRIBA** para saltar.</p>
            <p style="font-weight: bold; color: #f39c12;">¡La velocidad aumenta en cada nivel!</p>
            <button onclick="app.currentGame.initGame()" style="background-color: #e74c3c; padding: 10px 20px; margin-top: 20px;">${this.gameActive ? 'Reiniciar Partida' : 'Jugar de Nuevo'}</button>
        `;
    }

    resetGame() {
        this.initGame();
    }
}


// ----------------------------------------------------------------
// --- 4. EL AHORCADO (Clase Restaurada) ---

class Ahorcado extends JuegoBase {
    constructor(containerId) {
        super(containerId);
        this.nombre = 'El Ahorcado';
        this.words = ['CODIGO', 'PROYECTO', 'VARIABLE', 'FUNCION', 'PROGRAMAR', 'COMPUTADORA', 'INTERNET', 'JAVA', 'PYTHON', 'HTML'];
        this.palabraSecreta = null; 
        this.letrasAdivinadas = new Set();
        this.intentosRestantes = 6;
        this.resetGame(false); 
    }
    
    render() {
        if (!this.palabraSecreta) {
            this.resetGame(false);
        }
        
        this.container.innerHTML = `
            <div id="hangman-container">
                <h2 style="color: #f1c40f;">${this.nombre} 💀</h2>
                <p style="font-style: italic; color: #ccc;">¡Palabras de programación/tecnología!</p>
                <pre style="font-size: 1.2em; font-family: monospace; color: #ecf0f1;">
                    ${this.drawHangman()}
                </pre>
                <div id="hangman-word">${this.displayWord()}</div>
                <p>Intentos restantes: <span style="color: ${this.intentosRestantes <= 2 ? '#e74c3c' : '#1abc9c'}; font-weight: bold;">${this.intentosRestantes}</span></p>
                <div id="hangman-letters">
                    ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `
                        <button 
                            onclick="app.currentGame.guess('${letter}')"
                            ${this.letrasAdivinadas.has(letter) || this.intentosRestantes === 0 || !this.displayWord().includes('_') ? 'disabled' : ''}
                        >
                            ${letter}
                        </button>
                    `).join('')}
                </div>
                <button onclick="app.currentGame.resetGame()" style="background-color: #1abc9c; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-top: 20px;">Nueva Palabra</button>
            </div>
        `;
    }

    displayWord() {
        return this.palabraSecreta.split('').map(letter => 
            this.letrasAdivinadas.has(letter) ? letter : '_'
        ).join(' '); 
    }

    drawHangman() {
        const parts = [
            `  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========` , 
            `  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========` , 
            `  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========` , 
            `  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========` , 
            `  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========` , 
            `  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========` , 
            `  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========`   
        ];
        return parts[6 - this.intentosRestantes];
    }

    guess(letter) {
        if (this.intentosRestantes <= 0 || !this.displayWord().includes('_') || this.letrasAdivinadas.has(letter)) return;

        this.letrasAdivinadas.add(letter);
        if (!this.palabraSecreta.includes(letter)) {
            this.intentosRestantes--;
        }
        
        this.render(); 

        if (!this.displayWord().includes('_')) {
            setTimeout(() => { alert(`¡Felicidades, ganaste! La palabra era ${this.palabraSecreta}`); this.resetGame(); }, 50);
        } else if (this.intentosRestantes === 0) {
            setTimeout(() => { alert(`¡Perdiste! La palabra era ${this.palabraSecreta}`); this.resetGame(); }, 50);
        }
    }
    
    resetGame(isManualReset = true) {
        this.palabraSecreta = this.words[Math.floor(Math.random() * this.words.length)]; 
        this.letrasAdivinadas = new Set();
        this.intentosRestantes = 6;
        if (isManualReset) {
            this.render(); 
        }
    }
}

// ----------------------------------------------------------------
// --- 5. DADOS MULTIJUGADOR (Clase Restaurada) ---

class DadosMultijugador extends JuegoBase {
    constructor(containerId) {
        super(containerId);
        this.nombre = 'Dados (Multijugador)';
        this.maxPlayers = 6;
        this.numPlayers = 2; 
        this.players = []; 
        this.gameStarted = false;
        this.currentPlayerIndex = 0;
        this.winner = null;
    }

    initGame() {
        this.players = [];
        for (let i = 1; i <= this.numPlayers; i++) {
            this.players.push({ id: i, name: `Jugador ${i}`, score: 0, hasRolled: false });
        }
        this.gameStarted = true;
        this.currentPlayerIndex = 0;
        this.winner = null;
        this.render(); 
    }

    render() {
        if (!this.gameStarted) {
            this.renderSetup();
        } else {
            this.renderGame();
        }
    }

    renderSetup() {
        let options = '';
        for(let i = 2; i <= this.maxPlayers; i++) {
            options += `<option value="${i}" ${this.numPlayers === i ? 'selected' : ''}>${i} Jugadores</option>`;
        }

        this.container.innerHTML = `
            <h2 style="color: #f39c12;">${this.nombre} 🎲</h2>
            <p>Elige cuántos jugadores participarán (Máx. ${this.maxPlayers}):</p>
            <select id="num-players-select" onchange="app.currentGame.setNumPlayers(this.value)">${options}</select>
            <button onclick="app.currentGame.initGame()" style="background-color: #2ecc71; padding: 10px 20px; margin-top: 15px;">Empezar Partida</button>
        `;
    }

    setNumPlayers(value) {
        this.numPlayers = parseInt(value);
    }

    renderGame() {
        const current = this.players[this.currentPlayerIndex];
        const status = this.winner ? 
            `<span style="color: #f1c40f;">¡${this.winner.name} ha ganado con ${this.winner.score}!</span>` : 
            `Turno de: <span style="font-weight: bold; color: #2ecc71;">${current.name}</span>`;

        let playersHTML = this.players.map(p => `
            <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 5px; border-radius: 5px; background-color: ${p.id === current.id && !this.winner ? '#4a5b6c' : '#34495e'}; color: #fff;">
                ${p.name}: **${p.score}** ${p.hasRolled ? '(Listo)' : ''}
            </div>
        `).join('');

        this.container.innerHTML = `
            <h2 style="color: #f39c12;">${this.nombre}</h2>
            <p style="font-size: 1.2em; margin-bottom: 20px;">${status}</p>

            <div id="dice-players-list">${playersHTML}</div>

            ${!this.winner ? 
                `<button onclick="app.currentGame.rollDice()" style="background-color: #3498db; padding: 15px 30px; margin-top: 20px; font-size: 1.1em;">
                    Lanzar Dado (${current.name})
                </button>` :
                `<button onclick="app.currentGame.resetGame(false)" style="background-color: #e74c3c; padding: 10px 20px; margin-top: 20px;">
                    Volver a Jugar
                </button>`
            }
            
            <button onclick="app.currentGame.resetGame(true)" style="margin-top: 15px;">⬅️ Cambiar Número de Jugadores</button>
        `;
    }

    rollDice() {
        if (this.winner) return;

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const current = this.players[this.currentPlayerIndex];

        current.score = diceRoll;
        current.hasRolled = true;

        alert(`${current.name} ha lanzado un ¡${diceRoll}!`);

        const allRolled = this.players.every(p => p.hasRolled);

        if (allRolled) {
            this.checkWinner();
        } else {
            let nextIndex = (this.currentPlayerIndex + 1) % this.numPlayers;
            while (this.players[nextIndex].hasRolled && nextIndex !== this.currentPlayerIndex) {
                nextIndex = (nextIndex + 1) % this.numPlayers;
            }
            this.currentPlayerIndex = nextIndex;
        }

        this.render();
    }

    checkWinner() {
        this.players.sort((a, b) => b.score - a.score);
        this.winner = this.players[0];
    }

    resetGame(fullReset = false) {
        if (fullReset) {
            this.gameStarted = false;
        } else {
            this.initGame(); 
        }
        this.render();
    }
}


// ----------------------------------------------------------------
// --- CLASE PRINCIPAL DE LA APLICACIÓN (Orquestación) ---

class App {
    constructor(containerId) {
        this.containerId = containerId;
        this.currentGame = null; 
        this.gameClasses = {
            Triqui: Triqui,
            Damas: Damas,
            Ahorcado: Ahorcado,
            DinoRunnerPlus: DinoRunnerPlus, 
            DadosMultijugador: DadosMultijugador   
        };
        this.renderFooter(); 
    }

    loadGame(gameName) {
        if (this.currentGame && this.currentGame.cleanup) {
            this.currentGame.cleanup();
        }

        const GameClass = this.gameClasses[gameName];
        if (GameClass) {
            this.currentGame = new GameClass(this.containerId);
            this.currentGame.render(); 
        } else {
            document.getElementById(this.containerId).innerHTML = `<h2 class="welcome">Juego '${gameName}' no encontrado.</h2>`;
        }
    }

    renderFooter() {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.innerHTML = `
                <p>Desarrollado con Programación Orientada a Objetos 💻</p>
                <div style="margin-top: 15px; padding: 10px; background-color: #f1c40f; border-radius: 5px; color: #333;">
                    <h3 style="margin: 0 0 5px;">💖 Mensaje Especial: ¡Para ti! 💖</h3>
                    <p style="margin: 0 0 10px; font-size: 0.9em; font-weight: bold;">
                        ¡Todos los juegos funcionando y Damas con captura obligatoria y variantes de tablero!
                    </p>
                    <h3 style="margin: 0 0 5px;">Nota sobre la velocidad 💨</h3>
                    <p style="margin: 0; font-size: 0.9em;">
                        El juego Dino Runner aumenta la velocidad hasta el nivel 30, donde la dificultad es máxima.
                    </p>
                </div>
            `;
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
const app = new App('game-container');