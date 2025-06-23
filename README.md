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

### Usage
1. **Open the Application**: Load `index.html` in your web browser
2. **Add Text**: Either paste text or upload a .txt file
3. **Customize Settings**: Adjust reading speed, voice, and appearance (optional)
4. **Start Reading**: Click "Start Reading" and follow along with the highlighted text
5. **Control Playback**: Use the control buttons or keyboard shortcuts

### Keyboard Shortcuts
- **Space**: Play/Pause reading
- **Left Arrow**: Previous line
- **Right Arrow**: Next line
- **Escape**: Close modals/overlays

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS custom properties for theming
- **Vanilla JavaScript**: No external dependencies
- **Web Speech API**: Browser-native text-to-speech
- **PWA Technologies**: Service Worker for offline functionality

### Browser Compatibility
- ✅ Chrome 33+
- ✅ Firefox 49+
- ✅ Safari 7+
- ✅ Edge 14+

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

## 🌟 Future Enhancements

### Planned Features
- **Gradual Speed Training**: Automatic speed increase over time
- **Reading Statistics**: Detailed analytics and progress tracking
- **Export Functionality**: Save reading session summaries
- **BeeLine Integration**: Visual scanning assistance
- **Multiple File Formats**: Support for PDF, EPUB, and other formats

### Contributing
This is an open-source project. Contributions are welcome for:
- Bug fixes and improvements
- New accessibility features
- Additional language support
- Performance optimizations

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
