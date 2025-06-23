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

        // Speed, volume and voice controls
        document.getElementById('speedSlider').addEventListener('input', (e) => this.updateSpeed(e.target.value));
        document.getElementById('volumeSlider').addEventListener('input', (e) => this.updateVolume(e.target.value));
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        document.getElementById('voiceSelect').addEventListener('change', (e) => this.updateVoice(e.target.value));
        document.getElementById('testVoiceBtn').addEventListener('click', () => this.testVoice());

        // Logo and Navigation
        document.getElementById('appLogo').addEventListener('click', () => this.goToHome());
        document.getElementById('appLogo').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.goToHome();
            }
        });

        // Settings and Help
        document.getElementById('themeToggleBtn').addEventListener('click', () => this.toggleTheme());
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
        document.getElementById('naturalSpeechCheckbox').addEventListener('change', (e) => this.updateNaturalSpeech(e.target.checked));
        document.getElementById('filterRoboticCheckbox').addEventListener('change', (e) => this.updateFilterRobotic(e.target.checked));

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

            // Filter and prioritize voices for better quality
            const prioritizedVoices = this.prioritizeVoices(this.voices);

            prioritizedVoices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = this.voices.indexOf(voice); // Use original index

                // Add quality indicators
                let qualityIndicator = '';
                if (this.isHighQualityVoice(voice)) {
                    qualityIndicator = ' ⭐';
                } else if (this.isNaturalVoice(voice)) {
                    qualityIndicator = ' 🎵';
                }

                option.textContent = `${voice.name} (${voice.lang})${qualityIndicator}`;

                // Auto-select the best voice
                if (index === 0) {
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

    // Prioritize voices for better quality and naturalness
    prioritizeVoices(voices) {
        // Filter for English voices first
        const englishVoices = voices.filter(voice =>
            voice.lang.startsWith('en') || voice.lang === 'en-US' || voice.lang === 'en-GB'
        );

        const voicesToSort = englishVoices.length > 0 ? englishVoices : voices;

        // Filter out robotic voices if setting is enabled
        let finalVoices = voicesToSort;
        if (this.settings.filterRobotic) {
            const naturalVoices = this.filterRoboticVoices(voicesToSort);
            // Use natural voices if available, otherwise fall back to all voices
            finalVoices = naturalVoices.length > 0 ? naturalVoices : voicesToSort;
        }

        // Sort voices by quality and naturalness
        return finalVoices.sort((a, b) => {
            const aScore = this.getVoiceQualityScore(a);
            const bScore = this.getVoiceQualityScore(b);
            return bScore - aScore; // Higher score first
        });
    }

    // Calculate voice quality score
    getVoiceQualityScore(voice) {
        let score = 0;
        const name = voice.name.toLowerCase();

        // High-quality voice indicators
        if (name.includes('neural') || name.includes('premium')) score += 100;
        if (name.includes('google')) score += 80;
        if (name.includes('microsoft')) score += 70;
        if (name.includes('apple')) score += 60;
        if (name.includes('enhanced') || name.includes('natural')) score += 50;

        // Prefer certain voice types
        if (name.includes('female') || name.includes('male')) score += 30;
        if (name.includes('us') || name.includes('american')) score += 20;
        if (name.includes('uk') || name.includes('british')) score += 15;

        // Bonus for local voices (usually higher quality)
        if (voice.localService) score += 40;

        // Default voice bonus
        if (voice.default) score += 10;

        return score;
    }

    // Check if voice is high quality
    isHighQualityVoice(voice) {
        const name = voice.name.toLowerCase();
        return name.includes('neural') ||
               name.includes('premium') ||
               name.includes('enhanced') ||
               (name.includes('google') && voice.localService);
    }

    // Check if voice sounds natural
    isNaturalVoice(voice) {
        const name = voice.name.toLowerCase();
        return name.includes('natural') ||
               name.includes('human') ||
               name.includes('realistic') ||
               (voice.localService && !name.includes('robotic'));
    }

    // Check if voice sounds robotic (to filter out)
    isRoboticVoice(voice) {
        const name = voice.name.toLowerCase();
        const roboticIndicators = [
            'robotic', 'robot', 'synthetic', 'basic', 'simple',
            'monotone', 'mechanical', 'artificial', 'computer',
            'default', 'system', 'generic', 'standard'
        ];

        return roboticIndicators.some(indicator => name.includes(indicator)) ||
               (!voice.localService && name.includes('microsoft')) || // Some MS voices are robotic
               name.includes('espeak') ||
               name.includes('festival');
    }

    // Filter out robotic voices from the list
    filterRoboticVoices(voices) {
        return voices.filter(voice => !this.isRoboticVoice(voice));
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
        this.currentUtterance.pitch = this.settings.naturalSpeech ? this.getOptimalPitch() : 1.0;
        this.currentUtterance.volume = this.getEffectiveVolume();

        // Add natural pauses and emphasis if enabled
        const processedText = this.settings.naturalSpeech ? this.addNaturalPauses(line) : line;
        this.currentUtterance.text = processedText;

        // Calculate timing based on WPM for visual progression
        const wordCount = line.split(' ').length;
        const expectedDuration = (wordCount / wpm) * 60 * 1000; // in milliseconds

        // Adjust speech parameters based on content if natural speech is enabled
        if (this.settings.naturalSpeech) {
            this.adjustSpeechForContent(this.currentUtterance, line);
        }

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

    // Get optimal pitch for more natural speech
    getOptimalPitch() {
        const voiceIndex = document.getElementById('voiceSelect').value;
        if (voiceIndex !== '' && this.voices[voiceIndex]) {
            const voice = this.voices[voiceIndex];

            // Adjust pitch based on voice characteristics
            if (voice.name.toLowerCase().includes('female')) {
                return 1.1; // Slightly higher pitch for female voices
            } else if (voice.name.toLowerCase().includes('male')) {
                return 0.9; // Slightly lower pitch for male voices
            }
        }
        return 1.0; // Default neutral pitch
    }

    // Add natural pauses and emphasis to text
    addNaturalPauses(text) {
        let processedText = text;

        // Add pauses after punctuation for more natural speech
        processedText = processedText.replace(/\./g, '. '); // Period pause
        processedText = processedText.replace(/,/g, ', '); // Comma pause
        processedText = processedText.replace(/;/g, '; '); // Semicolon pause
        processedText = processedText.replace(/:/g, ': '); // Colon pause
        processedText = processedText.replace(/\?/g, '? '); // Question pause
        processedText = processedText.replace(/!/g, '! '); // Exclamation pause

        // Add emphasis to certain words
        processedText = this.addEmphasis(processedText);

        // Clean up multiple spaces
        processedText = processedText.replace(/\s+/g, ' ').trim();

        return processedText;
    }

    // Add emphasis to important words
    addEmphasis(text) {
        // Words that should be emphasized (you can expand this list)
        const emphasisWords = [
            'important', 'crucial', 'essential', 'critical', 'vital',
            'remember', 'note', 'warning', 'attention', 'focus',
            'first', 'second', 'third', 'finally', 'conclusion',
            'however', 'therefore', 'moreover', 'furthermore',
            'amazing', 'incredible', 'fantastic', 'excellent'
        ];

        let processedText = text;

        emphasisWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            // Use SSML-like emphasis (though not all browsers support it)
            processedText = processedText.replace(regex, `<emphasis level="strong">${word}</emphasis>`);
        });

        return processedText;
    }

    // Add natural breathing pauses for longer texts
    addBreathingPauses(text) {
        const sentences = text.split(/[.!?]+/);
        if (sentences.length > 3) {
            // Add longer pauses every few sentences for breathing
            return sentences.map((sentence, index) => {
                if (index > 0 && index % 3 === 0) {
                    return '. ' + sentence; // Longer pause
                }
                return sentence;
            }).join('.');
        }
        return text;
    }

    // Adjust speech parameters based on content type
    adjustSpeechForContent(utterance, text) {
        const lowerText = text.toLowerCase();

        // Detect content type and adjust accordingly
        if (this.isQuestionSentence(text)) {
            // Questions should have rising intonation
            utterance.pitch = Math.min(2.0, utterance.pitch * 1.1);
        } else if (this.isExclamationSentence(text)) {
            // Exclamations should be more emphatic
            utterance.pitch = Math.min(2.0, utterance.pitch * 1.05);
            utterance.volume = Math.min(1.0, utterance.volume * 1.1);
        } else if (this.isListItem(text)) {
            // List items should have consistent pacing
            utterance.rate = Math.max(0.1, utterance.rate * 0.95);
        } else if (this.isHeading(text)) {
            // Headings should be more prominent
            utterance.pitch = Math.min(2.0, utterance.pitch * 1.08);
            utterance.rate = Math.max(0.1, utterance.rate * 0.9);
        } else if (this.isQuote(text)) {
            // Quotes should sound different
            utterance.pitch = Math.max(0.1, utterance.pitch * 0.95);
        }

        // Adjust for sentence length
        const wordCount = text.split(' ').length;
        if (wordCount > 20) {
            // Longer sentences should be slightly slower
            utterance.rate = Math.max(0.1, utterance.rate * 0.95);
        } else if (wordCount < 5) {
            // Short sentences can be slightly faster
            utterance.rate = Math.min(3.0, utterance.rate * 1.05);
        }
    }

    // Content type detection methods
    isQuestionSentence(text) {
        return text.trim().endsWith('?') ||
               text.toLowerCase().startsWith('what') ||
               text.toLowerCase().startsWith('how') ||
               text.toLowerCase().startsWith('why') ||
               text.toLowerCase().startsWith('when') ||
               text.toLowerCase().startsWith('where') ||
               text.toLowerCase().startsWith('who');
    }

    isExclamationSentence(text) {
        return text.trim().endsWith('!') ||
               text.toLowerCase().includes('wow') ||
               text.toLowerCase().includes('amazing') ||
               text.toLowerCase().includes('incredible');
    }

    isListItem(text) {
        return /^\s*[-•*]\s/.test(text) ||
               /^\s*\d+\.\s/.test(text) ||
               /^\s*[a-zA-Z]\.\s/.test(text);
    }

    isHeading(text) {
        return /^#{1,6}\s/.test(text) || // Markdown headings
               text === text.toUpperCase() || // All caps
               (text.length < 50 && !text.includes('.') && !text.includes(','));
    }

    isQuote(text) {
        return (text.startsWith('"') && text.endsWith('"')) ||
               (text.startsWith("'") && text.endsWith("'")) ||
               text.startsWith('> ');
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

    // Go to home page (logo click)
    goToHome() {
        // Stop any current reading
        this.speechSynthesis.cancel();
        this.isPlaying = false;
        this.isPaused = false;

        // Close any open modals
        document.getElementById('settingsModal').style.display = 'none';
        document.getElementById('tutorialOverlay').style.display = 'none';

        // Show input section, hide reading section
        document.getElementById('readingSection').style.display = 'none';
        document.getElementById('inputSection').style.display = 'block';

        // Focus on text input
        document.getElementById('textInput').focus();

        // Announce to screen readers
        this.announceToScreenReader('Returned to home page. Ready to start a new reading session.');

        // Add a subtle visual feedback
        const logo = document.getElementById('appLogo');
        logo.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logo.style.transform = '';
        }, 150);
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

    // Update volume
    updateVolume(volume) {
        this.settings.volume = parseInt(volume);
        this.settings.isMuted = volume == 0;
        document.getElementById('volumeValue').textContent = volume;
        this.updateMuteButton();
        this.autoSaveSettings();

        // If currently speaking, update the volume immediately
        if (this.isPlaying && this.currentUtterance) {
            this.currentUtterance.volume = this.getEffectiveVolume();
        }

        // Announce volume change
        this.announceToScreenReader(`Volume set to ${volume} percent`);
    }

    // Toggle mute/unmute
    toggleMute() {
        if (this.settings.isMuted) {
            // Unmute - restore previous volume or set to 50% if it was 0
            const restoreVolume = this.settings.volume > 0 ? this.settings.volume : 50;
            this.settings.isMuted = false;
            document.getElementById('volumeSlider').value = restoreVolume;
            this.updateVolume(restoreVolume);
            this.announceToScreenReader('Audio unmuted');
        } else {
            // Mute
            this.settings.isMuted = true;
            this.updateMuteButton();
            this.autoSaveSettings();

            // If currently speaking, mute immediately
            if (this.isPlaying && this.currentUtterance) {
                this.currentUtterance.volume = 0;
            }
            this.announceToScreenReader('Audio muted');
        }
    }

    // Update mute button appearance
    updateMuteButton() {
        const muteBtn = document.getElementById('muteBtn');
        if (this.settings.isMuted || this.settings.volume === 0) {
            muteBtn.textContent = '🔇';
            muteBtn.setAttribute('title', 'Unmute');
            muteBtn.setAttribute('aria-label', 'Unmute');
        } else if (this.settings.volume < 30) {
            muteBtn.textContent = '🔈';
            muteBtn.setAttribute('title', 'Mute');
            muteBtn.setAttribute('aria-label', 'Mute');
        } else if (this.settings.volume < 70) {
            muteBtn.textContent = '🔉';
            muteBtn.setAttribute('title', 'Mute');
            muteBtn.setAttribute('aria-label', 'Mute');
        } else {
            muteBtn.textContent = '🔊';
            muteBtn.setAttribute('title', 'Mute');
            muteBtn.setAttribute('aria-label', 'Mute');
        }
    }

    // Get effective volume (considering mute state)
    getEffectiveVolume() {
        return this.settings.isMuted ? 0 : this.settings.volume / 100;
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

        // More natural test text with varied content
        const testTexts = [
            "Hello! Welcome to Rhythmic Reader. This voice sounds great for reading, doesn't it?",
            "Testing, one, two, three! How does this voice sound to you? Perfect for your reading session!",
            "Greetings! This is your reading companion speaking. Ready to dive into some amazing content together?",
            "Hi there! I'm here to help you read more effectively. This voice will guide you through your text beautifully.",
            "Welcome! Let's test this wonderful voice. It's designed to make your reading experience smooth and enjoyable."
        ];

        const testText = testTexts[Math.floor(Math.random() * testTexts.length)];
        const processedText = this.addNaturalPauses(testText);
        const utterance = new SpeechSynthesisUtterance(processedText);

        if (voiceIndex !== '' && this.voices[voiceIndex]) {
            utterance.voice = this.voices[voiceIndex];
        }

        utterance.rate = this.wpmToRate(wpm);
        utterance.pitch = this.getOptimalPitch();
        utterance.volume = this.getEffectiveVolume();

        // Apply content-based adjustments
        this.adjustSpeechForContent(utterance, testText);

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
            naturalSpeech: true,
            filterRobotic: true,
            speed: 150,
            volume: 100,
            isMuted: false,
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
        if (this.settings.theme !== 'light') {
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
        document.getElementById('themeSelect').value = this.settings.theme;
        this.updateThemePreview(this.settings.theme);
        this.updateThemeToggleIcon(this.settings.theme);

        // Apply highlight color
        document.documentElement.style.setProperty('--highlight-color', this.settings.highlightColor);
        const highlightBg = this.hexToRgba(this.settings.highlightColor, 0.3);
        document.documentElement.style.setProperty('--highlight-bg', highlightBg);
        document.getElementById('highlightColorPicker').value = this.settings.highlightColor;

        // Apply other settings
        document.getElementById('autoScrollCheckbox').checked = this.settings.autoScroll;
        document.getElementById('showWpmCheckbox').checked = this.settings.showWpm;
        document.getElementById('naturalSpeechCheckbox').checked = this.settings.naturalSpeech;
        document.getElementById('filterRoboticCheckbox').checked = this.settings.filterRobotic;
        document.getElementById('speedSlider').value = this.settings.speed;
        document.getElementById('speedValue').textContent = this.settings.speed;
        document.getElementById('volumeSlider').value = this.settings.volume;
        document.getElementById('volumeValue').textContent = this.settings.volume;
        this.updateMuteButton();

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

        // Remove any existing theme attributes
        document.documentElement.removeAttribute('data-theme');

        // Force a reflow to ensure the removal takes effect
        document.documentElement.offsetHeight;

        // Apply the new theme
        if (theme !== 'light') {
            document.documentElement.setAttribute('data-theme', theme);
        }

        // Update highlight color based on theme if using default
        if (!this.settings.highlightColor || this.settings.highlightColor === '#fbbf24') {
            this.updateHighlightColorForTheme(theme);
        }

        // Update theme preview
        this.updateThemePreview(theme);

        this.autoSaveSettings();

        // Announce theme change to screen readers
        this.announceToScreenReader(`Theme changed to ${theme} mode`);
    }

    // Update theme preview
    updateThemePreview(theme) {
        const preview = document.getElementById('themePreview');
        if (!preview) return;

        // Remove existing theme classes
        preview.classList.remove('theme-light', 'theme-dark', 'theme-sepia');

        // Add current theme class
        preview.classList.add(`theme-${theme}`);

        // Update preview colors based on theme
        const previewBg = preview.querySelector('.preview-bg');
        const previewText = preview.querySelector('.preview-text');

        if (previewBg && previewText) {
            let bgColors, textColor;

            switch (theme) {
                case 'dark':
                    bgColors = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)';
                    textColor = '#f1f5f9';
                    break;
                case 'sepia':
                    bgColors = 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 50%, #e8dcc0 100%)';
                    textColor = '#5c4a37';
                    break;
                default: // light
                    bgColors = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)';
                    textColor = '#1e293b';
            }

            previewBg.style.background = bgColors;
            previewText.style.color = textColor;
        }
    }

    // Toggle between light and dark themes
    toggleTheme() {
        const currentTheme = this.settings.theme;
        let newTheme;

        // Cycle through themes: light -> dark -> sepia -> light
        switch (currentTheme) {
            case 'light':
                newTheme = 'dark';
                break;
            case 'dark':
                newTheme = 'sepia';
                break;
            case 'sepia':
                newTheme = 'light';
                break;
            default:
                newTheme = 'dark';
        }

        this.updateTheme(newTheme);
        this.updateThemeToggleIcon(newTheme);

        // Update the settings dropdown if it's open
        document.getElementById('themeSelect').value = newTheme;
    }

    // Update theme toggle button icon
    updateThemeToggleIcon(theme) {
        const toggleBtn = document.getElementById('themeToggleBtn');
        let icon, title;

        switch (theme) {
            case 'dark':
                icon = '☀️';
                title = 'Switch to Light Theme';
                break;
            case 'sepia':
                icon = '🌙';
                title = 'Switch to Dark Theme';
                break;
            default: // light
                icon = '🌙';
                title = 'Switch to Dark Theme';
        }

        toggleBtn.textContent = icon;
        toggleBtn.setAttribute('title', title);
        toggleBtn.setAttribute('aria-label', title);
    }

    // Update highlight color based on theme
    updateHighlightColorForTheme(theme) {
        let highlightColor;
        switch (theme) {
            case 'dark':
                highlightColor = '#fbbf24'; // Amber for dark theme
                break;
            case 'sepia':
                highlightColor = '#d97706'; // Orange for sepia theme
                break;
            default:
                highlightColor = '#fbbf24'; // Default amber
        }

        this.settings.highlightColor = highlightColor;
        document.documentElement.style.setProperty('--highlight-color', highlightColor);
        const highlightBg = this.hexToRgba(highlightColor, 0.3);
        document.documentElement.style.setProperty('--highlight-bg', highlightBg);

        // Update the color picker to reflect the change
        document.getElementById('highlightColorPicker').value = highlightColor;
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

    updateNaturalSpeech(enabled) {
        this.settings.naturalSpeech = enabled;
        this.autoSaveSettings();

        // Announce the change
        const message = enabled ?
            'Enhanced natural speech enabled. Speech will include natural pauses and emphasis.' :
            'Enhanced natural speech disabled. Speech will use basic settings.';
        this.announceToScreenReader(message);
    }

    updateFilterRobotic(enabled) {
        this.settings.filterRobotic = enabled;
        this.autoSaveSettings();

        // Reload voices with new filtering
        this.loadVoices();

        // Announce the change
        const message = enabled ?
            'Robotic voice filtering enabled. Only natural-sounding voices will be shown.' :
            'Robotic voice filtering disabled. All available voices will be shown.';
        this.announceToScreenReader(message);
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
