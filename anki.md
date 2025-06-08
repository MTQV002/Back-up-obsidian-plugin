# 🃏 Anki Integration - Advanced Edition

Hướng dẫn tích hợp Anki với LLM-Obsidian plugin cho người dùng nâng cao.

## 🚀 Cài Đặt Nhanh

### 1. Cài AnkiConnect
```bash
1. Mở Anki → Tools → Add-ons → Get Add-ons...
2. Nhập code: 2055492159
3. Restart Anki
```

### 2. Chạy TTS Service
```bash
cd "plugin-folder"
python tts-service.py
```

### 3. Test Kết Nối
```bash
# Trong Obsidian:
Command Palette → "Test Anki Connection"
```

## 🎯 Tạo Note Type (QUAN TRỌNG!)

### ⚡ Note Type Recommended: "English Vocabulary"

**Tạo note type mới:**
1. Anki → Tools → Manage Note Types
2. Add → Clone: Basic
3. Rename thành: **"English Vocabulary"**
4. Fields → Add các fields sau:

**Fields bắt buộc (theo đúng thứ tự):**
- `Term` - Từ vựng chính
- `Definition` - Định nghĩa tiếng Anh
- `Type` - Loại từ (noun, verb, adj...)
- `Examples` - Ví dụ câu
- `Vietnamese` - Nghĩa tiếng Việt
- `IPA` - Phiên âm quốc tế
- `Synonyms` - Từ đồng nghĩa
- `Antonyms` - Từ trái nghĩa
- `Audio_Term` - **Audio file (format: [sound:file.mp3])**
- `Source` - Nguồn (Obsidian note link)
- `ID` - ID duy nhất

### ✅ Note Types Hỗ Trợ Đầy Đủ:
- **"English Vocabulary"** - Note type được khuyến nghị với template tối ưu
- **"Advance"** - Note type hiện tại của bạn (đã có đầy đủ 11 fields)

### ❌ Note Types KHÔNG khuyến khích:
- **"Basic"** (chỉ có Front/Back - thiếu fields chuyên biệt)

### 🔄 Auto-mapping Logic:

```javascript
// Plugin sẽ tự động detect và map:
"English Vocabulary" → Term, Definition, Vietnamese, Audio_Term... (recommended)
"Advance" → Term, Definition, Vietnamese, Audio_Term... (your current setup)
"Basic" → Front, Back (basic support only)
```

## 📝 Templates - Modern Edition

### 🎨 Template cho "Advance User" - Glassmorphism Premium

