class TrapRunPuzzle {
    constructor(container, puzzleData, onComplete) {
        this.container = container;
        this.puzzleData = puzzleData;
        this.onComplete = onComplete;
        this.isActive = false;
        this.playerPosition = 0;
        this.traps = [];
        this.gameSpeed = 1000;
        this.score = 0;
        this.maxDistance = 10;
        this.gameTimer = null;
        
        this.init();
    }
    
    init() {
        this.createTrapRunHTML();
        this.setupControls();
        this.generateTraps();
        this.startGame();
    }
    
    createTrapRunHTML() {
        this.container.innerHTML = `
            <div class="trap-run-puzzle">
                <div class="puzzle-header">
                    <h3>Trap Corridor</h3>
                    <p class="puzzle-instruction">Navigate through the ancient traps! Click the safe tiles to avoid danger.</p>
                    <div class="trap-stats">
                        <span class="distance-counter">Distance: <span id="distance-counter">0/${this.maxDistance}</span></span>
                        <span class="trap-warning" id="trap-warning">Watch for the red tiles!</span>
                    </div>
                </div>
                
                <div class="trap-corridor" id="trap-corridor">
                    <div class="player-character" id="player">🚶</div>
                    <div class="corridor-tiles" id="corridor-tiles">
                        <!-- Tiles will be generated here -->
                    </div>
                </div>
                
                <div class="trap-controls">
                    <button class="trap-btn" id="left-btn">← Move Left</button>
                    <button class="trap-btn" id="center-btn">↑ Move Forward</button>
                    <button class="trap-btn" id="right-btn">Move Right →</button>
                </div>
                
                <div class="trap-instructions">
                    <p>🔺 Avoid red spikes - they will damage you!</p>
                    <p>🟢 Step on green safe tiles to advance!</p>
                    <p>⏱️ You have 3 seconds to choose your path!</p>
                </div>
            </div>
        `;
    }
    
