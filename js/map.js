class TombMap {
    constructor() {
        this.chambers = [
            { id: 1, name: "Hall of Scribes", position: { row: 0, col: 0 }, relic: 1 },
            { id: 2, name: "Chamber of Ma'at", position: { row: 0, col: 1 }, relic: 2 },
            { id: 3, name: "Anubis's Trial", position: { row: 0, col: 2 }, relic: 3 },
            { id: 4, name: "Horus's Domain", position: { row: 1, col: 0 }, relic: 4 },
            { id: 5, name: "Thoth's Wisdom", position: { row: 1, col: 1 }, relic: 5 },
            { id: 6, name: "Pharaoh's Antechamber", position: { row: 1, col: 2 }, relic: 6 }
        ];
        
        this.mapContainer = null;
        this.init();
    }
    
    init() {
        this.mapContainer = document.getElementById('tomb-map');
        this.render();
    }
    
    render() {
        if (!this.mapContainer) return;
        
        this.mapContainer.innerHTML = '';
        
        this.chambers.forEach(chamber => {
            const doorElement = this.createChamberDoor(chamber);
            this.mapContainer.appendChild(doorElement);
        });
    }
    
    createChamberDoor(chamber) {
        const door = document.createElement('div');
        door.className = 'chamber-door';
        door.dataset.chamberId = chamber.id;
        
        const isUnlocked = window.gameState?.gameData.unlockedChambers.includes(chamber.id) || false;
        const isCompleted = window.gameState?.gameData.collectedRelics.includes(chamber.relic) || false;
        
        if (isCompleted) {
            door.classList.add('completed');
        } else if (isUnlocked) {
            door.classList.add('unlocked');
        }
        
        const chamberNumber = document.createElement('div');
        chamberNumber.className = 'chamber-number';
        chamberNumber.textContent = chamber.id;
        
        const chamberName = document.createElement('div');
        chamberName.className = 'chamber-name';
        chamberName.textContent = chamber.name;
        
        const lock = document.createElement('div');
        lock.className = 'chamber-lock';
        
        if (isCompleted) {
            lock.textContent = '✅';
        } else if (isUnlocked) {
            lock.textContent = '🔓';
        } else {
            lock.textContent = '🔒';
        }
        
        door.appendChild(chamberNumber);
        door.appendChild(chamberName);
        door.appendChild(lock);
        
        if (isUnlocked && !isCompleted) {
            door.addEventListener('click', () => this.onChamberClick(chamber));
            door.style.cursor = 'pointer';
        } else if (!isUnlocked) {
            door.style.cursor = 'not-allowed';
            door.addEventListener('click', () => this.onLockedChamberClick(chamber));
        } else {
            door.addEventListener('click', () => this.onCompletedChamberClick(chamber));
        }
        
        return door;
    }
    
    onChamberClick(chamber) {
        if (window.gameState) {
            this.showChamberPreview(chamber);
        }
    }
    
    onLockedChamberClick(chamber) {
        if (window.gameState) {
            const requiredLevel = chamber.id;
            const currentLevel = window.gameState.gameData.playerLevel;
            const completedChambers = window.gameState.gameData.collectedRelics.length;
            
            let message = `This chamber remains sealed. `;
            
            if (chamber.id === 1) {
                message += `Begin your adventure in the Hall of Scribes!`;
            } else {
                const previousChamber = this.chambers.find(c => c.id === chamber.id - 1);
                message += `Complete "${previousChamber?.name}" to unlock this chamber.`;
            }
            
            window.gameState.showModal(
                'Chamber Locked',
                message,
                [{
                    text: 'Understood',
                    action: () => window.gameState.hideModal()
                }]
            );
        }
    }
    
    onCompletedChamberClick(chamber) {
        if (window.gameState) {
            window.gameState.showModal(
                'Chamber Complete',
                `You have already conquered "${chamber.name}" and claimed its sacred relic. The chamber's mysteries have been revealed!`,
                [{
                    text: 'Replay Chamber',
                    action: () => {
                        window.gameState.hideModal();
                        window.gameState.enterChamber(chamber.id);
                    }
                }, {
                    text: 'Close',
                    action: () => window.gameState.hideModal()
                }]
            );
        }
    }
    
    showChamberPreview(chamber) {
        const previewData = this.getChamberPreview(chamber);
        
        if (window.gameState) {
            window.gameState.showModal(
                `Enter ${chamber.name}?`,
                `<div class="chamber-preview">
                    <p><strong>Difficulty:</strong> ${previewData.difficulty}</p>
                    <p><strong>Expected Time:</strong> ${previewData.estimatedTime}</p>
                    <p><strong>Sacred Relic:</strong> ${previewData.relicName}</p>
                    <p><strong>Challenge:</strong> ${previewData.challenge}</p>
                    <hr>
                    <p><em>"${previewData.scribeHint}"</em></p>
                </div>`,
                [{
                    text: 'Enter Chamber',
                    action: () => {
                        window.gameState.hideModal();
                        window.gameState.enterChamber(chamber.id);
                    }
                }, {
                    text: 'Not Yet',
                    action: () => window.gameState.hideModal()
                }]
            );
        }
    }
    
    getChamberPreview(chamber) {
        const previews = {
            1: {
                difficulty: '⭐ Easy',
                estimatedTime: '3-4 minutes',
                relicName: 'Ankh of Eternal Life',
                challenge: 'Match hieroglyphs to their meanings',
                scribeHint: 'The scribes left their wisdom in simple glyphs. Study them well, young explorer.'
            },
            2: {
                difficulty: '⭐⭐ Medium',
                estimatedTime: '4-5 minutes',
                relicName: 'Feather of Ma\'at',
                challenge: 'Balance the scales of justice',
                scribeHint: 'Ma\'at weighs the hearts of mortals. Can you balance truth and justice?'
            },
            3: {
                difficulty: '⭐⭐ Medium',
                estimatedTime: '4-5 minutes',
                relicName: 'Canopic Jar of Duamutef',
                challenge: 'Navigate the jackal god\'s maze',
                scribeHint: 'Anubis guards the passage to the afterlife. Prove your worthiness through his trials.'
            },
            4: {
                difficulty: '⭐⭐⭐ Hard',
                estimatedTime: '5-6 minutes',
                relicName: 'Eye of Horus',
                challenge: 'Decode the falcon god\'s cipher',
                scribeHint: 'The sky god sees all. His sight reveals hidden truths to those clever enough to look.'
            },
            5: {
                difficulty: '⭐⭐⭐ Hard',
                estimatedTime: '5-6 minutes',
                relicName: 'Ibis Scroll of Thoth',
                challenge: 'Solve the wisdom keeper\'s riddles',
                scribeHint: 'Thoth, master of knowledge, challenges minds with puzzles beyond mortal comprehension.'
            },
            6: {
                difficulty: '⭐⭐⭐⭐ Expert',
                estimatedTime: '6-8 minutes',
                relicName: 'Golden Pharaoh\'s Seal',
                challenge: 'Unlock the final vault',
                scribeHint: 'The pharaoh\'s greatest treasure lies beyond this final test. Only the truly worthy may pass.'
            }
        };
        
        return previews[chamber.id] || {
            difficulty: 'Unknown',
            estimatedTime: 'Unknown',
            relicName: 'Sacred Relic',
            challenge: 'Ancient puzzle',
            scribeHint: 'The ancients have hidden their secrets well...'
        };
    }
    
    updateChamberStatus(chamberId, status) {
        const doorElement = this.mapContainer?.querySelector(`[data-chamber-id="${chamberId}"]`);
        if (!doorElement) return;
        
        doorElement.classList.remove('unlocked', 'completed');
        
        if (status === 'completed') {
            doorElement.classList.add('completed');
            const lock = doorElement.querySelector('.chamber-lock');
            if (lock) lock.textContent = '✅';
        } else if (status === 'unlocked') {
            doorElement.classList.add('unlocked');
            const lock = doorElement.querySelector('.chamber-lock');
            if (lock) lock.textContent = '🔓';
        }
        
        this.updateDoorInteractivity(doorElement, chamberId, status);
    }
    
    updateDoorInteractivity(doorElement, chamberId, status) {
        const chamber = this.chambers.find(c => c.id === chamberId);
        if (!chamber) return;
        
        doorElement.replaceWith(this.createChamberDoor(chamber));
    }
    
    highlightAvailableChambers() {
        if (!window.gameState) return;
        
        const unlockedChambers = window.gameState.gameData.unlockedChambers;
        const completedRelics = window.gameState.gameData.collectedRelics;
        
        this.chambers.forEach(chamber => {
            const doorElement = this.mapContainer?.querySelector(`[data-chamber-id="${chamber.id}"]`);
            if (!doorElement) return;
            
            if (unlockedChambers.includes(chamber.id) && !completedRelics.includes(chamber.relic)) {
                doorElement.style.animation = 'pulse 2s infinite';
            } else {
                doorElement.style.animation = 'none';
            }
        });
    }
    
    showPath(fromChamber, toChamber) {
        console.log(`Showing path from chamber ${fromChamber} to ${toChamber}`);
    }
    
    addCSSAnimations() {
        if (!document.querySelector('#map-animations')) {
            const style = document.createElement('style');
            style.id = 'map-animations';
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
                    50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
                    100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
                }
                
                @keyframes unlock {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .chamber-door.unlocking {
                    animation: unlock 0.5s ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    animateUnlock(chamberId) {
        const doorElement = this.mapContainer?.querySelector(`[data-chamber-id="${chamberId}"]`);
        if (doorElement) {
            doorElement.classList.add('unlocking');
            setTimeout(() => {
                doorElement.classList.remove('unlocking');
                this.updateChamberStatus(chamberId, 'unlocked');
            }, 500);
        }
    }
    
    animateCompletion(chamberId) {
        const doorElement = this.mapContainer?.querySelector(`[data-chamber-id="${chamberId}"]`);
        if (doorElement) {
            doorElement.style.animation = 'unlock 0.8s ease-in-out';
            setTimeout(() => {
                doorElement.style.animation = 'none';
                this.updateChamberStatus(chamberId, 'completed');
            }, 800);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tombMap = new TombMap();
    
    if (window.tombMap) {
        window.tombMap.addCSSAnimations();
    }
});