**Front Template:**
```html
<div style="font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #3b82f6 50%, #1e40af 75%, #1e3a8a 100%); background-size: 400% 400%; animation: gradientShift 15s ease infinite; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: -8px; padding: 0;">

<style>
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
}

.glass-card {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

.glass-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.18);
    border-color: rgba(255,255,255,0.18);
}

.gradient-text {
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.btn-modern {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    padding: 14px 28px;
    border-radius: 16px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
    outline: none;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-modern:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.35);
}

.btn-modern:active {
    transform: translateY(0);
}

.input-modern {
    background: rgba(255,255,255,0.1);
    border: 2px solid rgba(255,255,255,0.15);
    border-radius: 16px;
    padding: 18px 24px;
    color: white;
    font-size: 20px;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    outline: none;
}

.input-modern:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    background: rgba(255,255,255,0.15);
}

.input-modern::placeholder {
    color: rgba(255,255,255,0.7);
}

.tag-modern {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 24px;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: 700;
    color: white;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.audio-indicator {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 16px;
    padding: 16px 20px;
    border: 1px solid rgba(16, 185, 129, 0.3);
    animation: pulse 2s infinite;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
}

.hint-card {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}
</style>

    <div class="glass-card" style="max-width: 720px; padding: 48px; text-align: center; animation: slideIn 0.8s ease-out;">
        
        <!-- Hidden Term for JavaScript -->
        <div id="hidden-term" style="display: none;">{{Term}}</div>
        
        <!-- Header -->
        <div style="margin-bottom: 40px;">
            <h2 class="gradient-text" style="font-size: 36px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -1.5px;">🧠 Advanced Challenge</h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 18px; margin: 0; font-weight: 500;">Master vocabulary through interactive discovery</p>
        </div>
        
        <!-- Content Container -->
        <div class="glass-card" style="padding: 36px; margin-bottom: 36px; text-align: left;">
            
            <!-- Type & Difficulty -->
            <div style="margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                <div>
                    <strong style="color: rgba(255,255,255,0.9); font-size: 16px; display: block; margin-bottom: 12px;">Part of Speech</strong>
                    <span class="tag-modern">{{Type}}</span>
                </div>
                <div style="text-align: right;">
                    <strong style="color: rgba(255,255,255,0.9); font-size: 16px; display: block; margin-bottom: 12px;">Challenge Level</strong>
                    <span class="tag-modern" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">★★★ Expert</span>
                </div>
            </div>
            
            <!-- IPA Pronunciation -->
            <div style="margin-bottom: 28px; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 16px; border-left: 4px solid #3b82f6;">
                <strong style="color: rgba(255,255,255,0.9); font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    🗣️ Pronunciation Guide
                </strong>
                <div style="margin-top: 12px; font-family: 'Times New Roman', serif; font-size: 28px; color: #e2e8f0; letter-spacing: 3px; font-weight: 500;">{{IPA}}</div>
                {{#Audio_Term}}
                <div class="audio-indicator" style="margin-top: 20px;">
                    <strong style="color: white; font-size: 18px;">🎵 Listen & Learn:</strong>
                    <div style="margin-top: 12px;">{{Audio_Term}}</div>
                </div>
                {{/Audio_Term}}
            </div>
            
            <!-- Definition Clue -->
            <div style="margin-bottom: 28px; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 16px; border-left: 4px solid #10b981;">
                <strong style="color: rgba(255,255,255,0.9); font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    💡 Meaning Clue
                </strong>
                <div style="margin-top: 16px; font-style: italic; color: #e2e8f0; line-height: 1.7; font-size: 20px;">{{Definition}}</div>
            </div>
            
            <!-- Smart Hint System -->
            <div class="hint-card" style="margin-bottom: 0;">
                <strong style="color: rgba(255,255,255,0.9); font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    🎯 Smart Hints
                </strong>
                <div style="margin-top: 16px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                    <div>
                        <span style="color: rgba(255,255,255,0.7); font-size: 16px;">First Letter:</span>
                        <span id="first-letter" style="font-weight: 800; color: #a78bfa; font-size: 42px; text-shadow: 0 4px 8px rgba(0,0,0,0.3); margin-left: 12px; font-family: 'SF Pro Display', system-ui;"></span>
                    </div>
                    <div style="margin-left: auto;">
                        <span style="color: rgba(255,255,255,0.7); font-size: 16px;">Length:</span>
                        <span id="letter-count" style="font-weight: 700; color: #fbbf24; font-size: 24px; margin-left: 8px;"></span>
                        <span style="color: rgba(255,255,255,0.6); margin-left: 4px; font-size: 16px;">letters</span>
                    </div>
                </div>
            </div>
            
        </div>
        
        <!-- Interactive Input -->
        <div style="margin-bottom: 28px;">
            <input type="text" id="word-guess" placeholder="Enter your answer..." class="input-modern" onkeyup="checkAnswer(this.value)" autocomplete="off" style="animation: glow 3s infinite;">
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 20px; margin-bottom: 28px; flex-wrap: wrap;">
            <button onclick="giveHint()" class="btn-modern" style="flex: 1; min-width: 200px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);">
                💡 More Hints
            </button>
            <button onclick="revealAnswer()" class="btn-modern" style="flex: 1; min-width: 200px;">
                🔍 Show Answer
            </button>
        </div>
        
        <!-- Dynamic Feedback -->
        <div id="feedback" style="min-height: 60px; font-size: 22px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; border-radius: 16px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"></div>

    </div>

</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedCard();
});

function initializeAdvancedCard() {
    try {
        const termElement = document.getElementById('hidden-term');
        const firstLetterElement = document.getElementById('first-letter');
        const letterCountElement = document.getElementById('letter-count');
        
        if (termElement && firstLetterElement && letterCountElement) {
            const term = termElement.textContent.trim();
            if (term && term.length > 0) {
                firstLetterElement.textContent = term[0].toUpperCase();
                letterCountElement.textContent = term.length;
            }
        }
        
        // Focus input for better UX
        const inputElement = document.getElementById('word-guess');
        if (inputElement) {
            setTimeout(() => inputElement.focus(), 500);
        }
    } catch(e) {
        console.log('Error initializing advanced card:', e);
    }
}

let hintLevel = 0;
let isCorrect = false;

function checkAnswer(guess) {
    try {
        if (isCorrect) return;
        
        const termElement = document.getElementById('hidden-term');
        const feedbackElement = document.getElementById('feedback');
        
        if (!termElement || !feedbackElement) return;
        
        const term = termElement.textContent.trim().toLowerCase();
        guess = guess.toLowerCase().trim();
        
        // Reset styles
        feedbackElement.style.background = '';
        feedbackElement.style.border = '';
        
        if (guess === term) {
            isCorrect = true;
            feedbackElement.innerHTML = "🎉 Outstanding! Perfect mastery!";
            feedbackElement.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
            feedbackElement.style.color = "white";
            feedbackElement.style.border = "1px solid rgba(16, 185, 129, 0.3)";
            celebrateSuccess();
        } else if (term.startsWith(guess) && guess.length > 0) {
            feedbackElement.innerHTML = "⚡ Excellent progress... continue!";
            feedbackElement.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
            feedbackElement.style.color = "white";
            feedbackElement.style.border = "1px solid rgba(245, 158, 11, 0.3)";
        } else if (guess.length > 0) {
            feedbackElement.innerHTML = "🤔 Not quite... think deeper";
            feedbackElement.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
            feedbackElement.style.color = "white";
            feedbackElement.style.border = "1px solid rgba(239, 68, 68, 0.3)";
        } else {
            feedbackElement.innerHTML = "";
        }
    } catch(e) {
        console.log('Error in checkAnswer:', e);
    }
}

function giveHint() {
    try {
        const termElement = document.getElementById('hidden-term');
        const guessInput = document.getElementById('word-guess');
        const feedbackElement = document.getElementById('feedback');
        
        if (!termElement || !guessInput || !feedbackElement) return;
        
        const term = termElement.textContent.trim();
        hintLevel++;
        
        let hint = "";
        let hintText = "";
        
        if (hintLevel === 1) {
            hint = term.substring(0, 2) + "•".repeat(Math.max(0, term.length - 2));
            hintText = `💡 Advanced Hint: ${hint}`;
        } else if (hintLevel === 2) {
            hint = term.substring(0, 3) + "•".repeat(Math.max(0, term.length - 3));
            hintText = `💡 Expert Hint: ${hint}`;
        } else if (hintLevel === 3) {
            hint = term.substring(0, Math.ceil(term.length * 0.6)) + "•".repeat(Math.floor(term.length * 0.4));
            hintText = `💡 Master Hint: ${hint}`;
        } else {
            hint = term.substring(0, term.length - 1) + "•";
            hintText = `💡 Final Hint: ${hint}`;
        }
        
        feedbackElement.innerHTML = hintText;
        feedbackElement.style.background = "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";
        feedbackElement.style.color = "white";
        feedbackElement.style.border = "1px solid rgba(139, 92, 246, 0.3)";
        
        // Add hint animation
        feedbackElement.style.animation = 'pulse 0.6s ease-in-out 2';
        setTimeout(() => {
            feedbackElement.style.animation = '';
        }, 1200);
        
    } catch(e) {
        console.log('Error in giveHint:', e);
    }
}

function revealAnswer() {
    try {
        const termElement = document.getElementById('hidden-term');
        const guessInput = document.getElementById('word-guess');
        const feedbackElement = document.getElementById('feedback');
        
        if (termElement && guessInput && feedbackElement) {
            const term = termElement.textContent.trim();
            guessInput.value = term;
            feedbackElement.innerHTML = `🔍 Revealed: <strong style="text-transform: uppercase; letter-spacing: 2px;">${term}</strong>`;
            feedbackElement.style.background = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
            feedbackElement.style.color = "white";
            feedbackElement.style.border = "1px solid rgba(59, 130, 246, 0.3)";
            isCorrect = true;
        }
    } catch(e) {
        console.log('Error in revealAnswer:', e);
    }
}

function celebrateSuccess() {
    // Enhanced celebration animation
    const feedback = document.getElementById('feedback');
    if (feedback) {
        feedback.style.animation = 'pulse 0.4s ease-in-out 4';
        
        // Create floating particles effect
        setTimeout(() => {
            feedback.innerHTML += "<div style='margin-top: 12px; font-size: 16px; opacity: 0.8;'>🌟 Ready for the next challenge! 🌟</div>";
        }, 1000);
    }
}

// Enhanced keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const guess = document.getElementById('word-guess').value;
        if (!isCorrect && guess.trim() === '') {
            giveHint();
        }
    } else if (e.key === 'Escape') {
        revealAnswer();
    }
});
</script>
```

