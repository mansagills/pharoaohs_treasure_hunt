class GameStateMachine {
    constructor() {
        this.states = {
            MENU: 'menu',
            HUB: 'hub',
            CHAMBER: 'chamber',
            INSTRUCTIONS: 'instructions'
        };
        
        this.currentState = this.states.MENU;
        this.gameData = {
            playerLevel: 1,
            playerXP: 0,
            collectedRelics: [],
            unlockedChambers: [1],
            health: 3,
            maxHealth: 3,
            torchlight: 100,
            maxTorchlight: 100,
            currentChamber: null,
            powerUps: {
                torchRefill: 0,
                ankhOfLife: 0,
                rosettaHint: 0,
                scarabCompass: 0,
                goldenHorusWings: 0
            }
        };
        
        this.screens = {};
        this.init();
    }
    
    init() {
        this.screens.menu = document.getElementById('menu-screen');
        this.screens.hub = document.getElementById('hub-screen');
        this.screens.chamber = document.getElementById('chamber-screen');
        this.screens.instructions = document.getElementById('instructions-screen');
        
        this.setupEventListeners();
        this.updateUI();
        this.showScreen(this.states.MENU);
    }
    
    setupEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => {
            this.transitionTo(this.states.HUB);
        });
        
        document.getElementById('instructions').addEventListener('click', () => {
            this.transitionTo(this.states.INSTRUCTIONS);
        });
        
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.transitionTo(this.states.MENU);
        });
        
        document.getElementById('back-to-hub').addEventListener('click', () => {
            this.transitionTo(this.states.HUB);
        });
        
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });
        
        document.getElementById('overlay').addEventListener('click', (e) => {
            if (e.target.id === 'overlay') {
                this.hideModal();
            }
        });
    }
    
    transitionTo(newState) {
        console.log(`Transitioning from ${this.currentState} to ${newState}`);
        
        this.onStateExit(this.currentState);
        this.currentState = newState;
        this.onStateEnter(newState);
        this.showScreen(newState);
    }
    
    onStateExit(state) {
        switch(state) {
            case this.states.CHAMBER:
                this.pauseTimers();
                break;
        }
    }
    
    onStateEnter(state) {
        switch(state) {
            case this.states.HUB:
                this.updateUI();
                if (window.tombMap) {
                    window.tombMap.render();
                }
                break;
            case this.states.CHAMBER:
                this.startTimers();
                break;
        }
    }
    
    showScreen(state) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screenMap = {
            [this.states.MENU]: this.screens.menu,
            [this.states.HUB]: this.screens.hub,
            [this.states.CHAMBER]: this.screens.chamber,
            [this.states.INSTRUCTIONS]: this.screens.instructions
        };
        
        if (screenMap[state]) {
            screenMap[state].classList.add('active');
        }
    }
    
    updateUI() {
        document.getElementById('player-level').textContent = this.gameData.playerLevel;
        document.getElementById('player-xp').textContent = this.gameData.playerXP;
        
        this.updateHealthDisplay();
        this.updateLightDisplay();
        this.updateRelicSlots();
    }
    
    updateHealthDisplay() {
        const heartsContainer = document.getElementById('health-hearts');
        heartsContainer.innerHTML = '';
        
        for (let i = 0; i < this.gameData.maxHealth; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.textContent = '❤️';
            
            if (i >= this.gameData.health) {
                heart.classList.add('empty');
            }
            
            heartsContainer.appendChild(heart);
        }
    }
    
    updateLightDisplay() {
        const lightLevel = document.getElementById('light-level');
        const percentage = (this.gameData.torchlight / this.gameData.maxTorchlight) * 100;
        lightLevel.style.width = `${percentage}%`;
        
        if (percentage < 25) {
            lightLevel.style.background = 'linear-gradient(90deg, #8b0000 0%, #ff4500 100%)';
        } else if (percentage < 50) {
            lightLevel.style.background = 'linear-gradient(90deg, #ff4500 0%, #ffa500 100%)';
        } else {
            lightLevel.style.background = 'linear-gradient(90deg, #ff4500 0%, #ffd700 50%, #ffff00 100%)';
        }
        
        this.updateDarknessOverlay(percentage);
    }
    
    updateDarknessOverlay(lightPercentage) {
        const darknessOverlay = document.getElementById('darkness-overlay');
        if (!darknessOverlay) return;
        
        darknessOverlay.classList.remove('active', 'critical', 'danger');
        
        if (this.currentState === this.states.CHAMBER) {
            if (lightPercentage <= 0) {
                darknessOverlay.classList.add('active', 'danger');
            } else if (lightPercentage <= 15) {
                darknessOverlay.classList.add('active', 'critical');
                if (window.audioManager && Math.random() < 0.1) {
                    window.audioManager.play('torch');
                }
            } else if (lightPercentage <= 40) {
                darknessOverlay.classList.add('active');
            }
            
            const overlayOpacity = Math.max(0, (100 - lightPercentage) / 100);
            darknessOverlay.style.opacity = overlayOpacity * 0.8;
        } else {
            darknessOverlay.style.opacity = '0';
        }
    }
    
    updateRelicSlots() {
        const relicSlots = document.querySelectorAll('.relic-slot');
        relicSlots.forEach((slot, index) => {
            const relicNumber = index + 1;
            if (this.gameData.collectedRelics.includes(relicNumber)) {
                slot.classList.add('filled');
            } else {
                slot.classList.remove('filled');
            }
        });
    }
    
    startTimers() {
        this.stopTimers();
        
        this.lightTimer = setInterval(() => {
            if (this.gameData.torchlight > 0) {
                this.gameData.torchlight -= 0.2;
                this.updateLightDisplay();
                
                if (this.gameData.torchlight <= 0) {
                    this.onTimeUp();
                }
            }
        }, 200);
    }
    
    pauseTimers() {
        this.stopTimers();
    }
    
    stopTimers() {
        if (this.lightTimer) {
            clearInterval(this.lightTimer);
            this.lightTimer = null;
        }
    }
    
    onTimeUp() {
        this.stopTimers();
        this.showModal(
            'Lost in the Darkness',
            'Your torch has burned out! The ancient spirits whisper that you may try again...',
            [{
                text: 'Try Again',
                action: () => {
                    this.resetChamber();
                    this.hideModal();
                }
            }, {
                text: 'Return to Map',
                action: () => {
                    this.transitionTo(this.states.HUB);
                    this.hideModal();
                }
            }]
        );
    }
    
    takeDamage(amount = 1) {
        this.gameData.health = Math.max(0, this.gameData.health - amount);
        this.updateHealthDisplay();
        
        if (this.gameData.health <= 0) {
            this.onHealthDepleted();
        }
    }
    
    onHealthDepleted() {
        this.stopTimers();
        this.showModal(
            'Trapped!',
            'The ancient traps have claimed you! But the pharaoh grants you another chance...',
            [{
                text: 'Try Again',
                action: () => {
                    this.resetChamber();
                    this.hideModal();
                }
            }, {
                text: 'Return to Map',
                action: () => {
                    this.transitionTo(this.states.HUB);
                    this.hideModal();
                }
            }]
        );
    }
    
    resetChamber() {
        this.gameData.health = this.gameData.maxHealth;
        this.gameData.torchlight = this.gameData.maxTorchlight;
        this.updateUI();
        
        if (this.gameData.currentChamber && window.currentPuzzle) {
            window.currentPuzzle.reset();
        }
    }
    
    enterChamber(chamberNumber) {
        this.gameData.currentChamber = chamberNumber;
        this.resetChamber();
        this.transitionTo(this.states.CHAMBER);
        
        this.loadChamber(chamberNumber);
    }
    
    loadChamber(chamberNumber) {
        const chambers = this.getChamberData();
        const chamber = chambers.find(c => c.id === chamberNumber);
        
        if (chamber) {
            this.displayChamber(chamber);
        } else {
            this.showModal('Error', 'Chamber not found. Please try again.');
        }
    }
    
    getChamberData() {
        return [
            {
                "id": 1,
                "name": "Hall of Scribes",
                "difficulty": "easy",
                "timeLimit": 120,
                "description": "Ancient scribes practiced their hieroglyphic writing in this chamber. The walls are covered with educational inscriptions and practice exercises.",
                "scribeMessage": "Welcome, young explorer! The scribes have left their wisdom here for you to discover.",
                "puzzleType": "glyph-match",
                "relic": 1,
                "relicName": "Ankh of Eternal Life",
                "puzzleData": {
                    "difficulty": "easy",
                    "timeLimit": 120,
                    "relic": 1,
                    "glyphs": [
                        {
                            "id": "ankh",
                            "symbol": "☥",
                            "meaning": "Life",
                            "pronunciation": "ankh"
                        },
                        {
                            "id": "eye",
                            "symbol": "𓂀",
                            "meaning": "Eye",
                            "pronunciation": "irt"
                        },
                        {
                            "id": "sun",
                            "symbol": "☉",
                            "meaning": "Sun",
                            "pronunciation": "ra"
                        },
                        {
                            "id": "water",
                            "symbol": "𓈖",
                            "meaning": "Water",
                            "pronunciation": "nu"
                        }
                    ]
                }
            },
            {
                "id": 2,
                "name": "Chamber of Ma'at",
                "difficulty": "medium",
                "timeLimit": 100,
                "description": "This sacred chamber is dedicated to Ma'at, the goddess of truth and justice. Her feather weighs the hearts of mortals in the afterlife.",
                "scribeMessage": "Ma'at sees all truths. Can you balance justice and wisdom in her sacred domain?",
                "puzzleType": "glyph-match",
                "relic": 2,
                "relicName": "Feather of Ma'at",
                "puzzleData": {
                    "difficulty": "medium", 
                    "timeLimit": 100,
                    "relic": 2,
                    "glyphs": [
                        {
                            "id": "feather",
                            "symbol": "𓆄",
                            "meaning": "Truth",
                            "pronunciation": "maat"
                        },
                        {
                            "id": "scales",
                            "symbol": "⚖️",
                            "meaning": "Justice",
                            "pronunciation": "tekh"
                        },
                        {
                            "id": "heart",
                            "symbol": "𓄿",
                            "meaning": "Heart",
                            "pronunciation": "ib"
                        },
                        {
                            "id": "soul",
                            "symbol": "𓅡",
                            "meaning": "Soul",
                            "pronunciation": "ba"
                        },
                        {
                            "id": "pharaoh",
                            "symbol": "𓊪",
                            "meaning": "King",
                            "pronunciation": "nesu"
                        }
                    ],
                    "distractors": [
                        {
                            "id": "distractor1",
                            "meaning": "Sand"
                        },
                        {
                            "id": "distractor2", 
                            "meaning": "Mountain"
                        }
                    ]
                }
            },
            {
                "id": 3,
                "name": "Anubis's Trial",
                "difficulty": "medium",
                "timeLimit": 90,
                "description": "The jackal-headed god Anubis guards this chamber with trials that test your courage and wisdom. Navigate through the trapped corridor to prove your worthiness.",
                "scribeMessage": "Anubis weighs your courage, traveler. Navigate his trials with wisdom and respect.",
                "puzzleType": "trap-run",
                "relic": 3,
                "relicName": "Canopic Jar of Duamutef",
                "puzzleData": {
                    "difficulty": "medium",
                    "timeLimit": 90,
                    "relic": 3
                }
            },
            {
                "id": 4,
                "name": "Horus's Domain",
                "difficulty": "hard",
                "timeLimit": 80,
                "description": "The falcon god Horus soars above this chamber, his piercing gaze seeing all truths. His eye represents divine protection and royal power.",
                "scribeMessage": "The sky god watches from above. His sight reveals truths hidden from mortal eyes.",
                "puzzleType": "glyph-match",
                "relic": 4,
                "relicName": "Eye of Horus",
                "puzzleData": {
                    "difficulty": "hard",
                    "timeLimit": 80,
                    "relic": 4,
                    "glyphs": [
                        {
                            "id": "horus",
                            "symbol": "𓅃",
                            "meaning": "Horus",
                            "pronunciation": "heru"
                        },
                        {
                            "id": "falcon",
                            "symbol": "𓆣",
                            "meaning": "Falcon",
                            "pronunciation": "bik"
                        },
                        {
                            "id": "sky",
                            "symbol": "𓇯",
                            "meaning": "Sky",
                            "pronunciation": "pet"
                        },
                        {
                            "id": "royal",
                            "symbol": "𓈚",
                            "meaning": "Royal",
                            "pronunciation": "nesu"
                        },
                        {
                            "id": "power",
                            "symbol": "𓋹",
                            "meaning": "Power",
                            "pronunciation": "sekhem"
                        },
                        {
                            "id": "divine",
                            "symbol": "𓊹",
                            "meaning": "Divine",
                            "pronunciation": "netjer"
                        }
                    ],
                    "distractors": [
                        {
                            "id": "distractor5",
                            "meaning": "Bread"
                        },
                        {
                            "id": "distractor6",
                            "meaning": "House"
                        },
                        {
                            "id": "distractor7",
                            "meaning": "Boat"
                        }
                    ]
                }
            },
            {
                "id": 5,
                "name": "Thoth's Wisdom",
                "difficulty": "hard",
                "timeLimit": 75,
                "description": "The ibis-headed god Thoth, master of wisdom and writing, challenges visitors with complex puzzles that test knowledge and intellect.",
                "scribeMessage": "Thoth, keeper of divine knowledge, tests those who seek wisdom beyond mortal understanding.",
                "puzzleType": "glyph-match",
                "relic": 5,
                "relicName": "Ibis Scroll of Thoth",
                "puzzleData": {
                    "difficulty": "hard",
                    "timeLimit": 75,
                    "relic": 5,
                    "glyphs": [
                        {
                            "id": "thoth",
                            "symbol": "𓅱",
                            "meaning": "Thoth",
                            "pronunciation": "djehuty"
                        },
                        {
                            "id": "wisdom",
                            "symbol": "𓂧",
                            "meaning": "Wisdom",
                            "pronunciation": "sia"
                        },
                        {
                            "id": "writing",
                            "symbol": "𓏞",
                            "meaning": "Writing",
                            "pronunciation": "sebayt"
                        },
                        {
                            "id": "ibis",
                            "symbol": "𓅞",
                            "meaning": "Ibis",
                            "pronunciation": "hib"
                        },
                        {
                            "id": "knowledge",
                            "symbol": "𓂋",
                            "meaning": "Knowledge",
                            "pronunciation": "rekh"
                        },
                        {
                            "id": "scribe",
                            "symbol": "𓋞",
                            "meaning": "Scribe",
                            "pronunciation": "sesh"
                        }
                    ],
                    "distractors": [
                        {
                            "id": "distractor8",
                            "meaning": "Fish"
                        },
                        {
                            "id": "distractor9",
                            "meaning": "Tree"
                        },
                        {
                            "id": "distractor10",
                            "meaning": "Fire"
                        }
                    ]
                }
            },
            {
                "id": 6,
                "name": "Pharaoh's Antechamber",
                "difficulty": "expert",
                "timeLimit": 70,
                "description": "The final chamber before the Pharaoh's Vault. Only those who have proven their worth through all previous trials may attempt to claim the ultimate treasure.",
                "scribeMessage": "The pharaoh's greatest treasure awaits beyond this final test. Show that you are truly worthy.",
                "puzzleType": "glyph-match",
                "relic": 6,
                "relicName": "Golden Pharaoh's Seal",
                "puzzleData": {
                    "difficulty": "expert",
                    "timeLimit": 70,
                    "relic": 6,
                    "glyphs": [
                        {
                            "id": "pharaoh_seal",
                            "symbol": "𓊪",
                            "meaning": "Pharaoh",
                            "pronunciation": "per-aa"
                        },
                        {
                            "id": "gold",
                            "symbol": "𓋞",
                            "meaning": "Gold",
                            "pronunciation": "nebu"
                        },
                        {
                            "id": "eternity",
                            "symbol": "𓇳",
                            "meaning": "Eternity",
                            "pronunciation": "neheh"
                        },
                        {
                            "id": "treasure",
                            "symbol": "𓊪",
                            "meaning": "Treasure",
                            "pronunciation": "shefyt"
                        },
                        {
                            "id": "pyramid",
                            "symbol": "𓉴",
                            "meaning": "Pyramid",
                            "pronunciation": "mer"
                        },
                        {
                            "id": "dynasty",
                            "symbol": "𓊹",
                            "meaning": "Dynasty",
                            "pronunciation": "per"
                        },
                        {
                            "id": "sacred",
                            "symbol": "𓋹",
                            "meaning": "Sacred",
                            "pronunciation": "djeser"
                        }
                    ],
                    "distractors": [
                        {
                            "id": "distractor11",
                            "meaning": "Cloth"
                        },
                        {
                            "id": "distractor12",
                            "meaning": "Stone"
                        },
                        {
                            "id": "distractor13",
                            "meaning": "Reed"
                        },
                        {
                            "id": "distractor14",
                            "meaning": "Wind"
                        }
                    ]
                }
            }
        ];
    }
    
    displayChamber(chamber) {
        const description = document.getElementById('chamber-description');
        description.innerHTML = `
            <h3>${chamber.name}</h3>
            <p class="scribe-message">"${chamber.scribeMessage}"</p>
            <p>${chamber.description}</p>
        `;
        
        const puzzleArea = document.getElementById('puzzle-area');
        puzzleArea.innerHTML = '';
        
        switch(chamber.puzzleType) {
            case 'glyph-match':
                this.loadGlyphMatchPuzzle(chamber, puzzleArea);
                break;
            case 'trap-run':
                this.loadTrapRunPuzzle(chamber, puzzleArea);
                break;
            default:
                puzzleArea.innerHTML = '<p>Puzzle type not implemented yet.</p>';
        }
    }
    
    loadGlyphMatchPuzzle(chamber, container) {
        if (window.GlyphMatchPuzzle) {
            window.currentPuzzle = new window.GlyphMatchPuzzle(
                container,
                chamber.puzzleData,
                this.onPuzzleComplete.bind(this)
            );
        }
    }
    
    loadTrapRunPuzzle(chamber, container) {
        if (window.TrapRunPuzzle) {
            window.currentPuzzle = new window.TrapRunPuzzle(
                container,
                chamber.puzzleData,
                this.onPuzzleComplete.bind(this)
            );
        }
    }
    
    onPuzzleComplete(success, relic) {
        this.stopTimers();
        
        if (success) {
            this.gameData.playerXP += 100;
            
            if (relic && !this.gameData.collectedRelics.includes(relic)) {
                this.gameData.collectedRelics.push(relic);
            }
            
            const nextChamber = this.gameData.currentChamber + 1;
            if (nextChamber <= 6 && !this.gameData.unlockedChambers.includes(nextChamber)) {
                this.gameData.unlockedChambers.push(nextChamber);
            }
            
            if (this.gameData.playerXP >= this.gameData.playerLevel * 200) {
                this.gameData.playerLevel++;
                this.gameData.playerXP = 0;
            }
            
            this.showModal(
                'Chamber Complete!',
                `Excellent work! You have claimed the sacred relic and gained 100 XP.`,
                [{
                    text: 'Continue',
                    action: () => {
                        this.transitionTo(this.states.HUB);
                        this.hideModal();
                    }
                }]
            );
            
            if (this.gameData.collectedRelics.length === 6) {
                setTimeout(() => this.checkVictoryCondition(), 1000);
            }
        }
    }
    
    checkVictoryCondition() {
        if (this.gameData.collectedRelics.length === 6) {
            this.showModal(
                'Victory!',
                `🏆 Congratulations! You have collected all six sacred relics and unlocked the Pharaoh's Vault! The ancient spirits are pleased with your wisdom and courage.`,
                [{
                    text: 'Play Again',
                    action: () => {
                        this.resetGame();
                        this.hideModal();
                    }
                }]
            );
        }
    }
    
    resetGame() {
        this.gameData = {
            playerLevel: 1,
            playerXP: 0,
            collectedRelics: [],
            unlockedChambers: [1],
            health: 3,
            maxHealth: 3,
            torchlight: 100,
            maxTorchlight: 100,
            currentChamber: null,
            powerUps: {
                torchRefill: 0,
                ankhOfLife: 0,
                rosettaHint: 0,
                scarabCompass: 0,
                goldenHorusWings: 0
            }
        };
        
        this.transitionTo(this.states.MENU);
    }
    
    showModal(title, message, buttons = []) {
        const overlay = document.getElementById('overlay');
        const modalContent = document.getElementById('modal-content');
        
        let buttonsHTML = '';
        if (buttons.length > 0) {
            buttonsHTML = buttons.map(btn => 
                `<button class="menu-btn modal-btn" data-action="${btn.text}">${btn.text}</button>`
            ).join('');
        }
        
        modalContent.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                ${buttonsHTML}
            </div>
        `;
        
        buttons.forEach(btn => {
            const buttonEl = modalContent.querySelector(`[data-action="${btn.text}"]`);
            if (buttonEl) {
                buttonEl.addEventListener('click', btn.action);
            }
        });
        
        overlay.classList.remove('hidden');
    }
    
    hideModal() {
        document.getElementById('overlay').classList.add('hidden');
    }
    
    usePowerUp(type) {
        if (this.gameData.powerUps[type] > 0) {
            this.gameData.powerUps[type]--;
            
            switch(type) {
                case 'torchRefill':
                    this.gameData.torchlight = Math.min(this.gameData.maxTorchlight, this.gameData.torchlight + 30);
                    this.updateLightDisplay();
                    break;
                case 'ankhOfLife':
                    this.gameData.health = Math.min(this.gameData.maxHealth, this.gameData.health + 1);
                    this.updateHealthDisplay();
                    break;
                case 'rosettaHint':
                    if (window.currentPuzzle && window.currentPuzzle.showHint) {
                        window.currentPuzzle.showHint();
                    }
                    break;
                case 'scarabCompass':
                    if (window.currentPuzzle && window.currentPuzzle.highlightInteractive) {
                        window.currentPuzzle.highlightInteractive();
                    }
                    break;
                case 'goldenHorusWings':
                    if (window.currentPuzzle && window.currentPuzzle.autoSolveQuadrant) {
                        window.currentPuzzle.autoSolveQuadrant();
                    }
                    break;
            }
            
            return true;
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gameState = new GameStateMachine();
});

window.addEventListener('beforeunload', () => {
    if (window.gameState) {
        window.gameState.stopTimers();
    }
});