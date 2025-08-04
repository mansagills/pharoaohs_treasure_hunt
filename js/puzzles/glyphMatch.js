class GlyphMatchPuzzle {
    constructor(container, puzzleData, onComplete) {
        this.container = container;
        this.puzzleData = puzzleData;
        this.onComplete = onComplete;
        this.matches = {};
        this.totalMatches = 0;
        this.correctMatches = 0;
        this.hintsUsed = 0;
        this.maxHints = 2;
        this.isComplete = false;
        
        this.init();
    }
    
    init() {
        this.createPuzzleHTML();
        this.setupInteractions();
        this.totalMatches = this.puzzleData.glyphs.length;
    }
    
    createPuzzleHTML() {
        const difficulty = this.puzzleData.difficulty || 'easy';
        const timeLimit = this.puzzleData.timeLimit || 90;
        
        this.container.innerHTML = `
            <div class="glyph-puzzle">
                <div class="puzzle-header">
                    <h3>Hieroglyph Decoder</h3>
                    <p class="puzzle-instruction">Match each hieroglyph with its correct meaning</p>
                    <div class="puzzle-stats">
                        <span class="matches-count">Matches: <span id="match-counter">0/${this.totalMatches}</span></span>
                        <span class="hints-remaining">Hints: <span id="hint-counter">${this.maxHints}</span></span>
                        <button id="use-hint" class="hint-btn" ${this.maxHints <= 0 ? 'disabled' : ''}>💡 Use Hint</button>
                    </div>
                </div>
                
                <div class="glyph-matching-area">
                    <div class="glyphs-column">
                        <h4>Hieroglyphs</h4>
                        <div class="glyph-items" id="glyph-items">
                            ${this.createGlyphItems()}
                        </div>
                    </div>
                    
                    <div class="meanings-column">
                        <h4>Meanings</h4>
                        <div class="meaning-items" id="meaning-items">
                            ${this.createMeaningItems()}
                        </div>
                    </div>
                </div>
                
                <div class="matching-lines-container">
                    <svg class="matching-lines" id="matching-lines"></svg>
                </div>
                
                ${difficulty !== 'easy' ? '' : this.createReferenceChart()}
            </div>
        `;
    }
    
    createGlyphItems() {
        return this.puzzleData.glyphs.map((glyph, index) => `
            <div class="glyph-item" data-glyph-id="${glyph.id}" data-index="${index}">
                <div class="glyph-symbol">${glyph.symbol}</div>
                <div class="glyph-pronunciation">${glyph.pronunciation || ''}</div>
            </div>
        `).join('');
    }
    
    createMeaningItems() {
        const meanings = [...this.puzzleData.glyphs.map(g => ({ 
            id: g.id, 
            meaning: g.meaning 
        }))];
        
        if (this.puzzleData.difficulty === 'medium' || this.puzzleData.difficulty === 'hard') {
            meanings.push(...this.puzzleData.distractors || []);
        }
        
        const shuffled = this.shuffleArray(meanings);
        
        return shuffled.map((item, index) => `
            <div class="meaning-item" data-meaning-id="${item.id}" data-index="${index}">
                <div class="meaning-text">${item.meaning}</div>
            </div>
        `).join('');
    }
    
    createReferenceChart() {
        return `
            <div class="reference-chart" id="reference-chart">
                <h4>Reference Chart</h4>
                <div class="reference-items">
                    ${this.puzzleData.glyphs.map(glyph => `
                        <div class="reference-item">
                            <span class="ref-symbol">${glyph.symbol}</span>
                            <span class="ref-meaning">${glyph.meaning}</span>
                        </div>
                    `).join('')}
                </div>
                <p class="chart-note">Use this chart to help match the hieroglyphs!</p>
            </div>
        `;
    }
    
    setupInteractions() {
        const glyphItems = this.container.querySelectorAll('.glyph-item');
        const meaningItems = this.container.querySelectorAll('.meaning-item');
        const hintButton = this.container.querySelector('#use-hint');
        
        glyphItems.forEach(item => {
            item.addEventListener('click', (e) => this.onGlyphClick(e));
        });
        
        meaningItems.forEach(item => {
            item.addEventListener('click', (e) => this.onMeaningClick(e));
        });
        
        if (hintButton) {
            hintButton.addEventListener('click', () => this.useHint());
        }
        
        this.selectedGlyph = null;
        this.selectedMeaning = null;
        
        if (this.puzzleData.difficulty === 'medium') {
            setTimeout(() => this.fadeReferenceChart(), 10000);
        }
    }
    
    onGlyphClick(event) {
        if (this.isComplete) return;
        
        const glyphItem = event.currentTarget;
        const glyphId = glyphItem.dataset.glyphId;
        
        this.clearSelections();
        
        if (this.isGlyphMatched(glyphId)) {
            this.showFeedback('This hieroglyph is already matched!', 'info');
            return;
        }
        
        this.selectedGlyph = glyphId;
        glyphItem.classList.add('selected');
        
        this.showFeedback('Now select the correct meaning...', 'instruction');
    }
    
    onMeaningClick(event) {
        if (this.isComplete) return;
        
        const meaningItem = event.currentTarget;
        const meaningId = meaningItem.dataset.meaningId;
        
        if (!this.selectedGlyph) {
            this.showFeedback('Please select a hieroglyph first!', 'warning');
            return;
        }
        
        if (this.isMeaningMatched(meaningId)) {
            this.showFeedback('This meaning is already matched!', 'info');
            return;
        }
        
        this.selectedMeaning = meaningId;
        meaningItem.classList.add('selected');
        
        this.checkMatch();
    }
    
    checkMatch() {
        if (!this.selectedGlyph || !this.selectedMeaning) return;
        
        const isCorrect = this.selectedGlyph === this.selectedMeaning;
        
        if (isCorrect) {
            this.handleCorrectMatch();
        } else {
            this.handleIncorrectMatch();
        }
        
        setTimeout(() => this.clearSelections(), 1000);
    }
    
    handleCorrectMatch() {
        this.matches[this.selectedGlyph] = this.selectedMeaning;
        this.correctMatches++;
        
        const glyphElement = this.container.querySelector(`[data-glyph-id="${this.selectedGlyph}"]`);
        const meaningElement = this.container.querySelector(`[data-meaning-id="${this.selectedMeaning}"]`);
        
        glyphElement.classList.add('matched');
        meaningElement.classList.add('matched');
        
        this.drawMatchingLine(glyphElement, meaningElement);
        this.updateMatchCounter();
        this.showFeedback('Correct! Well done!', 'success');
        
        if (this.correctMatches >= this.totalMatches) {
            setTimeout(() => this.completePuzzle(true), 1000);
        }
    }
    
    handleIncorrectMatch() {
        this.showFeedback('Not quite right. Try again!', 'error');
        
        if (window.gameState && Math.random() < 0.3) {
            window.gameState.takeDamage(1);
        }
    }
    
    drawMatchingLine(glyphElement, meaningElement) {
        const svg = this.container.querySelector('#matching-lines');
        const glyphRect = glyphElement.getBoundingClientRect();
        const meaningRect = meaningElement.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        const x1 = glyphRect.right - containerRect.left;
        const y1 = glyphRect.top + (glyphRect.height / 2) - containerRect.top;
        const x2 = meaningRect.left - containerRect.left;
        const y2 = meaningRect.top + (meaningRect.height / 2) - containerRect.top;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#ffd700');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-dasharray', '5,5');
        line.classList.add('match-line');
        
        svg.appendChild(line);
    }
    
    clearSelections() {
        this.container.querySelectorAll('.selected').forEach(item => {
            item.classList.remove('selected');
        });
        this.selectedGlyph = null;
        this.selectedMeaning = null;
    }
    
    isGlyphMatched(glyphId) {
        return this.matches.hasOwnProperty(glyphId);
    }
    
    isMeaningMatched(meaningId) {
        return Object.values(this.matches).includes(meaningId);
    }
    
    updateMatchCounter() {
        const counter = this.container.querySelector('#match-counter');
        if (counter) {
            counter.textContent = `${this.correctMatches}/${this.totalMatches}`;
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
        }, 3000);
    }
    
    useHint() {
        if (this.hintsUsed >= this.maxHints || this.isComplete) return;
        
        const unmatchedGlyphs = this.puzzleData.glyphs.filter(g => !this.isGlyphMatched(g.id));
        if (unmatchedGlyphs.length === 0) return;
        
        const randomGlyph = unmatchedGlyphs[Math.floor(Math.random() * unmatchedGlyphs.length)];
        const glyphElement = this.container.querySelector(`[data-glyph-id="${randomGlyph.id}"]`);
        const meaningElement = this.container.querySelector(`[data-meaning-id="${randomGlyph.id}"]`);
        
        glyphElement.classList.add('hint-highlight');
        meaningElement.classList.add('hint-highlight');
        
        setTimeout(() => {
            glyphElement.classList.remove('hint-highlight');
            meaningElement.classList.remove('hint-highlight');
        }, 3000);
        
        this.hintsUsed++;
        this.updateHintCounter();
        this.showFeedback(`Hint: The symbol "${randomGlyph.symbol}" means "${randomGlyph.meaning}"`, 'hint');
    }
    
    updateHintCounter() {
        const counter = this.container.querySelector('#hint-counter');
        const button = this.container.querySelector('#use-hint');
        
        if (counter) {
            counter.textContent = this.maxHints - this.hintsUsed;
        }
        
        if (button && this.hintsUsed >= this.maxHints) {
            button.disabled = true;
            button.textContent = '💡 No Hints Left';
        }
    }
    
    fadeReferenceChart() {
        const chart = this.container.querySelector('#reference-chart');
        if (chart) {
            chart.style.transition = 'opacity 2s ease-out';
            chart.style.opacity = '0.3';
            
            const note = chart.querySelector('.chart-note');
            if (note) {
                note.textContent = 'Reference chart faded - rely on your memory!';
            }
        }
    }
    
    showHint() {
        this.useHint();
    }
    
    highlightInteractive() {
        const interactiveElements = this.container.querySelectorAll('.glyph-item:not(.matched), .meaning-item:not(.matched)');
        interactiveElements.forEach(element => {
            element.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.7)';
            setTimeout(() => {
                element.style.boxShadow = '';
            }, 2000);
        });
    }
    
    autoSolveQuadrant() {
        const unmatchedGlyphs = this.puzzleData.glyphs.filter(g => !this.isGlyphMatched(g.id));
        if (unmatchedGlyphs.length === 0) return;
        
        const glyphToSolve = unmatchedGlyphs[0];
        this.matches[glyphToSolve.id] = glyphToSolve.id;
        this.correctMatches++;
        
        const glyphElement = this.container.querySelector(`[data-glyph-id="${glyphToSolve.id}"]`);
        const meaningElement = this.container.querySelector(`[data-meaning-id="${glyphToSolve.id}"]`);
        
        glyphElement.classList.add('matched');
        meaningElement.classList.add('matched');
        
        this.drawMatchingLine(glyphElement, meaningElement);
        this.updateMatchCounter();
        this.showFeedback('Golden Horus Wings activated! One match completed!', 'success');
        
        if (this.correctMatches >= this.totalMatches) {
            setTimeout(() => this.completePuzzle(true), 1000);
        }
    }
    
    completePuzzle(success) {
        this.isComplete = true;
        this.clearSelections();
        
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
                <h3>🏺 Chamber Completed! 🏺</h3>
                <p>You have successfully decoded the ancient hieroglyphs!</p>
                <div class="relic-display">
                    <div class="relic-icon">💎</div>
                    <p>Sacred Relic Acquired!</p>
                </div>
            </div>
        `;
        
        this.container.appendChild(victoryMessage);
        
        setTimeout(() => {
            if (victoryMessage && victoryMessage.parentNode) {
                victoryMessage.remove();
            }
        }, 3000);
    }
    
    reset() {
        this.matches = {};
        this.correctMatches = 0;
        this.hintsUsed = 0;
        this.isComplete = false;
        this.selectedGlyph = null;
        this.selectedMeaning = null;
        
        this.init();
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const puzzleStyles = `
        .glyph-puzzle {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            color: #f4e4c1;
        }
        
        .puzzle-header {
            text-align: center;
            margin-bottom: 2rem;
            position: relative;
        }
        
        .puzzle-header h3 {
            color: #ffd700;
            margin-bottom: 0.5rem;
            font-size: 1.8rem;
        }
        
        .puzzle-instruction {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: #deb887;
        }
        
        .puzzle-stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .matches-count, .hints-remaining {
            font-size: 1rem;
            font-weight: bold;
        }
        
        .hint-btn {
            background: linear-gradient(45deg, #4169e1 0%, #6495ed 100%);
            border: 2px solid #87ceeb;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.3s ease;
        }
        
        .hint-btn:hover:not(:disabled) {
            background: linear-gradient(45deg, #6495ed 0%, #87ceeb 100%);
            transform: translateY(-1px);
        }
        
        .hint-btn:disabled {
            background: #666;
            border-color: #999;
            cursor: not-allowed;
            opacity: 0.6;
        }
        
        .glyph-matching-area {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 1.5rem;
            position: relative;
            min-height: 300px;
        }
        
        .glyphs-column, .meanings-column {
            text-align: center;
        }
        
        .glyphs-column h4, .meanings-column h4 {
            color: #ffd700;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        
        .glyph-items, .meaning-items {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 0.5rem;
        }
        
        .glyph-items::-webkit-scrollbar, .meaning-items::-webkit-scrollbar {
            width: 8px;
        }
        
        .glyph-items::-webkit-scrollbar-track, .meaning-items::-webkit-scrollbar-track {
            background: rgba(139, 69, 19, 0.3);
            border-radius: 4px;
        }
        
        .glyph-items::-webkit-scrollbar-thumb, .meaning-items::-webkit-scrollbar-thumb {
            background: #8b4513;
            border-radius: 4px;
        }
        
        .glyph-items::-webkit-scrollbar-thumb:hover, .meaning-items::-webkit-scrollbar-thumb:hover {
            background: #ffd700;
        }
        
        .glyph-item, .meaning-item {
            background: rgba(139, 69, 19, 0.3);
            border: 2px solid #8b4513;
            border-radius: 8px;
            padding: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            min-height: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .glyph-item:hover, .meaning-item:hover {
            border-color: #ffd700;
            background: rgba(218, 165, 32, 0.3);
            transform: translateY(-2px);
        }
        
        .glyph-item.selected, .meaning-item.selected {
            border-color: #00ff00;
            background: rgba(0, 255, 0, 0.2);
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
        
        .glyph-item.matched, .meaning-item.matched {
            border-color: #ffd700;
            background: rgba(255, 215, 0, 0.3);
            cursor: default;
            transform: none;
        }
        
        .glyph-item.matched:hover, .meaning-item.matched:hover {
            transform: none;
        }
        
        .glyph-item.hint-highlight, .meaning-item.hint-highlight {
            animation: hint-pulse 1s ease-in-out 3;
        }
        
        @keyframes hint-pulse {
            0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
            50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
        }
        
        .glyph-symbol {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .glyph-pronunciation {
            font-size: 0.9rem;
            color: #deb887;
            font-style: italic;
        }
        
        .meaning-text {
            font-size: 1.1rem;
            font-weight: bold;
        }
        
        .matching-lines-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1;
        }
        
        .matching-lines {
            width: 100%;
            height: 100%;
        }
        
        .match-line {
            opacity: 0.8;
            animation: draw-line 0.5s ease-in-out;
        }
        
        @keyframes draw-line {
            0% { stroke-dashoffset: 100%; }
            100% { stroke-dashoffset: 0%; }
        }
        
        .reference-chart {
            background: rgba(0, 0, 0, 0.2);
            border: 2px solid #8b4513;
            border-radius: 10px;
            padding: 1rem;
            margin-top: 2rem;
        }
        
        .reference-chart h4 {
            color: #ffd700;
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .reference-items {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.5rem;
        }
        
        .reference-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background: rgba(139, 69, 19, 0.2);
            border-radius: 5px;
        }
        
        .ref-symbol {
            font-size: 1.5rem;
        }
        
        .ref-meaning {
            font-weight: bold;
        }
        
        .chart-note {
            text-align: center;
            font-style: italic;
            color: #deb887;
            margin-top: 1rem;
        }
        
        .feedback-message {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.5rem 1rem;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10;
            animation: feedback-show 0.3s ease-in-out;
        }
        
        @keyframes feedback-show {
            0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        .feedback-success {
            background: #28a745;
            color: white;
        }
        
        .feedback-error {
            background: #dc3545;
            color: white;
        }
        
        .feedback-warning {
            background: #ffc107;
            color: #212529;
        }
        
        .feedback-info {
            background: #17a2b8;
            color: white;
        }
        
        .feedback-instruction {
            background: #6f42c1;
            color: white;
        }
        
        .feedback-hint {
            background: #4169e1;
            color: white;
        }
        
        .victory-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #8b4513 0%, #daa520 100%);
            border: 3px solid #ffd700;
            border-radius: 15px;
            padding: 2rem;
            text-align: center;
            z-index: 100;
            animation: victory-appear 0.5s ease-in-out;
        }
        
        @keyframes victory-appear {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        .victory-content h3 {
            color: #ffd700;
            margin-bottom: 1rem;
            font-size: 1.8rem;
        }
        
        .relic-display {
            margin-top: 1rem;
        }
        
        .relic-icon {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            animation: relic-glow 2s infinite;
        }
        
        @keyframes relic-glow {
            0%, 100% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
            50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
        }
        
        @media (max-width: 768px) {
            .glyph-matching-area {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .puzzle-stats {
                flex-direction: column;
                gap: 1rem;
            }
            
            .reference-items {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    if (!document.querySelector('#glyph-puzzle-styles')) {
        const style = document.createElement('style');
        style.id = 'glyph-puzzle-styles';
        style.textContent = puzzleStyles;
        document.head.appendChild(style);
    }
});

window.GlyphMatchPuzzle = GlyphMatchPuzzle;