**Back Template:**
```html
<div style="font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #3b82f6 50%, #1e40af 75%, #1e3a8a 100%); background-size: 400% 400%; animation: gradientShift 15s ease infinite; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: -8px; padding: 0;">

<style>
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes slideInFromLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInFromRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.glass-card {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

.glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.18);
    border-color: rgba(255,255,255,0.18);
}

.gradient-text {
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.info-card {
    background: rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px;
    margin-bottom: 24px;
    border-left: 4px solid;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.info-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.info-card:hover {
    background: rgba(255,255,255,0.1);
    transform: translateX(8px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.vietnamese-card { border-left-color: #fbbf24; }
.definition-card { border-left-color: #3b82f6; }
.examples-card { border-left-color: #10b981; }
.synonyms-card { border-left-color: #8b5cf6; }
.antonyms-card { border-left-color: #ef4444; }

.tag-premium {
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 24px;
    padding: 12px 24px;
    font-size: 18px;
    font-weight: 800;
    color: white;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    text-transform: uppercase;
    letter-spacing: 2px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    animation: float 3s ease-in-out infinite;
}

.audio-showcase {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 20px;
    padding: 24px;
    border: 2px solid rgba(16, 185, 129, 0.3);
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.25);
    transition: all 0.3s ease;
}

.audio-showcase:hover {
    transform: scale(1.02);
    box-shadow: 0 16px 40px rgba(16, 185, 129, 0.35);
}

.section-icon {
    font-size: 28px;
    margin-right: 16px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.content-text {
    color: #e2e8f0;
    line-height: 1.8;
    font-size: 18px;
    font-weight: 500;
}
</style>

    <div class="glass-card" style="max-width: 900px; padding: 48px; animation: fadeInUp 0.8s ease-out;">
        
        <!-- Mastery Header -->
        <div style="text-align: center; margin-bottom: 48px; animation: slideInFromLeft 1s ease-out;">
            <h1 class="gradient-text" style="font-size: 56px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -3px;">{{Term}}</h1>
            
            <!-- Enhanced IPA and Audio -->
            <div style="margin-bottom: 24px;">
                <div style="font-family: 'Times New Roman', serif; font-size: 32px; color: #e2e8f0; letter-spacing: 4px; margin-bottom: 20px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">{{IPA}}</div>
                {{#Audio_Term}}
                <div class="audio-showcase">
                    <strong style="color: white; font-size: 20px; display: flex; align-items: center; justify-content: center; gap: 12px;">
                        <span class="section-icon">🎵</span> Master Pronunciation
                    </strong>
                    <div style="margin-top: 16px; text-align: center;">{{Audio_Term}}</div>
                </div>
                {{/Audio_Term}}
            </div>
            
            <!-- Premium Type Badge -->
            <span class="tag-premium">{{Type}}</span>
        </div>

        <!-- Premium Divider -->
        <div style="height: 2px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); margin: 48px 0; position: relative;">
            <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.1); padding: 12px; border-radius: 50%; backdrop-filter: blur(10px);">
                <span style="font-size: 24px;">✨</span>
            </div>
        </div>

        <!-- Enhanced Content Grid -->
        <div style="display: grid; gap: 28px;">
            
            <!-- Vietnamese Translation -->
            <div class="info-card vietnamese-card" style="animation: slideInFromLeft 1.2s ease-out;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <span class="section-icon">🇻🇳</span>
                    <strong style="color: #fbbf24; font-size: 22px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: 700;">Vietnamese Translation</strong>
                </div>
                <div class="content-text" style="color: white; font-size: 22px; font-weight: 700;">{{Vietnamese}}</div>
            </div>
            
            <!-- Definition -->
            <div class="info-card definition-card" style="animation: slideInFromRight 1.4s ease-out;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span class="section-icon">📖</span>
                    <strong style="color: #3b82f6; font-size: 22px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: 700;">Comprehensive Definition</strong>
                </div>
                <div class="content-text">{{Definition}}</div>
            </div>
            
            <!-- Examples -->
            <div class="info-card examples-card" style="animation: slideInFromLeft 1.6s ease-out;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span class="section-icon">💎</span>
                    <strong style="color: #10b981; font-size: 22px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: 700;">Expert Usage Examples</strong>
                </div>
                <div class="content-text" style="font-style: italic;">{{Examples}}</div>
            </div>
            
            <!-- Enhanced Synonyms and Antonyms Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px; animation: slideInFromRight 1.8s ease-out;">
                
                {{#Synonyms}}
                <div class="info-card synonyms-card">
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                        <span class="section-icon">🟢</span>
                        <strong style="color: #8b5cf6; font-size: 20px; font-weight: 700;">Similar Words</strong>
                    </div>
                    <div style="color: white; font-size: 18px; font-weight: 600; line-height: 1.6;">{{Synonyms}}</div>
                </div>
                {{/Synonyms}}
                
                {{#Antonyms}}
                <div class="info-card antonyms-card">
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                        <span class="section-icon">🔴</span>
                        <strong style="color: #ef4444; font-size: 20px; font-weight: 700;">Opposite Words</strong>
                    </div>
                    <div style="color: white; font-size: 18px; font-weight: 600; line-height: 1.6;">{{Antonyms}}</div>
                </div>
                {{/Antonyms}}
                
            </div>
            
        </div>
        
        <!-- Premium Footer -->
        <div style="text-align: center; margin-top: 48px; padding-top: 32px; border-top: 2px solid rgba(255,255,255,0.1); position: relative;">
            <div style="position: absolute; left: 50%; top: 0; transform: translateX(-50%); background: rgba(255,255,255,0.1); padding: 8px 24px; border-radius: 16px; backdrop-filter: blur(10px); margin-top: -16px;">
                <span style="font-size: 20px;">🎓</span>
            </div>
            <div style="color: rgba(255,255,255,0.7); font-size: 16px; font-weight: 600; margin-top: 16px;">
                ✨ Enhanced by LLM Dictionary - Advanced Edition ✨
            </div>
            <div style="color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 8px;">
                Elevating vocabulary mastery through intelligent design
            </div>
        </div>

    </div>

</div>
```

