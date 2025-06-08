# 🎯 LLM Dictionary - Anki Integration Edition

**AI-powered multilingual dictionary** với tích hợp Anki và Local TTS không giới hạn cho Obsidian.

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/MTQV002/LLM-obsidian)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-purple.svg)](https://obsidian.md/)

## ✨ Tính Năng Chính

- **🧠 AI Dictionary**: Tra từ thông minh với Groq API (miễn phí)
- **🇻🇳 Dịch Tiếng Việt**: Tự động dịch sang tiếng Việt
- **🎙️ Local TTS**: Text-to-speech offline không giới hạn
- **🃏 Anki Integration**: Tự động tạo flashcard với audio
- **📁 Tự Động Sắp Xếp**: File được lưu vào thư mục Vocabulary/ và Audio/
- **⚡ Phím Tắt**:  để tra từ nhanh

## 🚀 Cài Đặt Nhanh (5 phút)

### Bước 1: Cài Plugin
```bash
# Tải plugin từ GitHub releases
# Giải nén vào thư mục:
.obsidian/plugins/llm-dictionary-anki/
├── main.js
├── manifest.json
├── styles.css
└── tts-service.py

# Bật plugin trong Obsidian settings
```

### Bước 2: Lấy Groq API Key (MIỄN PHÍ)
1. Truy cập: [console.groq.com](https://console.groq.com/)
2. Đăng ký bằng Google/GitHub  
3. Tạo API Key: `grok_xxxxxxxxxxxx`
4. Dán vào cài đặt plugin

### Bước 3: Cài TTS Service
```bash
# Cài thư viện Python
pip install pyttsx3 flask flask-cors

# Chạy TTS service
cd "path/to/plugin/folder"
python tts-service.py

# Dịch vụ khởi động tại: http://localhost:6789
```

### Bước 4: Cài Anki Integration
```bash
# Trong Anki Desktop:
1. Tools → Add-ons → Get Add-ons...
2. Nhập mã: 2055492159 (AnkiConnect)
3. Restart Anki

# Kiểm tra kết nối:
curl http://localhost:8765 -X POST -d '{"action": "version", "version": 6}'
```

## 📖 Cách Sử Dụng

### Tra Từ Cơ Bản
```
1. Chọn từ bất kỳ trong Obsidian: "serendipity"
2. Nhấn tổ hợp phím đã cài 
3. Dictionary view mở với:
   ✅ Định nghĩa + nghĩa tiếng Việt
   ✅ Phiên âm IPA + Audio
   ✅ 3 ví dụ có audio
   ✅ Từ đồng nghĩa/trái nghĩa
```

### Lưu Vào Note
```
💾 Save to Note → Tạo file markdown trong Vocabulary/
🎵 Audio files → Tự động lưu vào Audio/
🔗 Auto-embed → Audio tự động liên kết trong note
```

### Tạo Anki Card
```
📚 Add to Anki → Mở dialog tạo thẻ
🎛️ Auto-fill → Tự động điền fields
🎙️ Generate Audio → Tạo audio cho Anki
✅ Create Card → Xuất trực tiếp vào Anki
```

## 📁 Cấu Trúc Thư Mục

```bash
# Sau khi sử dụng plugin:
📁 Vocabulary/          # Tất cả note từ vựng
   ├── Dictionary - ameliorate.md
   ├── Dictionary - serendipity.md
   └── Dictionary - ephemeral.md

🎵 Audio/               # Tất cả file audio
   ├── audio_ipa_ameliorate_1234567890.mp3
   ├── audio_example_1_ameliorate_1234567890.mp3
   └── audio_example_2_ameliorate_1234567890.mp3
```
## 🃏 Anki Integration Chi Tiết

### Auto Field Mapping
```javascript
// Plugin tự động điền:
Term → Văn bản được chọn
Definition → AI sinh định nghĩa
Vietnamese → AI dịch tiếng Việt
IPA → API lấy phiên âm
Audio → TTS tạo file âm thanh
Examples → AI tạo ví dụ thực tế
Source → Link note Obsidian hiện tại
.....
```

### Quy Trình Xuất Anki
```
1. Chọn text → Ctrl+D (tra từ)
2. Click "📚 Add to Anki"
3. Chọn deck + note type
4. Review auto-filled fields
5. ✅ Generate audio nếu cần
6. Create Card → Xuất trực tiếp
```

## ⚙️ Cài Đặt Nâng Cao

### TTS Configuration
```javascript
// Trong plugin settings:
TTS Service URL: http://localhost:6789
Voice: en-us (English), vi-vn (Vietnamese)
Quality: high/medium/low
Auto-generate: ✅ Enable cho Anki cards
```

## 🔧 Khắc Phục Sự Cố

### Plugin Không Load
```bash
→ Restart Obsidian, tắt Safe Mode
→ Kiểm tra file main.js có đúng syntax
→ Xem Developer Console (Ctrl+Shift+I)
```

### API Errors
```bash
→ Kiểm tra Groq key: grok_xxxxxxxxxxxx
→ Test internet connection
→ Verify API quota chưa hết
```

### TTS Service Lỗi
```bash
→ Chạy: python tts-service.py
→ Kiểm tra: http://localhost:6789/health
→ Port 6789 có bị conflict không
```

## 📋 Workflow Học Tập

### Đọc Hiểu + Vocabulary Building
```bash
1. Đọc article → Gặp từ mới
2. Nhấn tổ hợp phím → Tra nghĩa + phát âm
3. 💾 Save to Note → Lưu vào Vocabulary/
4. 📚 Add to Anki → Tạo flashcard
5. Review trong Anki → Học với audio
```

### Batch Processing
```bash
1. Highlight nhiều từ trong 1 note
2. Sử dụng plugin để tra hàng loạt
3. Mass export sang Anki với audio
4. Organized learning sessions
```

## 🎓 Tips & Tricks

### Tối Ưu Hóa Learning
- **Context Lookup**: Chọn cả câu để AI hiểu ngữ cảnh tốt hơn
- **Audio Practice**: Dùng audio files để luyện phát âm
- **Spaced Repetition**: Kết hợp Anki để học dài hạn
- **Source Tracking**: Plugin tự động link về note gốc

### Customization
- **Voice Settings**: Thử các giọng khác nhau cho TTS
- **Quality Balance**: High quality cho important words, medium cho bulk
- **Deck Organization**: Tạo decks theo chủ đề/level
- **Template Modification**: Customize note templates theo nhu cầu

---

**🎯 Happy Learning với AI + Anki Integration!**

*Support: [GitHub Issues](https://github.com/MTQV002/LLM-obsidian/issues)*





