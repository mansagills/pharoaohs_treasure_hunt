class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicTrack = null;
        this.isMuted = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        
        this.init();
    }
    
    init() {
        this.setupAudioContext();
        this.createSynthesizedSounds();
        this.setupControls();
        this.loadSettings();
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.audioContext = null;
        }
    }
    
    createSynthesizedSounds() {
        this.synthesizedSounds = {
            success: this.createSuccessSound.bind(this),
            error: this.createErrorSound.bind(this),
            click: this.createClickSound.bind(this),
            mystery: this.createMysterySound.bind(this),
            victory: this.createVictorySound.bind(this),
            ambient: this.createAmbientSound.bind(this),
            torch: this.createTorchSound.bind(this),
            scroll: this.createScrollSound.bind(this)
        };
    }
    
    setupControls() {
        const controlsHTML = `
            <div id="audio-controls" class="audio-controls">
                <button id="toggle-audio" class="audio-btn" title="Toggle Audio">
                    <span class="audio-icon">🔊</span>
                </button>
                <div class="volume-controls">
                    <div class="volume-control">
                        <label>Music</label>
                        <input type="range" id="music-volume" min="0" max="100" value="30">
                    </div>
                    <div class="volume-control">
                        <label>SFX</label>
                        <input type="range" id="sfx-volume" min="0" max="100" value="50">
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', controlsHTML);
        
        document.getElementById('toggle-audio').addEventListener('click', () => this.toggleMute());
        document.getElementById('music-volume').addEventListener('input', (e) => this.setMusicVolume(e.target.value / 100));
        document.getElementById('sfx-volume').addEventListener('input', (e) => this.setSfxVolume(e.target.value / 100));
    }
    
    createSuccessSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    createErrorSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    createClickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    createMysterySound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + 1);
        oscillator.frequency.linearRampToValueAtTime(220, this.audioContext.currentTime + 2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.linearRampToValueAtTime(2000, this.audioContext.currentTime + 1);
        filter.frequency.linearRampToValueAtTime(1000, this.audioContext.currentTime + 2);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);
    }
    
    createVictorySound() {
        if (!this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            
            const startTime = this.audioContext.currentTime + (index * 0.15);
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        });
    }
    
    createAmbientSound() {
        if (!this.audioContext || this.ambientPlaying) return;
        
        this.ambientPlaying = true;
        
        const createAmbientLayer = (freq, delay) => {
            setTimeout(() => {
                if (!this.ambientPlaying) return;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(freq * 1.1, this.audioContext.currentTime + 8);
                oscillator.frequency.linearRampToValueAtTime(freq, this.audioContext.currentTime + 16);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 2);
                gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 14);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 16);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 16);
                
                setTimeout(() => createAmbientLayer(freq, 0), 16000);
            }, delay);
        };
        
        createAmbientLayer(110, 0);    // A2
        createAmbientLayer(146.83, 4000); // D3
        createAmbientLayer(220, 8000);     // A3
    }
    
    createTorchSound() {
        if (!this.audioContext) return;
        
        const noise = this.audioContext.createScriptProcessor(4096, 1, 1);
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.onaudioprocess = (e) => {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < output.length; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.1;
            }
        };
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.05, this.audioContext.currentTime);
        
        setTimeout(() => {
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            setTimeout(() => noise.disconnect(), 100);
        }, 200);
    }
    
    createScrollSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    play(soundName) {
        if (this.isMuted || !this.audioContext) return;
        
        if (this.synthesizedSounds[soundName]) {
            this.synthesizedSounds[soundName]();
        }
    }
    
    playMusic(trackName) {
        if (this.isMuted) return;
        
        this.stopMusic();
        
        if (trackName === 'ambient') {
            this.createAmbientSound();
        }
    }
    
    stopMusic() {
        this.ambientPlaying = false;
        if (this.musicTrack) {
            this.musicTrack.pause();
            this.musicTrack = null;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        const icon = document.querySelector('.audio-icon');
        if (icon) {
            icon.textContent = this.isMuted ? '🔇' : '🔊';
        }
        
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioContext.currentTime);
        }
        
        if (this.isMuted) {
            this.stopMusic();
        } else {
            this.playMusic('ambient');
        }
        
        this.saveSettings();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    saveSettings() {
        const settings = {
            isMuted: this.isMuted,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume
        };
        
        localStorage.setItem('pharaoh-audio-settings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('pharaoh-audio-settings'));
            if (settings) {
                this.isMuted = settings.isMuted || false;
                this.musicVolume = settings.musicVolume || 0.3;
                this.sfxVolume = settings.sfxVolume || 0.5;
                
                const musicSlider = document.getElementById('music-volume');
                const sfxSlider = document.getElementById('sfx-volume');
                const audioIcon = document.querySelector('.audio-icon');
                
                if (musicSlider) musicSlider.value = this.musicVolume * 100;
                if (sfxSlider) sfxSlider.value = this.sfxVolume * 100;
                if (audioIcon) audioIcon.textContent = this.isMuted ? '🔇' : '🔊';
                
                if (this.masterGain) {
                    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioContext.currentTime);
                }
            }
        } catch (error) {
            console.warn('Failed to load audio settings:', error);
        }
    }
    
    enableAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const audioStyles = `
        .audio-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(44, 24, 16, 0.9);
            border: 2px solid #8b4513;
            border-radius: 10px;
            padding: 1rem;
            color: #f4e4c1;
            z-index: 900;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            min-width: 150px;
        }
        
        .audio-btn {
            background: linear-gradient(45deg, #8b4513 0%, #daa520 100%);
            border: 2px solid #ffd700;
            color: #f4e4c1;
            padding: 0.5rem;
            border-radius: 5px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.3s ease;
        }
        
        .audio-btn:hover {
            background: linear-gradient(45deg, #daa520 0%, #ffd700 100%);
            color: #2c1810;
        }
        
        .audio-icon {
            font-size: 1.2rem;
        }
        
        .volume-controls {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .volume-control {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .volume-control label {
            font-size: 0.8rem;
            min-width: 40px;
            color: #deb887;
        }
        
        .volume-control input[type="range"] {
            flex: 1;
            height: 20px;
            background: #4a4a4a;
            outline: none;
            border-radius: 10px;
            -webkit-appearance: none;
        }
        
        .volume-control input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 15px;
            height: 15px;
            background: #ffd700;
            cursor: pointer;
            border-radius: 50%;
        }
        
        .volume-control input[type="range"]::-moz-range-thumb {
            width: 15px;
            height: 15px;
            background: #ffd700;
            cursor: pointer;
            border-radius: 50%;
            border: none;
        }
        
        @media (max-width: 768px) {
            .audio-controls {
                bottom: 80px;
                right: 10px;
                min-width: 120px;
            }
        }
    `;
    
    if (!document.querySelector('#audio-styles')) {
        const style = document.createElement('style');
        style.id = 'audio-styles';
        style.textContent = audioStyles;
        document.head.appendChild(style);
    }
    
    window.audioManager = new AudioManager();
    
    document.addEventListener('click', () => {
        if (window.audioManager) {
            window.audioManager.enableAudio();
        }
    }, { once: true });
    
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .menu-btn, .chamber-door, .glyph-item, .meaning-item')) {
            if (window.audioManager) {
                window.audioManager.play('click');
            }
        }
    });
});

window.AudioManager = AudioManager;