### 🎯 Template cho "English Vocabulary" Note Type - Modern Clean

**Front Template:**
```html
<div style="font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif; text-align: center; padding: 40px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 20px; margin: 0 auto; max-width: 750px; box-shadow: 0 12px 40px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
    
    <!-- Background Pattern -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #3b82f6, transparent);"></div>
    
    <!-- Term Display -->
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 42px; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">{{Term}}</h2>
    </div>
    
    <!-- Type Badge -->
    <div style="margin-bottom: 28px;">
        <span style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 28px; border-radius: 24px; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25); display: inline-block;">{{Type}}</span>
    </div>
    
    <!-- IPA Section -->
    <div style="margin-bottom: 32px; padding: 28px; background: rgba(255,255,255,0.8); border-radius: 16px; border-left: 4px solid #3b82f6; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
        <div style="font-family: 'Times New Roman', serif; color: #475569; font-size: 24px; letter-spacing: 2px; margin-bottom: 16px; font-weight: 500;">{{IPA}}</div>
        {{#Audio_Term}}
        <div style="padding: 16px; background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%); border-radius: 12px; border: 2px solid #0ea5e9; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);">
            <strong style="color: #0c4a6e; font-size: 18px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                🔊 Audio Pronunciation
            </strong>
            <div style="margin-top: 12px; text-align: center;">{{Audio_Term}}</div>
        </div>
        {{/Audio_Term}}
    </div>
    
    <!-- Question Prompt -->
    <div style="font-style: italic; color: #64748b; font-size: 20px; font-weight: 600; padding: 20px; background: rgba(255,255,255,0.6); border-radius: 16px; border: 2px dashed #cbd5e1;">
        What does this word mean?
    </div>
    
</div>
```

