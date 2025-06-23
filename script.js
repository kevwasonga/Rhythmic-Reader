// Rhythmic Reader - Main Application Script
class RhythmicReader {
    constructor() {
        this.currentLineIndex = 0;
        this.textLines = [];
        this.isPlaying = false;
        this.isPaused = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.voices = [];
        this.settings = this.loadSettings();
        this.readingStartTime = null;
        this.wordsRead = 0;
        
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        this.bindEvents();
        this.loadVoices();
        this.applySettings();
        this.showTutorialIfFirstTime();
        
        // Load voices when they become available
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    // Bind all event listeners
    bindEvents() {
        // Text input and file upload
        document.getElementById('textInput').addEventListener('input', () => this.validateInput());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('browseBtn').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('clearTextBtn').addEventListener('click', () => this.clearText());
        document.getElementById('startReadingBtn').addEventListener('click', () => this.startReading());

        // Drag and drop
        const uploadZone = document.getElementById('uploadZone');
        uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

        // Reading controls
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prevLineBtn').addEventListener('click', () => this.previousLine());
        document.getElementById('nextLineBtn').addEventListener('click', () => this.nextLine());
        document.getElementById('backToInputBtn').addEventListener('click', () => this.backToInput());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartReading());

        // Speed and voice controls
        document.getElementById('speedSlider').addEventListener('input', (e) => this.updateSpeed(e.target.value));
        document.getElementById('voiceSelect').addEventListener('change', (e) => this.updateVoice(e.target.value));

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettings());

        // Settings controls
        document.getElementById('fontSizeSlider').addEventListener('input', (e) => this.updateFontSize(e.target.value));
        document.getElementById('lineHeightSlider').addEventListener('input', (e) => this.updateLineHeight(e.target.value));
        document.getElementById('fontFamilySelect').addEventListener('change', (e) => this.updateFontFamily(e.target.value));
        document.getElementById('themeSelect').addEventListener('change', (e) => this.updateTheme(e.target.value));
        document.getElementById('highlightColorPicker').addEventListener('change', (e) => this.updateHighlightColor(e.target.value));

