# 📖 Rhythmic Reader - Paced Reading Companion

A web-based application that helps users improve their reading speed and comprehension through paced audio narration and visual line highlighting. Perfect for slow readers, learners with dyslexia, or anyone looking to build stronger reading habits.

## ✨ Features

### 🎯 Core Functionality
- **Text-to-Speech Reading**: Uses browser's built-in Speech Synthesis API for natural-sounding narration
- **Line-by-Line Highlighting**: Visual synchronization with audio for better focus
- **Adjustable Reading Speed**: Control Words Per Minute (WPM) from 50-400
- **Playback Controls**: Play, pause, skip forward/backward by line
- **Voice Selection**: Choose from available system voices

### 🎨 Customization
- **Font Options**: System default, dyslexia-friendly (OpenDyslexic), serif, sans-serif
- **Font Size**: Adjustable from 12px to 32px
- **Line Height**: Customizable spacing for comfortable reading
- **Themes**: Light, dark, and sepia modes
- **Highlight Colors**: Customizable highlight colors
- **Auto-scroll**: Keeps current line centered in view

### 📱 Accessibility & Responsive Design
- **Progressive Web App (PWA)**: Works offline once loaded
- **Mobile-Friendly**: Responsive design for all devices
- **Keyboard Navigation**: Space (play/pause), arrow keys (navigation), Esc (close modals)
- **Screen Reader Compatible**: Proper ARIA labels and semantic HTML
- **High Contrast Support**: Adapts to system preferences

### 📊 Progress Tracking
- **Reading Progress**: Shows current line and percentage completed
- **Time Estimation**: Calculates remaining reading time
- **Live WPM Counter**: Optional real-time words per minute display
- **Session Management**: Restart or return to input easily

### 📄 Text Input Options
- **Direct Input**: Copy and paste text into the application
- **File Upload**: Support for .txt files
- **Drag & Drop**: Easy file handling with visual feedback

## 🚀 Getting Started

### Prerequisites
- Modern web browser with Speech Synthesis API support (Chrome, Firefox, Safari, Edge)
- No installation required - runs directly in the browser

### Quick Start
1. **Open the Application**: Load `index.html` in your web browser or visit the live demo
2. **Add Your Text**: Choose one of these methods:
   - Paste text directly into the text area
   - Upload a file (.txt, .pdf, .rtf)
   - Drag and drop a file onto the upload zone
3. **Test Your Audio**: Click "Test Voice" to ensure speech synthesis is working
4. **Start Reading**: Click "Start Reading" and follow the highlighted text
5. **Enjoy**: Use controls to pause, adjust speed, or navigate through your text

## 📖 Detailed Usage Instructions

### Adding Text Content

#### Method 1: Direct Text Input
- Click in the large text area on the main screen
- Paste your text using Ctrl+V (Cmd+V on Mac)
- The text will automatically be processed line by line

#### Method 2: File Upload
- Click "browse files" or use the file input button
- Select a supported file (.txt, .pdf, .rtf)
- The file content will be extracted and loaded automatically
- **Supported formats:**
  - **.txt**: Plain text files
  - **.pdf**: PDF documents (text will be extracted)
  - **.rtf**: Rich Text Format files

#### Method 3: Drag and Drop
- Drag any supported file from your computer
- Drop it onto the upload zone
- The file will be processed automatically

### Customizing Your Reading Experience

#### Voice Settings
1. **Select Voice**: Choose from available system voices in the dropdown
2. **Test Voice**: Click "🔊 Test Voice" to hear a sample
3. **Adjust Speed**: Use the speed slider (50-400 WPM)
   - 50-100 WPM: Slow, good for learning
   - 150-200 WPM: Average reading speed
   - 250-400 WPM: Fast reading for experienced users

#### Visual Customization (Settings Menu)
1. **Font Options**:
   - Size: 12px to 32px
   - Family: System, OpenDyslexic (dyslexia-friendly), Serif, Sans-serif
   - Line Height: Adjustable spacing between lines

2. **Themes**:
   - **Light**: Clean, bright interface
   - **Dark**: Easy on eyes for low-light reading
   - **Sepia**: Warm, paper-like appearance