**Back Template:**
```html
{{FrontSide}}

<div style="height: 3px; background: linear-gradient(90deg, transparent, #cbd5e1, transparent); margin: 40px 0; position: relative;">
    <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; padding: 8px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <span style="font-size: 20px;">📚</span>
    </div>
</div>

<div style="font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif; padding: 40px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 20px; margin: 0 auto; max-width: 750px; box-shadow: 0 12px 40px rgba(0,0,0,0.1);">
    
    <!-- Vietnamese Translation -->
    <div style="margin-bottom: 24px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 16px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15); transition: all 0.3s ease;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 24px; margin-right: 12px;">🇻🇳</span>
            <strong style="color: #92400e; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Vietnamese</strong>
        </div>
        <div style="color: #78350f; font-size: 20px; font-weight: 700;">{{Vietnamese}}</div>
    </div>
    
    <!-- Definition -->
    <div style="margin-bottom: 24px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; border-radius: 16px; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15); transition: all 0.3s ease;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <span style="font-size: 24px; margin-right: 12px;">📖</span>
            <strong style="color: #1e40af; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Definition</strong>
        </div>
        <div style="color: #1e3a8a; font-size: 18px; line-height: 1.7; font-weight: 500;">{{Definition}}</div>
    </div>
    
    <!-- Examples -->
    <div style="margin-bottom: 24px; padding: 24px; background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-left: 4px solid #8b5cf6; border-radius: 16px; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.15); transition: all 0.3s ease;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <span style="font-size: 24px; margin-right: 12px;">💡</span>
            <strong style="color: #6d28d9; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Examples</strong>
        </div>
        <div style="color: #581c87; font-size: 17px; line-height: 1.8; font-style: italic; font-weight: 500;">{{Examples}}</div>
    </div>
    
    <!-- Enhanced Synonyms and Antonyms Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        
        {{#Synonyms}}
        <div style="padding: 20px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-left: 4px solid #10b981; border-radius: 16px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15); transition: all 0.3s ease; hover: transform: translateY(-2px);">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 20px; margin-right: 8px;">🟢</span>
                <strong style="color: #047857; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Synonyms</strong>
            </div>
            <div style="color: #065f46; font-size: 16px; font-weight: 600; line-height: 1.5;">{{Synonyms}}</div>
        </div>
        {{/Synonyms}}
        
        {{#Antonyms}}
        <div style="padding: 20px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; border-radius: 16px; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15); transition: all 0.3s ease; hover: transform: translateY(-2px);">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 20px; margin-right: 8px;">🔴</span>
                <strong style="color: #b91c1c; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Antonyms</strong>
            </div>
            <div style="color: #991b1b; font-size: 16px; font-weight: 600; line-height: 1.5;">{{Antonyms}}</div>
        </div>
        {{/Antonyms}}
        
    </div>
    
</div>
```