    setupControls() {
        document.getElementById('left-btn').addEventListener('click', () => this.movePlayer(-1));
        document.getElementById('center-btn').addEventListener('click', () => this.movePlayer(0));
        document.getElementById('right-btn').addEventListener('click', () => this.movePlayer(1));
        
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePlayer(-1);
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.movePlayer(0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePlayer(1);
                    break;
            }
        });
    }
    
    generateTraps() {
        this.traps = [];
        
        for (let i = 0; i < this.maxDistance; i++) {
            const trapRow = [];
            const numTraps = Math.min(2, Math.floor(Math.random() * 2) + 1);
            const trapPositions = [];
            
            while (trapPositions.length < numTraps) {
                const pos = Math.floor(Math.random() * 3);
                if (!trapPositions.includes(pos)) {
                    trapPositions.push(pos);
                }
            }
            
            for (let j = 0; j < 3; j++) {
                trapRow.push({
                    position: j,
                    isTrap: trapPositions.includes(j),
                    isRevealed: false
                });
            }
            
            this.traps.push(trapRow);
        }
    }
    
    startGame() {
        this.isActive = true;
        this.score = 0;
        this.updateDistance();
        this.showCurrentRow();
        this.startTimer();
    }
    
    showCurrentRow() {
        if (this.score >= this.maxDistance) {
            this.completePuzzle(true);
            return;
        }
        
        const tilesContainer = document.getElementById('corridor-tiles');
        tilesContainer.innerHTML = '';
        
        const currentRow = this.traps[this.score];
        
        currentRow.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = 'corridor-tile';
            tileElement.dataset.position = index;
            
            if (tile.isRevealed) {
                tileElement.classList.add(tile.isTrap ? 'trap-tile' : 'safe-tile');
                tileElement.innerHTML = tile.isTrap ? '🔺' : '🟢';
            } else {
                tileElement.innerHTML = '❓';
                tileElement.classList.add('hidden-tile');
            }
            
            tilesContainer.appendChild(tileElement);
        });
        
        this.updateTrapWarning();
    }
    
    startTimer() {
        this.stopTimer();
        
        let timeLeft = 3;
        const warningElement = document.getElementById('trap-warning');
        
        this.gameTimer = setInterval(() => {
            timeLeft--;
            warningElement.textContent = `Choose quickly! ${timeLeft} seconds left!`;
            warningElement.style.color = timeLeft <= 1 ? '#ff4500' : '#ffd700';
            
            if (timeLeft <= 0) {
                this.forceMove();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    forceMove() {
        this.stopTimer();
        const safeTiles = this.traps[this.score].filter(tile => !tile.isTrap);
        if (safeTiles.length > 0) {
            const randomSafe = safeTiles[Math.floor(Math.random() * safeTiles.length)];
            this.movePlayer(randomSafe.position - 1);
        } else {
            this.movePlayer(0);
        }
    }
    
    movePlayer(direction) {
        if (!this.isActive) return;
        
        this.stopTimer();
        
        const targetPosition = Math.max(0, Math.min(2, 1 + direction));
        const currentRow = this.traps[this.score];
        const targetTile = currentRow[targetPosition];
        
        this.revealCurrentRow();
        
        setTimeout(() => {
            if (targetTile.isTrap) {
                this.hitTrap();
            } else {
                this.advancePlayer();
            }
        }, 1000);
    }
    
    revealCurrentRow() {
        const currentRow = this.traps[this.score];
        currentRow.forEach(tile => tile.isRevealed = true);
        this.showCurrentRow();
        
        if (window.audioManager) {
            window.audioManager.play('scroll');
        }
    }
    
    hitTrap() {
        this.showFeedback('Ouch! You triggered a trap!', 'error');
        
        if (window.gameState) {
            window.gameState.takeDamage(1);
        }
        
        if (window.audioManager) {
            window.audioManager.play('error');
        }
        
        setTimeout(() => {
            if (window.gameState && window.gameState.gameData.health <= 0) {
                this.completePuzzle(false);
            } else {
                this.score++;
                this.updateDistance();
                this.showCurrentRow();
                this.startTimer();
            }
        }, 1500);
    }
    
    advancePlayer() {
        this.score++;
        this.updateDistance();
        this.showFeedback('Safe passage! Well done!', 'success');
        
        if (window.audioManager) {
            window.audioManager.play('click');
        }
        
        setTimeout(() => {
            if (this.score >= this.maxDistance) {
                this.completePuzzle(true);
            } else {
                this.showCurrentRow();
                this.startTimer();
            }
        }, 1000);
    }
    
    updateDistance() {
        const counter = document.getElementById('distance-counter');
        if (counter) {
            counter.textContent = `${this.score}/${this.maxDistance}`;
        }
    }
    
    updateTrapWarning() {
        const warning = document.getElementById('trap-warning');
        const currentRow = this.traps[this.score];
        const trapCount = currentRow.filter(tile => tile.isTrap).length;
        
        if (trapCount === 0) {
            warning.textContent = 'No traps ahead - any path is safe!';
            warning.style.color = '#32cd32';
        } else if (trapCount === 1) {
            warning.textContent = 'One trap detected - choose carefully!';
            warning.style.color = '#ffd700';
        } else {
            warning.textContent = 'Multiple traps ahead - very dangerous!';
            warning.style.color = '#ff4500';
        }
    }
    
    showFeedback(message, type) {
        let existingFeedback = this.container.querySelector('.feedback-message');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedback = document.createElement('div');
        feedback.className = `feedback-message feedback-${type}`;
        feedback.textContent = message;
        
        const header = this.container.querySelector('.puzzle-header');
        header.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback && feedback.parentNode) {
                feedback.remove();
            }
        }, 2000);
    }
    
    completePuzzle(success) {
        this.isActive = false;
        this.stopTimer();
        
        if (success) {
            this.showVictoryAnimation();
            const relic = this.puzzleData.relic || null;
            this.onComplete(true, relic);
        } else {
            this.onComplete(false, null);
        }
    }
    
    showVictoryAnimation() {
        const victoryMessage = document.createElement('div');
        victoryMessage.className = 'victory-message';
        victoryMessage.innerHTML = `
            <div class="victory-content">
                <h3>🏛️ Corridor Navigated! 🏛️</h3>
                <p>You have successfully avoided the ancient traps!</p>
                <div class="relic-display">
                    <div class="relic-icon">💎</div>
                    <p>Sacred Relic Acquired!</p>
                </div>
            </div>
        `;
        
        this.container.appendChild(victoryMessage);
        
        if (window.audioManager) {
            window.audioManager.play('victory');
        }
        
        setTimeout(() => {
            if (victoryMessage && victoryMessage.parentNode) {
                victoryMessage.remove();
            }
        }, 3000);
    }
    
    reset() {
        this.isActive = false;
        this.stopTimer();
        this.playerPosition = 0;
        this.score = 0;
        this.generateTraps();
        this.init();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const trapRunStyles = `
        .trap-run-puzzle {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            color: #f4e4c1;
        }
        
        .trap-corridor {
            background: linear-gradient(135deg, #2c1810 0%, #3d2914 100%);
            border: 3px solid #8b4513;
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            position: relative;
            min-height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .player-character {
            font-size: 2rem;
            margin-bottom: 1rem;
            animation: player-walk 2s infinite ease-in-out;
        }
        
        @keyframes player-walk {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        
        .corridor-tiles {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .corridor-tile {
            width: 80px;
            height: 80px;
            border: 3px solid #8b4513;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            background: rgba(139, 69, 19, 0.3);
            transition: all 0.5s ease;
            cursor: pointer;
        }
        
        .corridor-tile.hidden-tile {
            background: rgba(139, 69, 19, 0.3);
            border-color: #8b4513;
        }
        
        .corridor-tile.safe-tile {
            background: rgba(34, 139, 34, 0.3);
            border-color: #32cd32;
            box-shadow: 0 0 10px rgba(50, 205, 50, 0.3);
        }
        
        .corridor-tile.trap-tile {
            background: rgba(139, 0, 0, 0.3);
            border-color: #ff4500;
            box-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
            animation: trap-pulse 1s infinite;
        }
        
        @keyframes trap-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .trap-controls {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 2rem 0;
            flex-wrap: wrap;
        }
        
        .trap-btn {
            background: linear-gradient(45deg, #4169e1 0%, #6495ed 100%);
            border: 2px solid #87ceeb;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 1rem;
            font-weight: bold;
            transition: all 0.3s ease;
            min-width: 120px;
        }
        
        .trap-btn:hover {
            background: linear-gradient(45deg, #6495ed 0%, #87ceeb 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .trap-btn:active {
            transform: translateY(0);
        }
        
        .trap-stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .distance-counter {
            font-size: 1rem;
            font-weight: bold;
            color: #ffd700;
        }
        
        .trap-warning {
            font-size: 1rem;
            font-weight: bold;
            color: #ffd700;
            text-align: center;
        }
        
        .trap-instructions {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
        }
        
        .trap-instructions p {
            margin: 0.5rem 0;
            font-size: 0.9rem;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .corridor-tiles {
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }
            
            .corridor-tile {
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
            }
            
            .trap-controls {
                flex-direction: column;
                align-items: center;
            }
            
            .trap-btn {
                min-width: 200px;
            }
            
            .trap-stats {
                flex-direction: column;
                gap: 1rem;
            }
        }
    `;
    
    if (!document.querySelector('#trap-run-styles')) {
        const style = document.createElement('style');
        style.id = 'trap-run-styles';
        style.textContent = trapRunStyles;
        document.head.appendChild(style);
    }
});

window.TrapRunPuzzle = TrapRunPuzzle;