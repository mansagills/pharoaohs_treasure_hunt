class ProgressBar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            max: options.max || 100,
            current: options.current || 0,
            label: options.label || '',
            color: options.color || '#ffd700',
            backgroundColor: options.backgroundColor || '#4a4a4a',
            showPercentage: options.showPercentage || true,
            animated: options.animated || true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createProgressBar();
        this.update(this.options.current);
    }
    
    createProgressBar() {
        this.progressElement = document.createElement('div');
        this.progressElement.className = 'custom-progress-bar';
        
        this.progressElement.innerHTML = `
            <div class="progress-label">${this.options.label}</div>
            <div class="progress-container">
                <div class="progress-track"></div>
                <div class="progress-fill"></div>
                <div class="progress-text"></div>
            </div>
        `;
        
        this.container.appendChild(this.progressElement);
        
        this.track = this.progressElement.querySelector('.progress-track');
        this.fill = this.progressElement.querySelector('.progress-fill');
        this.text = this.progressElement.querySelector('.progress-text');
        
        this.applyStyles();
    }
    
    applyStyles() {
        this.track.style.backgroundColor = this.options.backgroundColor;
        this.fill.style.backgroundColor = this.options.color;
        
        if (this.options.animated) {
            this.fill.style.transition = 'width 0.5s ease-in-out';
        }
    }
    
    update(value, max = null) {
        if (max !== null) {
            this.options.max = max;
        }
        
        this.options.current = Math.max(0, Math.min(value, this.options.max));
        const percentage = (this.options.current / this.options.max) * 100;
        
        this.fill.style.width = `${percentage}%`;
        
        if (this.options.showPercentage) {
            this.text.textContent = `${Math.round(percentage)}%`;
        } else {
            this.text.textContent = `${this.options.current}/${this.options.max}`;
        }
        
        this.updateColor(percentage);
    }
    
    updateColor(percentage) {
        if (percentage <= 25) {
            this.fill.style.backgroundColor = '#ff4500';
        } else if (percentage <= 50) {
            this.fill.style.backgroundColor = '#ffa500';
        } else if (percentage <= 75) {
            this.fill.style.backgroundColor = '#ffd700';
        } else {
            this.fill.style.backgroundColor = this.options.color;
        }
    }
    
    increment(amount = 1) {
        this.update(this.options.current + amount);
    }
    
    decrement(amount = 1) {
        this.update(this.options.current - amount);
    }
    
    setLabel(label) {
        this.options.label = label;
        const labelElement = this.progressElement.querySelector('.progress-label');
        labelElement.textContent = label;
    }
    
    reset() {
        this.update(0);
    }
    
    destroy() {
        if (this.progressElement && this.progressElement.parentNode) {
            this.progressElement.parentNode.removeChild(this.progressElement);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const progressStyles = `
        .custom-progress-bar {
            width: 100%;
            margin: 1rem 0;
        }
        
        .progress-label {
            color: #f4e4c1;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        
        .progress-container {
            position: relative;
            width: 100%;
            height: 25px;
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid #8b4513;
        }
        
        .progress-track {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #4a4a4a;
        }
        
        .progress-fill {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: linear-gradient(90deg, #ff4500 0%, #ffd700 50%, #ffff00 100%);
            transition: width 0.5s ease-in-out;
            min-width: 0;
        }
        
        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #2c1810;
            font-size: 0.8rem;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
            z-index: 10;
        }
    `;
    
    if (!document.querySelector('#progress-bar-styles')) {
        const style = document.createElement('style');
        style.id = 'progress-bar-styles';
        style.textContent = progressStyles;
        document.head.appendChild(style);
    }
});

window.ProgressBar = ProgressBar;