## 📱 Enhanced Workflow (Đồng bộ 2024)

```mermaid
graph TD
    A[Đọc bài trong Obsidian] --> B[Select từ mới]
    B --> C[Ctrl+D - Dictionary Lookup]
    C --> D[AI phân tích từ + context]
    D --> E[⚠️ QUAN TRỌNG: Click '💾 Save Note' TRƯỚC]
    E --> F[Tạo audio files + vocabulary note]
    F --> G[Verify Audio/ folder có files]
    G --> H[Click '📚 Add to Anki']
    H --> I[Plugin auto-detect 'English Vocabulary' note type]
    I --> J[Auto-fill tất cả fields + audio format]
    J --> K[Verify [sound:filename.mp3] trong Audio_Term]
    K --> L[Create Card → Success!]
```

## 🔧 Advanced Troubleshooting (Cập nhật 2024)

### 🚨 Common Issues & Solutions

#### ❌ **Plugin mapping sai fields (FRONT/BACK thay vì Term/Definition)**
**Root Cause:** Plugin đang map với "Basic" note type
**Solution:**
1. **TẠO NOTE TYPE MỚI:**
   ```
   Anki → Tools → Manage Note Types → Add → Clone: Basic
   Rename: "English Vocabulary"
   ```

2. **ADD ĐÚNG FIELDS (theo thứ tự):**
   ```
   Term, Definition, Type, Examples, Vietnamese, 
   IPA, Synonyms, Antonyms, Audio_Term, Source, ID
   ```