        // Tutorial
        document.getElementById('skipTutorialBtn').addEventListener('click', () => this.closeTutorial());
        document.getElementById('startTutorialBtn').addEventListener('click', () => this.closeTutorial());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Modal click outside to close
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') this.closeSettings();
        });
    }

    // Load available voices
    loadVoices() {
        this.voices = this.speechSynthesis.getVoices();
        const voiceSelect = document.getElementById('voiceSelect');
        
        if (this.voices.length > 0) {
            voiceSelect.innerHTML = '';
            this.voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.default) option.selected = true;
                voiceSelect.appendChild(option);
            });
            
            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    }

    // Validate text input
    validateInput() {
        const textInput = document.getElementById('textInput');
        const startBtn = document.getElementById('startReadingBtn');
        const hasText = textInput.value.trim().length > 0;
        startBtn.disabled = !hasText;
    }

    // Handle file upload
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('textInput').value = e.target.result;
                this.validateInput();
            };
            reader.readAsText(file);
        } else {
            alert('Please select a valid .txt file');
        }
    }

    // Drag and drop handlers
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('textInput').value = e.target.result;
                this.validateInput();
            };
            reader.readAsText(files[0]);
        } else {
            alert('Please drop a valid .txt file');
        }
    }

    // Clear text input
    clearText() {
        document.getElementById('textInput').value = '';
        this.validateInput();
    }

    // Start reading session
    startReading() {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;

        // Parse text into lines
        this.textLines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (this.textLines.length === 0) {
            alert('Please enter some text to read');
            return;
        }

        // Reset state
        this.currentLineIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.readingStartTime = Date.now();
        this.wordsRead = 0;

        // Switch to reading view
        document.getElementById('inputSection').style.display = 'none';
        document.getElementById('readingSection').style.display = 'block';

        // Render text lines
        this.renderTextLines();
        this.updateProgress();
        this.updatePlayPauseButton();
    }

    // Render text lines in the display
    renderTextLines() {
        const textDisplay = document.getElementById('textDisplay');
        textDisplay.innerHTML = '';

        this.textLines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'text-line';
            lineElement.textContent = line;
            lineElement.id = `line-${index}`;
            textDisplay.appendChild(lineElement);
        });
    }

    // Toggle play/pause
    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseReading();
        } else {
            this.resumeReading();
        }
    }

    // Resume or start reading
    resumeReading() {
        if (this.currentLineIndex >= this.textLines.length) {
            this.currentLineIndex = 0;
        }

        this.isPlaying = true;
        this.isPaused = false;
        this.updatePlayPauseButton();
        this.readCurrentLine();
    }

    // Pause reading
    pauseReading() {
        this.isPlaying = false;
        this.isPaused = true;
        this.speechSynthesis.cancel();
        this.updatePlayPauseButton();
    }

    // Read the current line
    readCurrentLine() {
        if (!this.isPlaying || this.currentLineIndex >= this.textLines.length) {
            this.finishReading();
            return;
        }

        const line = this.textLines[this.currentLineIndex];
        this.highlightCurrentLine();
        
        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(line);
        
        // Set voice
        const voiceIndex = document.getElementById('voiceSelect').value;
        if (voiceIndex && this.voices[voiceIndex]) {
            this.currentUtterance.voice = this.voices[voiceIndex];
        }

        // Set rate based on WPM
        const wpm = parseInt(document.getElementById('speedSlider').value);
        this.currentUtterance.rate = this.wpmToRate(wpm);

        // Event handlers
        this.currentUtterance.onend = () => {
            if (this.isPlaying) {
                this.markLineCompleted();
                this.currentLineIndex++;
                this.updateProgress();
                
                // Auto-scroll if enabled
                if (this.settings.autoScroll) {
                    this.scrollToCurrentLine();
                }
                
                // Continue to next line
                setTimeout(() => this.readCurrentLine(), 100);
            }
        };

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.pauseReading();
        };

        // Start speaking
        this.speechSynthesis.speak(this.currentUtterance);
        
        // Update word count for WPM calculation
        this.wordsRead += line.split(' ').length;
    }

    // Convert WPM to speech rate
    wpmToRate(wpm) {
        // Average speaking rate is about 150 WPM at rate 1.0
        return Math.max(0.1, Math.min(3.0, wpm / 150));
    }

    // Highlight current line
    highlightCurrentLine() {
        // Remove previous highlights
        document.querySelectorAll('.text-line').forEach(line => {
            line.classList.remove('current');
        });

        // Highlight current line
        const currentLine = document.getElementById(`line-${this.currentLineIndex}`);
        if (currentLine) {
            currentLine.classList.add('current');
        }
    }

    // Mark line as completed
    markLineCompleted() {
        const currentLine = document.getElementById(`line-${this.currentLineIndex}`);
        if (currentLine) {
            currentLine.classList.remove('current');
            currentLine.classList.add('completed');
        }
    }

    // Scroll to keep current line visible
    scrollToCurrentLine() {
        const currentLine = document.getElementById(`line-${this.currentLineIndex}`);
        if (currentLine) {
            currentLine.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // Update progress display
    updateProgress() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        const timeRemaining = document.getElementById('timeRemaining');

        const totalLines = this.textLines.length;
        const completedLines = this.currentLineIndex;
        const progressPercent = (completedLines / totalLines) * 100;

        progressText.textContent = `Line ${completedLines + 1} of ${totalLines}`;
        progressFill.style.width = `${progressPercent}%`;

        // Calculate estimated time remaining
        if (this.readingStartTime && completedLines > 0) {
            const elapsedTime = (Date.now() - this.readingStartTime) / 1000;
            const avgTimePerLine = elapsedTime / completedLines;
            const remainingLines = totalLines - completedLines;
            const estimatedTimeRemaining = avgTimePerLine * remainingLines;

            const minutes = Math.floor(estimatedTimeRemaining / 60);
            const seconds = Math.floor(estimatedTimeRemaining % 60);
            timeRemaining.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Update play/pause button
    updatePlayPauseButton() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
        playPauseBtn.setAttribute('aria-label', this.isPlaying ? 'Pause' : 'Play');
    }

    // Navigation methods
    previousLine() {
        if (this.currentLineIndex > 0) {
            this.speechSynthesis.cancel();
            this.currentLineIndex--;
            this.updateProgress();
            if (this.isPlaying) {
                this.readCurrentLine();
            } else {
                this.highlightCurrentLine();
            }
        }
    }

    nextLine() {
        if (this.currentLineIndex < this.textLines.length - 1) {
            this.speechSynthesis.cancel();
            this.currentLineIndex++;
            this.updateProgress();
            if (this.isPlaying) {
                this.readCurrentLine();
            } else {
                this.highlightCurrentLine();
            }
        }
    }

    // Finish reading session
    finishReading() {
        this.isPlaying = false;
        this.isPaused = false;
        this.speechSynthesis.cancel();
        this.updatePlayPauseButton();
        
        // Show completion message
        setTimeout(() => {
            alert('Reading completed! 🎉');
        }, 500);
    }

    // Restart reading
    restartReading() {
        this.speechSynthesis.cancel();
        this.currentLineIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.readingStartTime = Date.now();
        this.wordsRead = 0;
        
        // Reset line styles
        document.querySelectorAll('.text-line').forEach(line => {
            line.classList.remove('current', 'completed');
        });
        
        this.updateProgress();
        this.updatePlayPauseButton();
    }

    // Go back to input
    backToInput() {
        this.speechSynthesis.cancel();
        this.isPlaying = false;
        this.isPaused = false;
        
        document.getElementById('readingSection').style.display = 'none';
        document.getElementById('inputSection').style.display = 'block';
    }

    // Update reading speed
    updateSpeed(wpm) {
        document.getElementById('speedValue').textContent = wpm;
        
        // If currently speaking, update the rate
        if (this.isPlaying && this.currentUtterance) {
            // Note: Changing rate mid-utterance isn't supported by all browsers
            // We'll apply it to the next utterance
        }
    }

    // Update voice selection
    updateVoice(voiceIndex) {
        // Voice will be applied to next utterance
    }

    // Settings management
    loadSettings() {
        const defaultSettings = {
            fontSize: 16,
            fontFamily: 'system',
            lineHeight: 1.6,
            theme: 'light',
            highlightColor: '#fbbf24',
            autoScroll: true,
            showWpm: true,
            speed: 150,
            voice: 0
        };

        try {
            const saved = localStorage.getItem('rhythmicReaderSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('rhythmicReaderSettings', JSON.stringify(this.settings));
            this.closeSettings();
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings. Please try again.');
        }
    }

    applySettings() {
        // Apply font size
        document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`);
        document.getElementById('fontSizeSlider').value = this.settings.fontSize;
        document.getElementById('fontSizeValue').textContent = this.settings.fontSize;

        // Apply font family
        const textDisplay = document.getElementById('textDisplay');
        textDisplay.className = `text-display font-${this.settings.fontFamily}`;
        document.getElementById('fontFamilySelect').value = this.settings.fontFamily;

        // Apply line height
        document.documentElement.style.setProperty('--line-height-reading', this.settings.lineHeight);
        document.getElementById('lineHeightSlider').value = this.settings.lineHeight;
        document.getElementById('lineHeightValue').textContent = this.settings.lineHeight;

        // Apply theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('themeSelect').value = this.settings.theme;

        // Apply highlight color
        document.documentElement.style.setProperty('--highlight-color', this.settings.highlightColor);
        document.getElementById('highlightColorPicker').value = this.settings.highlightColor;

        // Apply other settings
        document.getElementById('autoScrollCheckbox').checked = this.settings.autoScroll;
        document.getElementById('showWpmCheckbox').checked = this.settings.showWpm;
        document.getElementById('speedSlider').value = this.settings.speed;
        document.getElementById('speedValue').textContent = this.settings.speed;
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            localStorage.removeItem('rhythmicReaderSettings');
            this.settings = this.loadSettings();
            this.applySettings();
            alert('Settings reset to defaults!');
        }
    }

    // Settings modal
    openSettings() {
        document.getElementById('settingsModal').style.display = 'flex';
        document.getElementById('settingsModal').classList.add('fade-in');
    }

    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    // Settings update methods
    updateFontSize(size) {
        this.settings.fontSize = parseInt(size);
        document.getElementById('fontSizeValue').textContent = size;
        document.documentElement.style.setProperty('--font-size-base', `${size}px`);
    }

    updateLineHeight(height) {
        this.settings.lineHeight = parseFloat(height);
        document.getElementById('lineHeightValue').textContent = height;
        document.documentElement.style.setProperty('--line-height-reading', height);
    }

    updateFontFamily(family) {
        this.settings.fontFamily = family;
        const textDisplay = document.getElementById('textDisplay');
        textDisplay.className = `text-display font-${family}`;
    }

    updateTheme(theme) {
        this.settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateHighlightColor(color) {
        this.settings.highlightColor = color;
        document.documentElement.style.setProperty('--highlight-color', color);
    }

    // Tutorial
    showTutorialIfFirstTime() {
        const hasSeenTutorial = localStorage.getItem('rhythmicReaderTutorialSeen');
        if (!hasSeenTutorial) {
            document.getElementById('tutorialOverlay').style.display = 'flex';
        }
    }

    closeTutorial() {
        document.getElementById('tutorialOverlay').style.display = 'none';
        localStorage.setItem('rhythmicReaderTutorialSeen', 'true');
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Only handle shortcuts when not typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
            return;
        }

        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (document.getElementById('readingSection').style.display !== 'none') {
                    this.togglePlayPause();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (document.getElementById('readingSection').style.display !== 'none') {
                    this.previousLine();
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (document.getElementById('readingSection').style.display !== 'none') {
                    this.nextLine();
                }
                break;
            case 'Escape':
                event.preventDefault();
                if (document.getElementById('settingsModal').style.display !== 'none') {
                    this.closeSettings();
                } else if (document.getElementById('tutorialOverlay').style.display !== 'none') {
                    this.closeTutorial();
                }
                break;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RhythmicReader();
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