3. **Highlight Color**: Customize the color that highlights the current line

4. **Reading Preferences**:
   - Auto-scroll: Keeps current line centered
   - Live WPM counter: Shows real-time reading speed

### Reading Controls

#### Playback Controls
- **▶️ Play/Pause**: Start or pause reading
- **⏮️ Previous Line**: Go back one line
- **⏭️ Next Line**: Skip forward one line

#### Advanced Navigation
- **🔄 Restart**: Start reading from the beginning
- **← Back to Input**: Return to text input screen

### Keyboard Shortcuts

#### Basic Controls
- **Space**: Play/Pause reading
- **← →**: Previous/Next line
- **↑ ↓**: Jump 5 lines backward/forward
- **Home/End**: Jump to start/end of text

#### Advanced Shortcuts
- **Ctrl+R**: Restart reading session
- **Ctrl+S**: Open settings menu
- **Escape**: Close modals or return to input

### Progress Tracking

#### Reading Metrics
- **Line Progress**: Shows current line and total lines
- **Time Remaining**: Estimated time based on current speed
- **Live WPM**: Real-time words per minute counter
- **Session Statistics**: Detailed stats shown at completion

#### Progress Bar
- Visual indicator of reading progress
- Click to see detailed statistics
- Updates in real-time during reading

### Accessibility Features

#### Screen Reader Support
- Full ARIA label support
- Automatic announcements for key events
- Semantic HTML structure
- Keyboard-only navigation support

#### Visual Accessibility
- High contrast mode support
- Dyslexia-friendly font options
- Customizable colors and themes
- Responsive design for all screen sizes

#### Motor Accessibility
- Large touch targets for mobile
- Keyboard shortcuts for all functions
- Voice control compatibility
- Reduced motion support

### Troubleshooting

#### Audio Issues
1. **No Sound**:
   - Check browser audio permissions
   - Try the "Test Voice" button
   - Ensure system volume is up
   - Try a different voice

2. **Voice Not Working**:
   - Refresh the page to reload voices
   - Try a different browser
   - Check if speech synthesis is supported

3. **Speed Issues**:
   - Adjust the speed slider
   - Some voices may not support all speeds
   - Try a different voice for better speed control

#### File Upload Issues
1. **PDF Not Loading**:
   - Ensure the PDF contains text (not just images)
   - Try a different PDF file
   - Check file size (very large files may take time)

2. **File Format Errors**:
   - Verify file extension is supported
   - Try converting to .txt format
   - Check file isn't corrupted

#### Performance Issues
1. **Slow Loading**:
   - Check internet connection for PDF.js library
   - Try smaller text files
   - Clear browser cache

2. **Memory Issues**:
   - Break large texts into smaller sections
   - Refresh page between sessions
   - Close other browser tabs

### Tips for Best Experience

#### Reading Optimization
- Start with slower speeds and gradually increase
- Use auto-scroll for hands-free reading
- Take breaks during long reading sessions
- Adjust font size for comfortable viewing

#### Learning Enhancement
- Use dyslexia-friendly fonts if needed
- Enable live WPM counter to track improvement
- Practice with familiar texts first
- Gradually increase reading speed over time

#### Accessibility Best Practices
- Use keyboard shortcuts for efficient navigation
- Enable screen reader if needed
- Adjust themes based on lighting conditions
- Customize highlight colors for better visibility

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS custom properties for theming
- **Vanilla JavaScript**: No external dependencies
- **Web Speech API**: Browser-native text-to-speech
- **PWA Technologies**: Service Worker for offline functionality

### Browser Compatibility

#### Fully Supported
- ✅ **Chrome 33+**: Full feature support, best performance
- ✅ **Firefox 49+**: Full feature support, good performance
- ✅ **Safari 7+**: Full feature support, may have voice limitations
- ✅ **Edge 14+**: Full feature support, good performance

#### Feature Support by Browser
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Voice Selection | ✅ | ✅ | ⚠️ Limited | ✅ |
| PDF Support | ✅ | ✅ | ✅ | ✅ |
| PWA Features | ✅ | ✅ | ✅ | ✅ |
| Keyboard Shortcuts | ✅ | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ |

#### Mobile Browser Support
- ✅ **Chrome Mobile**: Full support
- ✅ **Safari Mobile**: Full support, limited voices
- ✅ **Firefox Mobile**: Full support
- ⚠️ **Samsung Internet**: Basic support
- ❌ **Opera Mini**: Limited speech synthesis support

#### Notes
- Speech synthesis quality varies by operating system
- Voice availability depends on system-installed voices
- Some older browsers may have limited voice options
- PWA features require HTTPS in production

### File Structure
```
rhythmic-reader/
├── index.html          # Main application HTML
├── styles.css          # Comprehensive styling with themes
├── script.js           # Core application logic
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline functionality
└── README.md          # This file
```

## 🎯 Use Cases

### Educational
- **Reading Comprehension**: Helps students follow along with text
- **Language Learning**: Assists with pronunciation and pacing
- **Study Sessions**: Makes long reading sessions more manageable

### Accessibility
- **Dyslexia Support**: Dyslexia-friendly fonts and visual aids
- **Visual Impairments**: Screen reader compatibility
- **Attention Difficulties**: Focused, paced reading reduces distractions

### Personal Development
- **Speed Reading Training**: Gradually increase reading pace
- **Reading Habits**: Build consistent reading routines
- **Comprehension**: Better understanding through paced delivery

## 🔧 Customization

### Settings Persistence
All user preferences are saved locally in the browser:
- Font size and family
- Theme selection
- Reading speed
- Voice preferences
- Auto-scroll settings

### Theme Options
- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes for low-light reading
- **Sepia Theme**: Warm, paper-like appearance

## 🚀 Deployment

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/kevwasonga/Rhythmic-Reader.git
   cd Rhythmic-Reader
   ```

2. Start a local server:
   ```bash
   # Using Python
   python3 -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

### Production Deployment

#### Static Hosting (Recommended)
- **GitHub Pages**: Automatic deployment from repository
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **Firebase Hosting**: Google's hosting platform

#### Requirements for Production
- HTTPS required for PWA features
- All files must be served from the same domain
- PDF.js CDN should be accessible

#### Environment Setup
No build process required - deploy files directly:
```
rhythmic-reader/
├── index.html
├── styles.css
├── script.js
├── manifest.json
├── sw.js
└── README.md
```

## 🌟 Future Enhancements

### Planned Features
- **Gradual Speed Training**: Automatic speed increase over time
- **Advanced Analytics**: Detailed reading statistics and progress tracking
- **Export Functionality**: Save reading session summaries and progress reports
- **BeeLine Integration**: Visual scanning assistance with gradient overlays
- **Enhanced File Support**: EPUB, DOCX, and other document formats
- **Cloud Sync**: Save settings and progress across devices
- **Reading Goals**: Set and track daily/weekly reading targets
- **Text Preprocessing**: Automatic text cleaning and formatting
- **Voice Cloning**: Custom voice training for personalized experience

### Contributing
This is an open-source project. Contributions are welcome for:
- Bug fixes and improvements
- New accessibility features
- Additional language support
- Performance optimizations
- UI/UX enhancements
- Documentation improvements

#### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

#### Development Guidelines
- Follow existing code style
- Add comments for complex functionality
- Test on multiple browsers
- Ensure accessibility compliance
- Update documentation as needed

## 📄 License

This project is designed to be free and open for educational and personal use. No paid APIs or premium features - everything runs locally in your browser.

## 🙏 Acknowledgments

- **OpenDyslexic Font**: Free dyslexia-friendly typeface
- **Web Speech API**: Browser-native text-to-speech capabilities
- **Progressive Web App Standards**: For offline functionality

## 📞 Support

For issues, suggestions, or feedback:
1. Check the browser console for any error messages
2. Ensure your browser supports the Web Speech API
3. Try refreshing the page or clearing browser cache
4. Test with different voices if speech isn't working

---

**Rhythmic Reader** - Empowering readers through technology 📚✨