3. **SET DEFAULT trong Plugin:**
   ```
   Obsidian → Settings → LLM Dictionary → Default Note Type: "English Vocabulary"
   ```

4. **VERIFY AUTO-DETECTION:**
   - Plugin sẽ ưu tiên "English Vocabulary" nếu có
   - Fallback: "Advance" → "Basic"

#### ❌ **Audio không hoạt động - COMPLETE SOLUTION**

**1. WORKFLOW VERIFICATION:**
```
❌ SAI: Select text → Add to Anki (bỏ qua Save Note)
✅ ĐÚNG: Select text → Save Note → Add to Anki
```

**2. TECHNICAL CHECKS:**
```bash
# Step 1: Verify TTS service
curl http://localhost:6789/health
# Expected: {"status": "running", "tts_available": true}

# Step 2: Check folder structure
Your-Vault/
├── Audio/           # Phải có folder này
│   ├── audio_ipa_*.mp3
│   └── audio_example_*.mp3
└── Vocabulary/      # Auto-created
    └── Dictionary - word.md
```

**3. DEBUG COMMANDS:**
```
Command Palette → "Debug Audio Files"
Command Palette → "Test Anki Connection"
Developer Console (Ctrl+Shift+I) → Check logs
```

**4. MANUAL AUDIO COPY (Last Resort):**
```bash
# Find Anki media folder:
# Windows: C:\Users\[user]\AppData\Roaming\Anki2\[profile]\collection.media
# macOS: ~/Library/Application Support/Anki2\[profile]\collection.media

# Copy audio files manually nếu auto-copy failed
```

#### ⚠️ **Error Messages & Quick Fixes**

| Error | Cause | Solution |
|-------|-------|----------|
| `Audio file not found anywhere` | Audio chưa được tạo | Click "Save Note" trước |
| `TTS Service not running` | Service offline | `python tts-service.py` |
| `Fields not found for note type` | Note type không có đủ fields | Tạo lại "English Vocabulary" |
| `[sound:xxx] not working in Anki` | File không trong media folder | Use "Debug Audio Files" |

### 🔬 Advanced Debug Tools

**1. Browser Developer Console:**
```javascript
// Check plugin state
console.log('LLM Dictionary Plugin Status');

// Check audio generation
console.log('Audio files generated:', lastGeneratedAudio);

// Check API connections
console.log('TTS available:', ttsServiceRunning);
```

**2. Network Tab Monitoring:**
```
DevTools → Network → Filter: localhost:6789
Watch for: /health, /synthesize, /anki/ endpoints
```

**3. File System Verification:**
```bash
# Check if audio files exist
ls -la "Your-Vault/Audio/"

# Check file sizes (should be > 1KB)
du -h "Your-Vault/Audio/"*.mp3
```

### 🎯 Success Indicators

**✅ EVERYTHING WORKING:**
- Dictionary lookup shows definitions + IPA + examples
- "Save Note" creates audio files trong folder Audio/
- "Add to Anki" auto-selects "English Vocabulary" note type
- All fields auto-filled chính xác
- Audio_Term field có format: `[sound:filename.mp3]`
- Anki card plays audio khi review
- Console không có error messages

**🎉 Performance Optimization:**
- TTS generation < 3 seconds per word
- Audio files < 500KB each
- Anki sync completed successfully
- No memory leaks trong browser

**🚀 Pro Tips:**
1. **Batch Processing:** Select multiple words, process từng từ một
2. **Quality Settings:** Use 'high' quality cho important words
3. **Backup Strategy:** Export Anki deck regularly
4. **Version Control:** Keep plugin updated với latest features

## 🌟 Conclusion

Plugin này đã được optimize cho advanced users với:
- ✨ Modern glassmorphism UI
- 🎯 Interactive learning templates  
- 🔊 High-quality audio integration
- 🧠 Smart fallback systems
- 🚀 Professional workflow automation

**Happy Learning! 🎓**
