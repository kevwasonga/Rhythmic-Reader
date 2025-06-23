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
        this.testSpeechSynthesis();
        this.showTutorialIfFirstTime();

        // Load voices when they become available
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    // Test speech synthesis capability
    testSpeechSynthesis() {
        if (!('speechSynthesis' in window)) {
            alert('Speech synthesis is not supported in your browser. Please use Chrome, Firefox, Safari, or Edge.');
            return;
        }

        // Test with a short phrase
        setTimeout(() => {
            if (this.voices.length === 0) {
                console.warn('No voices available yet, retrying...');
                setTimeout(() => this.testSpeechSynthesis(), 1000);
            }
        }, 500);
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
        document.getElementById('testVoiceBtn').addEventListener('click', () => this.testVoice());

        // Settings and Help
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
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
        document.getElementById('autoScrollCheckbox').addEventListener('change', (e) => this.updateAutoScroll(e.target.checked));
        document.getElementById('showWpmCheckbox').addEventListener('change', (e) => this.updateShowWpm(e.target.checked));

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

            // Filter for English voices and prioritize quality ones
            const englishVoices = this.voices.filter(voice =>
                voice.lang.startsWith('en') || voice.lang === 'en-US' || voice.lang === 'en-GB'
            );

            const allVoices = englishVoices.length > 0 ? englishVoices : this.voices;

            allVoices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = this.voices.indexOf(voice); // Use original index
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.default || voice.name.includes('Google') || voice.name.includes('Microsoft')) {
                    option.selected = true;
                }
                voiceSelect.appendChild(option);
            });

            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
        } else {
            // Retry loading voices after a short delay
            setTimeout(() => this.loadVoices(), 100);
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
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Show loading indicator
        this.showLoadingIndicator(`Processing ${file.name}...`);

        try {
            let text = '';

            if (file.type === 'text/plain') {
                text = await this.readTextFile(file);
            } else if (file.type === 'application/pdf') {
                text = await this.readPdfFile(file);
            } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                this.hideLoadingIndicator();
                alert('Word documents are not yet supported. Please convert to PDF or plain text.');
                return;
            } else if (file.type === 'application/rtf' || file.name.endsWith('.rtf')) {
                text = await this.readRtfFile(file);
            } else {
                this.hideLoadingIndicator();
                alert('Unsupported file type. Please use .txt, .pdf, or .rtf files.');
                return;
            }

            if (text) {
                document.getElementById('textInput').value = text;
                this.validateInput();
                this.hideLoadingIndicator();
                alert(`Successfully loaded ${file.name}!`);
            } else {
                this.hideLoadingIndicator();
                alert('No text content found in the file.');
            }
        } catch (error) {
            console.error('Error reading file:', error);
            this.hideLoadingIndicator();
            alert('Error reading file. Please try again or use a different file.');
        }
    }

    // Show loading indicator
    showLoadingIndicator(message = 'Loading...') {
        const indicator = document.getElementById('loadingIndicator');
        const messageElement = indicator.querySelector('p');
        messageElement.textContent = message;
        indicator.style.display = 'flex';
    }

    // Hide loading indicator
    hideLoadingIndicator() {
        document.getElementById('loadingIndicator').style.display = 'none';
    }

    // Read plain text file
    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Read PDF file using PDF.js
    async readPdfFile(file) {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    }

    // Read RTF file (basic support)
    readRtfFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                let rtfContent = e.target.result;
                // Basic RTF to text conversion (removes RTF formatting)
                rtfContent = rtfContent.replace(/\\[a-z]+\d*\s?/g, ''); // Remove RTF commands
                rtfContent = rtfContent.replace(/[{}]/g, ''); // Remove braces
                rtfContent = rtfContent.replace(/\\\\/g, '\\'); // Fix escaped backslashes
                rtfContent = rtfContent.trim();
                resolve(rtfContent);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Drag and drop handlers
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }

    async handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            // Simulate file input change event
            const fileInput = document.getElementById('fileInput');
            fileInput.files = files;
            await this.handleFileUpload({ target: { files: files } });
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

        // Focus management for accessibility
        document.getElementById('playPauseBtn').focus();

        // Announce to screen readers
        this.announceToScreenReader(`Reading session started. ${this.textLines.length} lines loaded. Press space to begin reading.`);
    }

    // Render text lines in the display
    renderTextLines() {
        const textDisplay = document.getElementById('textDisplay');
        textDisplay.innerHTML = '';

        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();

        this.textLines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'text-line';
            lineElement.textContent = line;
            lineElement.id = `line-${index}`;
            lineElement.setAttribute('role', 'text');
            lineElement.setAttribute('aria-label', `Line ${index + 1}: ${line}`);
            fragment.appendChild(lineElement);
        });

        textDisplay.appendChild(fragment);

        // Announce total lines to screen reader
        this.announceToScreenReader(`Text loaded with ${this.textLines.length} lines ready for reading.`);
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
        if (voiceIndex !== '' && this.voices[voiceIndex]) {
            this.currentUtterance.voice = this.voices[voiceIndex];
        }

        // Set rate and other properties based on WPM
        const wpm = parseInt(document.getElementById('speedSlider').value);
        this.currentUtterance.rate = this.wpmToRate(wpm);
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 1.0;

        // Calculate timing based on WPM for visual progression
        const wordCount = line.split(' ').length;
        const expectedDuration = (wordCount / wpm) * 60 * 1000; // in milliseconds

        // Event handlers
        this.currentUtterance.onstart = () => {
            console.log('Started speaking:', line.substring(0, 50) + '...');
        };

        this.currentUtterance.onend = () => {
            if (this.isPlaying) {
                this.markLineCompleted();
                this.currentLineIndex++;
                this.updateProgress();

                // Auto-scroll if enabled
                if (this.settings.autoScroll) {
                    this.scrollToCurrentLine();
                }

                // Continue to next line with a small pause
                setTimeout(() => this.readCurrentLine(), 200);
            }
        };

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.handleSpeechError(event);
        };

        // Ensure speech synthesis is ready
        if (this.speechSynthesis.paused) {
            this.speechSynthesis.resume();
        }

        // Start speaking
        try {
            this.speechSynthesis.speak(this.currentUtterance);
            console.log('Speech synthesis started for line:', this.currentLineIndex);
        } catch (error) {
            console.error('Error starting speech synthesis:', error);
            alert('Unable to start speech synthesis. Please check your browser settings.');
            this.pauseReading();
        }

        // Update word count for WPM calculation
        this.wordsRead += line.split(' ').length;
    }

    // Convert WPM to speech rate
    wpmToRate(wpm) {
        // More accurate conversion: typical speech is 150-200 WPM at rate 1.0
        // Adjust the formula for better accuracy
        if (wpm <= 100) {
            return Math.max(0.1, wpm / 180);
        } else if (wpm <= 200) {
            return wpm / 160;
        } else {
            return Math.min(3.0, wpm / 140);
        }
    }

    // Highlight current line
    highlightCurrentLine() {
        // Remove previous highlights
        document.querySelectorAll('.text-line').forEach(line => {
            line.classList.remove('current');
            line.removeAttribute('aria-current');
        });

        // Highlight current line
        const currentLine = document.getElementById(`line-${this.currentLineIndex}`);
        if (currentLine) {
            currentLine.classList.add('current');
            currentLine.setAttribute('aria-current', 'true');

            // Announce to screen readers
            this.announceToScreenReader(`Reading line ${this.currentLineIndex + 1} of ${this.textLines.length}`);
        }
    }

    // Announce to screen readers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
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
        const textDisplay = document.getElementById('textDisplay');

        if (currentLine && textDisplay) {
            const displayRect = textDisplay.getBoundingClientRect();
            const lineRect = currentLine.getBoundingClientRect();

            // Check if line is outside the visible area
            const isAbove = lineRect.top < displayRect.top;
            const isBelow = lineRect.bottom > displayRect.bottom;

            if (isAbove || isBelow) {
                currentLine.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }
    }

    // Update progress display
    updateProgress() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        const timeRemaining = document.getElementById('timeRemaining');
        const liveWpmCounter = document.getElementById('liveWpmCounter');

        const totalLines = this.textLines.length;
        const completedLines = this.currentLineIndex;
        const progressPercent = (completedLines / totalLines) * 100;

        progressText.textContent = `Line ${completedLines + 1} of ${totalLines}`;
        progressFill.style.width = `${progressPercent}%`;

        // Calculate estimated time remaining and live WPM
        if (this.readingStartTime && completedLines > 0) {
            const elapsedTime = (Date.now() - this.readingStartTime) / 1000;
            const avgTimePerLine = elapsedTime / completedLines;
            const remainingLines = totalLines - completedLines;
            const estimatedTimeRemaining = avgTimePerLine * remainingLines;

            const minutes = Math.floor(estimatedTimeRemaining / 60);
            const seconds = Math.floor(estimatedTimeRemaining % 60);
            timeRemaining.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Calculate live WPM
            if (this.settings.showWpm && this.wordsRead > 0) {
                const liveWpm = Math.round((this.wordsRead / elapsedTime) * 60);
                liveWpmCounter.textContent = `Current: ${liveWpm} WPM`;
                liveWpmCounter.style.display = 'inline-block';
            } else {
                liveWpmCounter.style.display = 'none';
            }
        } else {
            liveWpmCounter.style.display = 'none';
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

        // Calculate session statistics
        const sessionStats = this.calculateSessionStats();

        // Show completion message with stats
        setTimeout(() => {
            const statsMessage = `Reading completed! 🎉\n\n` +
                `📊 Session Statistics:\n` +
                `• Total lines read: ${sessionStats.totalLines}\n` +
                `• Total words read: ${sessionStats.totalWords}\n` +
                `• Reading time: ${sessionStats.readingTime}\n` +
                `• Average WPM: ${sessionStats.averageWpm}\n` +
                `• Target WPM: ${sessionStats.targetWpm}`;

            alert(statsMessage);
        }, 500);
    }

    // Calculate session statistics
    calculateSessionStats() {
        const totalLines = this.textLines.length;
        const totalWords = this.wordsRead;
        const elapsedTime = this.readingStartTime ? (Date.now() - this.readingStartTime) / 1000 : 0;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = Math.floor(elapsedTime % 60);
        const readingTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const averageWpm = elapsedTime > 0 ? Math.round((totalWords / elapsedTime) * 60) : 0;
        const targetWpm = parseInt(document.getElementById('speedSlider').value);

        return {
            totalLines,
            totalWords,
            readingTime,
            averageWpm,
            targetWpm
        };
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

        // Focus management
        document.getElementById('textInput').focus();

        // Announce to screen readers
        this.announceToScreenReader('Returned to text input. You can modify your text or start a new reading session.');
    }

    // Update reading speed
    updateSpeed(wpm) {
        this.settings.speed = parseInt(wpm);
        document.getElementById('speedValue').textContent = wpm;
        this.autoSaveSettings();

        // If currently speaking, update the rate
        if (this.isPlaying && this.currentUtterance) {
            // Note: Changing rate mid-utterance isn't supported by all browsers
            // We'll apply it to the next utterance
        }
    }

    // Update voice selection
    updateVoice(voiceIndex) {
        this.settings.voice = parseInt(voiceIndex);
        this.autoSaveSettings();
        // Voice will be applied to next utterance
    }

    // Test voice functionality
    testVoice() {
        const voiceIndex = document.getElementById('voiceSelect').value;
        const wpm = parseInt(document.getElementById('speedSlider').value);

        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }

        const testText = "Hello! This is a test of the text-to-speech functionality. Your voice and speed settings are working correctly.";
        const utterance = new SpeechSynthesisUtterance(testText);

        if (voiceIndex !== '' && this.voices[voiceIndex]) {
            utterance.voice = this.voices[voiceIndex];
        }

        utterance.rate = this.wpmToRate(wpm);
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            console.log('Test speech started');
            document.getElementById('testVoiceBtn').textContent = '🔇 Stop Test';
        };

        utterance.onend = () => {
            console.log('Test speech ended');
            document.getElementById('testVoiceBtn').textContent = '🔊 Test Voice';
        };

        utterance.onerror = (event) => {
            console.error('Test speech error:', event);
            alert('Speech test failed. Please check your browser settings or try a different voice.');
            document.getElementById('testVoiceBtn').textContent = '🔊 Test Voice';
        };

        try {
            this.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error testing voice:', error);
            alert('Unable to test voice. Please check your browser settings.');
        }
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
        document.documentElement.style.setProperty('--font-size-lg', `${this.settings.fontSize + 2}px`);
        document.getElementById('fontSizeSlider').value = this.settings.fontSize;
        document.getElementById('fontSizeValue').textContent = this.settings.fontSize;

        // Apply font family
        const textDisplay = document.getElementById('textDisplay');
        const textInput = document.getElementById('textInput');
        textDisplay.className = `text-display font-${this.settings.fontFamily}`;
        textInput.className = `font-${this.settings.fontFamily}`;
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
        const highlightBg = this.hexToRgba(this.settings.highlightColor, 0.3);
        document.documentElement.style.setProperty('--highlight-bg', highlightBg);
        document.getElementById('highlightColorPicker').value = this.settings.highlightColor;

        // Apply other settings
        document.getElementById('autoScrollCheckbox').checked = this.settings.autoScroll;
        document.getElementById('showWpmCheckbox').checked = this.settings.showWpm;
        document.getElementById('speedSlider').value = this.settings.speed;
        document.getElementById('speedValue').textContent = this.settings.speed;

        // Apply voice setting if available
        if (this.voices.length > 0 && this.settings.voice < this.voices.length) {
            document.getElementById('voiceSelect').value = this.settings.voice;
        }
    }

    // Convert hex color to rgba
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
        document.documentElement.style.setProperty('--font-size-lg', `${parseInt(size) + 2}px`);
        this.autoSaveSettings();
    }

    updateLineHeight(height) {
        this.settings.lineHeight = parseFloat(height);
        document.getElementById('lineHeightValue').textContent = height;
        document.documentElement.style.setProperty('--line-height-reading', height);
        this.autoSaveSettings();
    }

    updateFontFamily(family) {
        this.settings.fontFamily = family;
        const textDisplay = document.getElementById('textDisplay');
        const textInput = document.getElementById('textInput');
        textDisplay.className = `text-display font-${family}`;
        textInput.className = `font-${family}`;
        this.autoSaveSettings();
    }

    updateTheme(theme) {
        this.settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.autoSaveSettings();
    }

    updateHighlightColor(color) {
        this.settings.highlightColor = color;
        document.documentElement.style.setProperty('--highlight-color', color);
        const highlightBg = this.hexToRgba(color, 0.3);
        document.documentElement.style.setProperty('--highlight-bg', highlightBg);
        this.autoSaveSettings();
    }

    updateAutoScroll(enabled) {
        this.settings.autoScroll = enabled;
        this.autoSaveSettings();
    }

    updateShowWpm(enabled) {
        this.settings.showWpm = enabled;
        const liveWpmCounter = document.getElementById('liveWpmCounter');
        if (!enabled) {
            liveWpmCounter.style.display = 'none';
        } else if (this.isPlaying) {
            this.updateProgress(); // Refresh to show/hide WPM
        }
        this.autoSaveSettings();
    }

    // Auto-save settings with debouncing
    autoSaveSettings() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem('rhythmicReaderSettings', JSON.stringify(this.settings));
                console.log('Settings auto-saved');
            } catch (error) {
                console.error('Error auto-saving settings:', error);
            }
        }, 500);
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

    // Show help/tutorial
    showHelp() {
        document.getElementById('tutorialOverlay').style.display = 'flex';
        document.getElementById('tutorialOverlay').classList.add('fade-in');
    }

    // Handle speech synthesis errors
    handleSpeechError(event) {
        console.error('Speech synthesis error details:', event);

        let errorMessage = 'Speech synthesis encountered an error. ';

        switch (event.error) {
            case 'network':
                errorMessage += 'Please check your internet connection and try again.';
                break;
            case 'synthesis-failed':
                errorMessage += 'Speech synthesis failed. Try selecting a different voice.';
                break;
            case 'synthesis-unavailable':
                errorMessage += 'Speech synthesis is not available. Please try refreshing the page.';
                break;
            case 'voice-unavailable':
                errorMessage += 'The selected voice is not available. Please choose a different voice.';
                break;
            case 'text-too-long':
                errorMessage += 'The text is too long for speech synthesis. Try breaking it into smaller sections.';
                break;
            case 'rate-not-supported':
                errorMessage += 'The selected reading speed is not supported. Try adjusting the speed.';
                break;
            default:
                errorMessage += 'Please try refreshing the page or selecting a different voice.';
        }

        this.pauseReading();
        this.announceToScreenReader('Speech synthesis error occurred. Reading paused.');

        // Show user-friendly error message
        setTimeout(() => {
            alert(errorMessage);
        }, 100);
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Only handle shortcuts when not typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
            return;
        }

        const readingActive = document.getElementById('readingSection').style.display !== 'none';

        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (readingActive) {
                    this.togglePlayPause();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (readingActive) {
                    this.previousLine();
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (readingActive) {
                    this.nextLine();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (readingActive) {
                    // Jump back 5 lines
                    this.jumpLines(-5);
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (readingActive) {
                    // Jump forward 5 lines
                    this.jumpLines(5);
                }
                break;
            case 'Home':
                event.preventDefault();
                if (readingActive) {
                    this.jumpToStart();
                }
                break;
            case 'End':
                event.preventDefault();
                if (readingActive) {
                    this.jumpToEnd();
                }
                break;
            case 'KeyR':
                event.preventDefault();
                if (readingActive && event.ctrlKey) {
                    this.restartReading();
                }
                break;
            case 'KeyS':
                event.preventDefault();
                if (event.ctrlKey) {
                    this.openSettings();
                }
                break;
            case 'Escape':
                event.preventDefault();
                if (document.getElementById('settingsModal').style.display !== 'none') {
                    this.closeSettings();
                } else if (document.getElementById('tutorialOverlay').style.display !== 'none') {
                    this.closeTutorial();
                } else if (readingActive) {
                    this.backToInput();
                }
                break;
        }
    }

    // Jump multiple lines
    jumpLines(count) {
        const newIndex = Math.max(0, Math.min(this.textLines.length - 1, this.currentLineIndex + count));
        if (newIndex !== this.currentLineIndex) {
            this.speechSynthesis.cancel();
            this.currentLineIndex = newIndex;
            this.updateProgress();
            if (this.isPlaying) {
                this.readCurrentLine();
            } else {
                this.highlightCurrentLine();
            }
            if (this.settings.autoScroll) {
                this.scrollToCurrentLine();
            }
        }
    }

    // Jump to start
    jumpToStart() {
        this.speechSynthesis.cancel();
        this.currentLineIndex = 0;
        this.updateProgress();
        if (this.isPlaying) {
            this.readCurrentLine();
        } else {
            this.highlightCurrentLine();
        }
        if (this.settings.autoScroll) {
            this.scrollToCurrentLine();
        }
    }

    // Jump to end
    jumpToEnd() {
        this.speechSynthesis.cancel();
        this.currentLineIndex = Math.max(0, this.textLines.length - 1);
        this.updateProgress();
        this.highlightCurrentLine();
        if (this.settings.autoScroll) {
            this.scrollToCurrentLine();
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
