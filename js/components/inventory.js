class Inventory {
    constructor() {
        this.items = {};
        this.powerUps = {};
        this.relics = [];
        this.isVisible = false;
        this.container = null;
        
        this.init();
    }
    
    init() {
        this.createInventoryUI();
        this.setupEventListeners();
    }
    
    createInventoryUI() {
        const inventoryHTML = `
            <div id="inventory-panel" class="inventory-panel hidden">
                <div class="inventory-header">
                    <h3>Inventory</h3>
                    <button id="close-inventory" class="close-btn">×</button>
                </div>
                
                <div class="inventory-content">
                    <div class="inventory-section">
                        <h4>Sacred Relics</h4>
                        <div id="relics-grid" class="relics-grid">
                            <!-- Relics will be populated here -->
                        </div>
                    </div>
                    
                    <div class="inventory-section">
                        <h4>Power-ups</h4>
                        <div id="powerups-grid" class="powerups-grid">
                            <!-- Power-ups will be populated here -->
                        </div>
                    </div>
                    
                    <div class="inventory-section">
                        <h4>Collectibles</h4>
                        <div id="items-grid" class="items-grid">
                            <!-- Items will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
            
            <button id="toggle-inventory" class="inventory-toggle">
                📦 Inventory
            </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', inventoryHTML);
        
        this.container = document.getElementById('inventory-panel');
        this.toggleButton = document.getElementById('toggle-inventory');
    }
    
    setupEventListeners() {
        this.toggleButton.addEventListener('click', () => this.toggle());
        
        document.getElementById('close-inventory').addEventListener('click', () => this.hide());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                this.toggle();
            }
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
        
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('powerup-item') && !e.target.classList.contains('disabled')) {
                this.usePowerUp(e.target.dataset.powerupType);
            }
        });
    }
    
    show() {
        this.isVisible = true;
        this.container.classList.remove('hidden');
        this.updateDisplay();
    }
    
    hide() {
        this.isVisible = false;
        this.container.classList.add('hidden');
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    updateDisplay() {
        this.updateRelicsDisplay();
        this.updatePowerUpsDisplay();
        this.updateItemsDisplay();
    }
    
    updateRelicsDisplay() {
        const relicsGrid = document.getElementById('relics-grid');
        const gameData = window.gameState?.gameData;
        
        const relicNames = {
            1: 'Ankh of Eternal Life',
            2: 'Feather of Ma\'at',
            3: 'Canopic Jar of Duamutef',
            4: 'Eye of Horus',
            5: 'Ibis Scroll of Thoth',
            6: 'Golden Pharaoh\'s Seal'
        };
        
        const relicSymbols = {
            1: '☥',
            2: '𓆄',
            3: '🏺',
            4: '👁️',
            5: '📜',
            6: '🔐'
        };
        
        relicsGrid.innerHTML = '';
        
        for (let i = 1; i <= 6; i++) {
            const isCollected = gameData?.collectedRelics.includes(i) || false;
            
            const relicItem = document.createElement('div');
            relicItem.className = `relic-item ${isCollected ? 'collected' : 'not-collected'}`;
            relicItem.innerHTML = `
                <div class="relic-symbol">${isCollected ? relicSymbols[i] : '❓'}</div>
                <div class="relic-name">${isCollected ? relicNames[i] : 'Unknown Relic'}</div>
                <div class="relic-status">${isCollected ? 'Collected' : 'Not Found'}</div>
            `;
            
            relicsGrid.appendChild(relicItem);
        }
    }
    
    updatePowerUpsDisplay() {
        const powerupsGrid = document.getElementById('powerups-grid');
        const gameData = window.gameState?.gameData;
        
        const powerUpInfo = {
            torchRefill: {
                name: 'Torch Refill',
                symbol: '🔥',
                description: 'Restores 30 seconds of torchlight',
                effect: '+30s Light'
            },
            ankhOfLife: {
                name: 'Ankh of Life',
                symbol: '☥',
                description: 'Restores 1 health point',
                effect: '+1 Health'
            },
            rosettaHint: {
                name: 'Rosetta Hint',
                symbol: '📖',
                description: 'Reveals correct glyph match',
                effect: 'Show Hint'
            },
            scarabCompass: {
                name: 'Scarab Compass',
                symbol: '🪲',
                description: 'Highlights interactive objects',
                effect: 'Highlight Items'
            },
            goldenHorusWings: {
                name: 'Golden Horus Wings',
                symbol: '🪶',
                description: 'Auto-solves one puzzle section',
                effect: 'Auto-solve'
            }
        };
        
        powerupsGrid.innerHTML = '';
        
        Object.entries(powerUpInfo).forEach(([type, info]) => {
            const count = gameData?.powerUps[type] || 0;
            
            const powerupItem = document.createElement('div');
            powerupItem.className = `powerup-item ${count > 0 ? 'available' : 'disabled'}`;
            powerupItem.dataset.powerupType = type;
            powerupItem.innerHTML = `
                <div class="powerup-symbol">${info.symbol}</div>
                <div class="powerup-name">${info.name}</div>
                <div class="powerup-count">×${count}</div>
                <div class="powerup-effect">${info.effect}</div>
                <div class="powerup-description">${info.description}</div>
            `;
            
            powerupsGrid.appendChild(powerupItem);
        });
    }
    
    updateItemsDisplay() {
        const itemsGrid = document.getElementById('items-grid');
        
        itemsGrid.innerHTML = `
            <div class="info-message">
                <p>Collectible items and artifacts will appear here as you explore the tomb.</p>
                <p><em>Keep exploring to discover hidden treasures!</em></p>
            </div>
        `;
    }
    
    addRelic(relicId) {
        if (!this.relics.includes(relicId)) {
            this.relics.push(relicId);
            this.updateDisplay();
            
            this.showNotification(`Sacred Relic Acquired!`, `You have found a powerful ancient artifact.`);
        }
    }
    
    addPowerUp(type, quantity = 1) {
        if (!this.powerUps[type]) {
            this.powerUps[type] = 0;
        }
        this.powerUps[type] += quantity;
        this.updateDisplay();
        
        const powerUpNames = {
            torchRefill: 'Torch Refill',
            ankhOfLife: 'Ankh of Life',
            rosettaHint: 'Rosetta Hint',
            scarabCompass: 'Scarab Compass',
            goldenHorusWings: 'Golden Horus Wings'
        };
        
        this.showNotification(`Power-up Found!`, `Added ${quantity} ${powerUpNames[type] || type} to your inventory.`);
    }
    
    usePowerUp(type) {
        const gameData = window.gameState?.gameData;
        if (!gameData || gameData.powerUps[type] <= 0) {
            this.showNotification('Power-up Unavailable', 'You don\'t have this power-up available.');
            return false;
        }
        
        if (window.gameState.usePowerUp(type)) {
            this.updateDisplay();
            return true;
        }
        
        return false;
    }
    
    addItem(itemId, name, description, symbol = '📦') {
        this.items[itemId] = {
            name,
            description,
            symbol,
            dateFound: new Date().toISOString()
        };
        
        this.updateDisplay();
        this.showNotification(`Item Found!`, `${name}: ${description}`);
    }
    
    hasItem(itemId) {
        return this.items.hasOwnProperty(itemId);
    }
    
    getItemCount(itemId) {
        return this.items[itemId] ? 1 : 0;
    }
    
    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'inventory-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    exportInventory() {
        return {
            items: this.items,
            powerUps: this.powerUps,
            relics: this.relics
        };
    }
    
    importInventory(data) {
        this.items = data.items || {};
        this.powerUps = data.powerUps || {};
        this.relics = data.relics || [];
        
        this.updateDisplay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const inventoryStyles = `
        .inventory-toggle {
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(45deg, #8b4513 0%, #daa520 100%);
            border: 2px solid #ffd700;
            color: #f4e4c1;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.9rem;
            z-index: 900;
            transition: all 0.3s ease;
        }
        
        .inventory-toggle:hover {
            background: linear-gradient(45deg, #daa520 0%, #ffd700 100%);
            color: #2c1810;
            transform: translateY(-2px);
        }
        
        .inventory-panel {
            position: fixed;
            top: 130px;
            right: 20px;
            width: 400px;
            max-height: 70vh;
            background: linear-gradient(135deg, #2c1810 0%, #8b4513 100%);
            border: 3px solid #ffd700;
            border-radius: 15px;
            color: #f4e4c1;
            z-index: 1000;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .inventory-panel.hidden {
            display: none;
        }
        
        .inventory-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 2px solid #ffd700;
            background: rgba(0,0,0,0.2);
        }
        
        .inventory-header h3 {
            color: #ffd700;
            margin: 0;
        }
        
        .inventory-content {
            padding: 1rem;
        }
        
        .inventory-section {
            margin-bottom: 2rem;
        }
        
        .inventory-section h4 {
            color: #deb887;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #8b4513;
        }
        
        .relics-grid, .powerups-grid, .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }
        
        .relic-item, .powerup-item {
            background: rgba(0,0,0,0.3);
            border: 2px solid #8b4513;
            border-radius: 10px;
            padding: 1rem;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .relic-item.collected {
            border-color: #ffd700;
            background: rgba(255,215,0,0.1);
        }
        
        .relic-item.not-collected {
            opacity: 0.5;
        }
        
        .powerup-item.available {
            border-color: #4169e1;
            cursor: pointer;
        }
        
        .powerup-item.available:hover {
            border-color: #6495ed;
            background: rgba(65,105,225,0.1);
            transform: translateY(-2px);
        }
        
        .powerup-item.disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        
        .relic-symbol, .powerup-symbol {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .relic-name, .powerup-name {
            font-weight: bold;
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
        }
        
        .relic-status {
            font-size: 0.8rem;
            color: #deb887;
        }
        
        .powerup-count {
            font-size: 0.8rem;
            color: #ffd700;
            font-weight: bold;
            margin-bottom: 0.3rem;
        }
        
        .powerup-effect {
            font-size: 0.8rem;
            color: #87ceeb;
            font-weight: bold;
            margin-bottom: 0.3rem;
        }
        
        .powerup-description {
            font-size: 0.7rem;
            color: #deb887;
            line-height: 1.2;
        }
        
        .info-message {
            text-align: center;
            color: #deb887;
            font-style: italic;
            padding: 2rem;
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
        }
        
        .inventory-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: linear-gradient(45deg, #228b22 0%, #32cd32 100%);
            border: 2px solid #98fb98;
            color: white;
            border-radius: 10px;
            padding: 1rem;
            max-width: 300px;
            z-index: 2000;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .inventory-notification.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        
        .notification-content h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.1rem;
        }
        
        .notification-content p {
            margin: 0;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .inventory-panel {
                width: calc(100vw - 40px);
                right: 20px;
                left: 20px;
            }
            
            .relics-grid, .powerups-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    
    if (!document.querySelector('#inventory-styles')) {
        const style = document.createElement('style');
        style.id = 'inventory-styles';
        style.textContent = inventoryStyles;
        document.head.appendChild(style);
    }
    
    window.inventory = new Inventory();
});

window.Inventory = Inventory;