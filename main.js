"use strict";

// Remove TypeScript __awaiter function
const { Plugin, Setting, PluginSettingTab, Notice, Modal, ItemView } = require('obsidian');

const DEFAULT_SETTINGS = {
    lang: "English",
    def: "Vietnamese", 
    llmkey: "",
    anki: false,
    ttsEnabled: true,
    audioSource: "local_tts",
    localTtsPort: 6789,
    localTtsHost: "localhost",
    ttsVoice: "en-us",
    audioQuality: "high",
    ttsServiceUrl: "http://localhost:6789",

    // Anki integration settings
    enableAnkiIntegration: true,
    defaultDeck: 'Default',
    defaultNoteType: 'Basic',
    autoGenerateAudio: true,
    ankiTags: ['obsidian', 'llm-dictionary']
};

// Anki Integration Class
class AnkiIntegration {
    constructor(ttsServiceUrl = 'http://localhost:6789') {
        this.ttsServiceUrl = ttsServiceUrl;
    }

    async testConnections() {
        const results = { tts: false, anki: false, error: null };
        try {
            // Test TTS service first
            const ttsResponse = await fetch(`${this.ttsServiceUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            results.tts = ttsResponse.ok;
            
            // Test Anki connection through TTS service
            const ankiResponse = await fetch(`${this.ttsServiceUrl}/anki/test`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (ankiResponse.ok) {
                const ankiData = await ankiResponse.json();
                results.anki = ankiData.success === true;
            }
            
        } catch (error) {
            results.error = error.message;
            console.error('Connection test failed:', error);
        }
        return results;
    }

    async getDecks() {
        try {
            const response = await fetch(`${this.ttsServiceUrl}/anki/decks`, {
                method: 'GET',
                timeout: 10000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                return data;
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                return ['Default']; // Fallback
            }
        } catch (error) {
            console.error('Failed to get decks:', error);
            new Notice(`❌ Cannot load decks: ${error.message}`);
            return ['Default']; // Fallback default deck
        }
    }

    async getNoteTypes() {
        try {
            const response = await fetch(`${this.ttsServiceUrl}/anki/note-types`, {
                method: 'GET',
                timeout: 10000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                return data;
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                return ['Basic']; // Fallback
            }
        } catch (error) {
            console.error('Failed to get note types:', error);
            new Notice(`❌ Cannot load note types: ${error.message}`);
            return ['Basic', 'English Vocabulary']; // Fallback note types
        }
    }

    async getFields(noteType) {
        try {
            const response = await fetch(`${this.ttsServiceUrl}/anki/fields/${encodeURIComponent(noteType)}`, {
                method: 'GET',
                timeout: 10000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                return data;
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                // Return default fields based on note type
                return this.getDefaultFields(noteType);
            }
        } catch (error) {
            console.error('Failed to get fields:', error);
            new Notice(`❌ Cannot load fields for ${noteType}: ${error.message}`);
            return this.getDefaultFields(noteType);
        }
    }
    
    getDefaultFields(noteType) {
        // Enhanced field mapping theo actual note type structure
        const lowerNoteType = noteType.toLowerCase();
        
        if (lowerNoteType.includes('english') && lowerNoteType.includes('vocabulary')) {
            // Exact match cho "English Vocabulary" note type
            return ['Term', 'Definition', 'Type', 'Examples', 'Vietnamese', 'IPA', 'Synonyms', 'Antonyms', 'Audio_Term', 'Source', 'ID'];
        } else if (lowerNoteType === 'advance') {
            // Note type "Advance" cũng có đầy đủ fields vocabulary
            return ['Term', 'Definition', 'Type', 'Examples', 'Vietnamese', 'IPA', 'Synonyms', 'Antonyms', 'Audio_Term', 'Source', 'ID'];
        } else if (lowerNoteType.includes('vocabulary') || lowerNoteType.includes('language')) {
            // Các note type vocabulary khác
            return ['Term', 'Definition', 'Vietnamese', 'Audio_Term', 'Examples'];
        } else {
            // Basic và các note type đơn giản khác
            return ['Front', 'Back'];
        }
    }

    async createNote(noteData) {
        try {
            const response = await fetch(`${this.ttsServiceUrl}/anki/add-note`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
            
            const result = await response.json();
            if (result.success) {
                new Notice(`✅ Anki note created successfully (ID: ${result.noteId})`);
                return result.noteId;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            new Notice(`❌ Failed to create Anki note: ${error.message}`);
            throw error;
        }
    }

    async updateNote(noteId, fields) {
        try {
            const response = await fetch(`${this.ttsServiceUrl}/anki/update-note`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId, fields })
            });
            
            const result = await response.json();
            if (result.success) {
                new Notice(`✅ Anki note updated successfully`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            new Notice(`❌ Failed to update Anki note: ${error.message}`);
            throw error;
        }
    }

    async deleteNote(noteIds) {
        try {
            const response = await fetch(`${this.ttsServiceUrl}/anki/delete-note`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteIds: Array.isArray(noteIds) ? noteIds : [noteIds] })
            });
            
            const result = await response.json();
            if (result.success) {
                new Notice(`✅ Anki note(s) deleted successfully`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            new Notice(`❌ Failed to delete Anki note: ${error.message}`);
            throw error;
        }
    }

    async openInAnki(noteId) {
        try {
            const response = await fetch(`${this.ttsServiceUrl}/anki/browse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId })
            });
            
            const result = await response.json();
            if (result.success) {
                new Notice(`📖 Opened in Anki browser`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            new Notice(`❌ Failed to open in Anki: ${error.message}`);
            throw error;
        }
    }
}

class LocalTTSService {
    constructor() {
        this.baseUrl = 'http://localhost:6789';
        this.isServiceRunning = false;
    }

    async checkServiceStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isServiceRunning = data.status === 'running';
                return this.isServiceRunning;
            }
            return false;
        } catch (error) {
            console.log('Local TTS service not running:', error.message);
            this.isServiceRunning = false;
            return false;
        }
    }

    async generateAudio(text, voice = 'en-us', quality = 'high') {
        try {
            console.log(`Generating local TTS audio for: ${text}`);
            
            const response = await fetch(`${this.baseUrl}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voice: voice,
                    quality: quality,
                    format: 'mp3'
                })
            });

            if (!response.ok) {
                throw new Error(`Local TTS failed: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            
            if (blob.size < 1000) {
                throw new Error(`Generated audio too small: ${blob.size} bytes`);
            }

            console.log(`Local TTS success: ${blob.size} bytes`);
            return blob;
        } catch (error) {
            console.error('Local TTS error:', error);
            throw error;
        }
    }

    async speak(text, voice = 'en-us') {
        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                speechSynthesis.speak(utterance);
                return;
            }
            
            // Fallback to local TTS
            const blob = await this.generateAudio(text, voice, 'medium');
            const audio = new Audio();
            audio.src = URL.createObjectURL(blob);
            await audio.play();
        } catch (error) {
            console.error('Speak error:', error);
            new Notice('Text-to-speech failed');
        }
    }
}

class IPAService {
    async getIPA(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            if (!response.ok) {
                throw new Error('Dictionary API failed');
            }
            
            const data = await response.json();
            if (data && data.length > 0 && data[0].phonetics && data[0].phonetics.length > 0) {
                const phoneticWithText = data[0].phonetics.find(p => p.text && p.text.trim());
                if (phoneticWithText && phoneticWithText.text) {
                    return phoneticWithText.text;
                }
            }
            
            return this.getSimpleIPA(word);
        } catch (error) {
            console.log('Failed to get IPA from API:', error);
            return this.getSimpleIPA(word);
        }
    }
    
    getSimpleIPA(word) {
        return `/${word}/`;
    }
}

class AIService {
    constructor(app) {
        this.app = app;
        this.ipaService = new IPAService();
    }
    async lookupWord(apiKey, term, context, targetLang) {
        console.log('AI Service lookupWord called with:', { term, context, targetLang });
        
        const payload = {
            messages: [
                {
                    role: "system",
                    content: `You are an English dictionary. Respond ONLY with valid JSON containing these fields: "Term", "Type", "Definition", "Vietnamese", "IPA", "Examples" (array), "Synonyms" (array), "Antonyms" (array). Use the EXACT term provided by user, do not lemmatize. Provide three examples using the EXACT term in bold. Do not include any explanations or text outside the JSON.`
                },
                {
                    role: "user",
                    content: `The definition and Type are in ${targetLang}. Vietnamese translation is required. Use the EXACT term "${term}" in all fields and examples.Term: ${term}Context: ${context}Please include:- Term: "${term}" (use exact term, do not change)- Definition in ${targetLang}- Vietnamese translation (always required)- Type (Part of speech)- Synonyms (array of similar words)- Antonyms (array of opposite words)- Examples with the EXACT term "${term}" in bold`
                }
            ],
            model: "llama3-70b-8192",
            temperature: 0,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        };
        try {
            console.log('Sending request to Groq API...');
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(payload)
            });
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
            const responseData = await response.json();
            console.log('API Response:', responseData);
            if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
                console.error('Invalid response structure:', responseData);
                throw new Error('Invalid API response structure');
            }
            const content = responseData.choices[0].message.content;
            console.log('Raw content from API:', content);
            // Parse JSON
            let jsonData;
            try {
                const cleanedContent = content.replace(/^```json|```$/g, '').trim();
                console.log('Cleaned content:', cleanedContent);
                jsonData = JSON.parse(cleanedContent);
            } catch (e) {
                console.error('First parsing attempt failed:', e);
                
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        console.log('Extracted JSON via regex:', jsonMatch[0]);
                        jsonData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No valid JSON found in response');
                    }
                } catch (e2) {
                    console.error('Second parsing attempt failed:', e2);
                    
                    // Fallback data
                    jsonData = {
                        Term: term,
                        Definition: "Could not parse definition",
                        Vietnamese: "Không thể phân tích nghĩa tiếng Việt",
                        Type: "unknown",
                        IPA: "",
                        Examples: [`Example with **${term}**`],
                        Synonyms: [],
                        Antonyms: []
                    };
                }
            }
            // Normalize data
            const normalizedData = {
                Term: term,
                Type: jsonData.Type || jsonData.Part_of_speech || 'unknown',
                Definition: jsonData.Definition || 'No definition available',
                Vietnamese: jsonData.Vietnamese || 'Không có nghĩa tiếng Việt',
                IPA: jsonData.IPA || '',
                Examples: Array.isArray(jsonData.Examples) ?                          jsonData.Examples.map(ex => ex.replace(/\*\*[^*]+\*\*/g, `**${term}**`)) :                          [`Example with **${term}**`],
                Synonyms: Array.isArray(jsonData.Synonyms) ? jsonData.Synonyms :                          (jsonData.Synonyms ? [jsonData.Synonyms] : []),
                Antonyms: Array.isArray(jsonData.Antonyms) ? jsonData.Antonyms :                          (jsonData.Antonyms ? [jsonData.Antonyms] : []),
                Source: `[[${this.app.workspace.getActiveFile()?.basename || 'Unknown'}]]`,
                ID: `${Date.now()}`
            };
            // Get IPA if missing
            if (!normalizedData.IPA || normalizedData.IPA.trim() === '') {
                console.log('IPA missing, fetching from external service...');
                try {
                    normalizedData.IPA = await this.ipaService.getIPA(normalizedData.Term);
                    console.log('IPA fetched:', normalizedData.IPA);
                } catch (ipaError) {
                    console.error('Failed to get IPA:', ipaError);
                }
            }
            console.log('Normalized data with IPA:', normalizedData);
            return normalizedData;
        } catch (error) {
            console.error('AI Service Error Details:', error);
            new Notice(`Failed to lookup word: ${error.message}`);
            return null;
        }
    }
}

const DICTIONARY_VIEW_TYPE = "llm-dictionary-view";

class DictionaryView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.localTtsService = new LocalTTSService();
        this.aiService = new AIService(this.app);
        this.isLookingUp = false;
        
        // Add property to track generated audio files
        this.lastGeneratedAudio = {
            term: null,
            ipa: null,
            examples: []
        };
    }

    getViewType() {
        return DICTIONARY_VIEW_TYPE;
    }

    getDisplayText() {
        return "LLM Dictionary - Anki";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h2", { text: "LLM Dictionary" });
        
        this.resultContainer = container.createDiv("dictionary-result");
        this.resultContainer.innerHTML = `            <div class="lookup-info">                <p>Select text and press <kbd>Ctrl+D</kbd> to look up words</p>            </div>        `;
    }

    async lookupWord(term, context = "") {
        if (this.isLookingUp) {
            new Notice("Already looking up a word...");
            return;
        }
        if (!term || term.trim().length === 0) {
            new Notice("No text selected");
            return;
        }
        this.isLookingUp = true;
        
        try {
            this.showLoading(term);
            
            const settings = this.plugin.settings;
            
            if (!settings.llmkey) {
                new Notice("Please set Groq API key in settings");
                this.showError("API key not configured");
                return;
            }
            const result = await this.aiService.lookupWord(
                settings.llmkey,
                term.trim(),
                context,
                settings.def
            );
            if (result) {
                // Lấy IPA nếu không có
                if (!result.IPA || result.IPA === "N/A") {
                    try {
                        result.IPA = await this.aiService.ipaService.getIPA(term);
                    } catch (e) {
                        console.log("Failed to get IPA:", e);
                        result.IPA = `/${term}/`;
                    }
                }
                // Hiển thị kết quả
                this.displayResult(result);
                
                // Tạo audio nếu có TTS
                if (settings.ttsEnabled) {
                    await this.generateAudio(result);
                }
            } else {
                this.showError("Failed to get dictionary result");
            }
        } catch (error) {
            console.error("Lookup error:", error);
            this.showError("Lookup failed: " + error.message);
            new Notice("Lookup failed: " + error.message);
        } finally {
            this.isLookingUp = false;
        }
    }

    // Khôi phục phương thức generateAudio
    async generateAudio(result) {
        try {
            const settings = this.plugin.settings;
            
            if (settings.audioSource === "local_tts") {
                // Kiểm tra Local TTS service
                const isRunning = await this.localTtsService.checkServiceStatus();
                if (isRunning) {
                    // Tạo audio cho từ chính
                    await this.localTtsService.generateAudio(result.Term, settings.ttsVoice, settings.audioQuality);
                    
                    // Tạo audio cho ví dụ (tùy chọn)
                    for (const example of result.Examples || []) {
                        // Loại bỏ Markdown formatting
                        const cleanExample = example.replace(/\*\*([^*]+)\*\*/g, '$1');
                        await this.localTtsService.generateAudio(cleanExample, settings.ttsVoice, settings.audioQuality);
                    }
                }
            }
        } catch (error) {
            console.log("Audio generation failed:", error);
        }
    }

    showLoading(term) {
        this.resultContainer.innerHTML = `            <div class="lookup-loading">                <div class="loading-spinner"></div>                <p>Looking up "<strong>${term}</strong>"...</p>            </div>        `;
    }

    showError(message) {
        this.resultContainer.innerHTML = `            <div class="lookup-error">                <p>❌ ${message}</p>            </div>        `;
    }

    displayResult(result) {
        const html = `
            <div class="dictionary-entry">
                <div class="word-header">
                    <h3 class="word-term">${result.Term}</h3>
                    <span class="word-type">${result.Type || ''}</span>
                </div>
                
                <div class="pronunciation">
                    <span class="ipa">${result.IPA}</span>
                    <button class="audio-btn" id="pronunciation-audio">🔊</button>
                </div>
                
                <div class="definitions">
                    <div class="definition-section">
                        <h4>Definition</h4>
                        <p>${result.Definition}</p>
                    </div>
                    
                    <div class="vietnamese-section">
                        <h4>Vietnamese</h4>
                        <p>${result.Vietnamese}</p>
                    </div>
                </div>
                
                <div class="examples">
                    <h4>Examples</h4>
                    <div class="example-list">
                        ${(result.Examples || []).map((example, index) => `
                            <div class="example-item">
                                <p>${example}</p>
                                <button class="audio-btn example-audio" data-index="${index}">🔊</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="synonyms-antonyms">
                    ${result.Synonyms && result.Synonyms.length > 0 ? `
                        <div class="synonyms">
                            <h4>Synonyms</h4>
                            <p>${result.Synonyms.join(', ')}</p>
                        </div>
                    ` : ''}
                    
                    ${result.Antonyms && result.Antonyms.length > 0 ? `
                        <div class="antonyms">
                            <h4>Antonyms</h4>
                            <p>${result.Antonyms.join(', ')}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="actions">
                    <button class="save-btn">💾 Save to Note</button>
                    <button class="anki-btn">📚 Add to Anki</button>
                </div>
            </div>
        `;
        
        this.resultContainer.innerHTML = html;
        
        this.bindAudioEvents(result);
        this.bindActionEvents(result);
    }

    bindAudioEvents(result) {
        const pronunciationBtn = this.resultContainer.querySelector('#pronunciation-audio');
        if (pronunciationBtn) {
            pronunciationBtn.addEventListener('click', () => {
                this.playAudio(result.Term, 'pronunciation');
            });
        }

        const exampleBtns = this.resultContainer.querySelectorAll('.example-audio');
        exampleBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const example = result.Examples[index];
                if (example) {
                    this.playAudio(example, 'example');
                }
            });
        });
    }

    bindActionEvents(result) {
        const saveBtn = this.resultContainer.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveToNote(result);
            });
        }

        const ankiBtn = this.resultContainer.querySelector('.anki-btn');
        if (ankiBtn) {
            ankiBtn.addEventListener('click', () => {
                // Enhanced audio file info passing
                const resultWithAudio = {...result};
                
                // If audio has been generated for this term through Save to Note
                if (this.lastGeneratedAudio.term === result.Term) {
                    resultWithAudio.audioFiles = {
                        ipa: this.lastGeneratedAudio.ipa,
                        examples: this.lastGeneratedAudio.examples
                    };
                    resultWithAudio.ankiFormat = this.lastGeneratedAudio.ankiFormat;
                    resultWithAudio.vaultPath = this.lastGeneratedAudio.vaultPath;
                    
                    console.log('Passing audio data to Anki modal:', resultWithAudio);
                    new Notice("Using previously generated audio files", 2000);
                } else {
                    new Notice("⚠️ No audio files found. Please click 'Save Note' first!", 4000);
                }
                
                // Pass the enriched dictionary data (with audio paths)
                new AnkiCardModal(this.app, this.plugin, resultWithAudio).open();
            });
        }
    }
    
    async playAudio(text, type) {
        try {
            const settings = this.plugin.settings;
            
            if (settings.audioSource === "local_tts") {
                const isRunning = await this.localTtsService.checkServiceStatus();
                if (isRunning) {
                    await this.localTtsService.speak(text, settings.ttsVoice);
                } else {
                    new Notice("Local TTS service not running");
                }
            } else {
                // Fallback to browser speech synthesis
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    speechSynthesis.speak(utterance);
                }
            }
        } catch (error) {
            console.error("Audio playback failed:", error);
            new Notice("Audio playback failed");
        }
    }

    // Helper method to ensure folder exists
    async ensureFolderExists(folderPath) {
        try {
            const folder = this.app.vault.getAbstractFileByPath(folderPath);
            if (!folder) {
                await this.app.vault.createFolder(folderPath);
                console.log(`Created folder: ${folderPath}`);
            }
        } catch (error) {
            console.log(`Folder ${folderPath} already exists or creation failed:`, error);
        }
    }

    // Helper method to create audio file and return filename
    async createAudioFile(text, type = 'pronunciation') {
        try {
            const settings = this.plugin.settings;
            let audioBlob = null;
            
            if (settings.audioSource === "local_tts") {
                const isRunning = await this.localTtsService.checkServiceStatus();
                if (isRunning) {
                    audioBlob = await this.localTtsService.generateAudio(text, settings.ttsVoice, settings.audioQuality);
                }
            }
            
            if (audioBlob) {
                // Ensure Audio folder exists
                await this.ensureFolderExists('Audio');
                
                // Create unique filename in Audio folder with sanitized name
                const timestamp = Date.now();
                const sanitizedText = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
                const filename = `audio_${type}_${sanitizedText}_${timestamp}.mp3`;
                const fullPath = `Audio/${filename}`;
                
                // Convert blob to array buffer
                const arrayBuffer = await audioBlob.arrayBuffer();
                
                // Save file to vault in Audio folder
                await this.app.vault.createBinary(fullPath, arrayBuffer);
                
                console.log(`Created audio file: ${fullPath}`);
                return { filename, fullPath };
            }
            
            return null;
        } catch (error) {
            console.error("Failed to create audio file:", error);
            return null;
        }
    }

    async saveToNote(result) {
        try {
            new Notice("Creating note with audio files...");
            
            // Ensure Vocabulary folder exists
            await this.ensureFolderExists('Vocabulary');
            
            // Generate audio files with proper filenames
            const ipaAudio = await this.createAudioFile(result.Term, 'ipa');
            const exampleAudioFiles = [];
            
            // Generate audio for examples if TTS is enabled
            if (this.plugin.settings.ttsEnabled && result.Examples && result.Examples.length > 0) {
                for (let i = 0; i < result.Examples.length; i++) {
                    const example = result.Examples[i];
                    // Remove markdown formatting for TTS
                    const cleanExample = example.replace(/\*\*([^*]+)\*\*/g, '$1');
                    const audioFile = await this.createAudioFile(cleanExample, `example_${i + 1}`);
                    exampleAudioFiles.push(audioFile);
                }
            }
            
            // Store the generated audio files for later Anki usage with full vault path
            this.lastGeneratedAudio = {
                term: result.Term,
                ipa: ipaAudio,
                examples: exampleAudioFiles,
                ankiFormat: ipaAudio ? `[sound:${ipaAudio.filename}]` : null,
                // Add vault path for better file location
                vaultPath: this.app.vault.adapter.basePath || this.app.vault.adapter.path
            };
            
            // Log for debugging
            console.log('Generated audio files:', this.lastGeneratedAudio);
            
            // Create note template with audio embeds
            const template = `# ${result.Term}

**Definition:** ${result.Definition}
**Vietnamese:** ${result.Vietnamese}
**IPA:** ${result.IPA} ${ipaAudio ? `🎙️ ![[${ipaAudio.fullPath}]]` : ''}
**Type:** ${result.Type}

## Synonyms
${(result.Synonyms || []).join(', ')}

## Antonyms  
${(result.Antonyms || []).join(', ')}

## Examples
${(result.Examples || []).map((ex, i) => {
    const audioFile = exampleAudioFiles[i];
    const audioEmbed = audioFile ? ` ![[${audioFile.fullPath}]]` : '';
    return `${i + 1}. ${ex}${audioEmbed}`;
}).join('\n')}

**Source:** LLM Dictionary  
**Date:** ${new Date().toISOString().split('T')[0]}
**Audio Files:** ${[ipaAudio, ...exampleAudioFiles].filter(f => f).length} files
**Audio Info:** ${JSON.stringify({
    ipa: ipaAudio ? ipaAudio.filename : null,
    examples: exampleAudioFiles.map(f => f ? f.filename : null).filter(f => f)
}, null, 2)}
`;

            // Save note in Vocabulary folder
            const fileName = `Vocabulary/Dictionary - ${result.Term}.md`;
            await this.app.vault.create(fileName, template);
            
            const audioCount = (ipaAudio ? 1 : 0) + exampleAudioFiles.filter(f => f).length;
            new Notice(`✅ Saved to ${fileName} with ${audioCount} audio files. Ready for Anki!`);
            
        } catch (error) {
            console.error("Save failed:", error);
            new Notice("Failed to save note: " + error.message);
        }
    }
}

// Anki Card Creation Modal
class AnkiCardModal extends Modal {
    constructor(app, plugin, dictionaryData) {
        super(app);
        this.plugin = plugin;
        
        // Accept either a simple string (just the term) or full dictionary data
        if (typeof dictionaryData === 'string') {
            this.dictionaryData = { Term: dictionaryData };
            this.selectedText = dictionaryData;
        } else {
            this.dictionaryData = dictionaryData || {};
            this.selectedText = dictionaryData.Term || '';
        }
        
        this.ankiIntegration = new AnkiIntegration(plugin.settings.ttsServiceUrl || 'http://localhost:6789');
        this.decks = [];
        this.noteTypes = [];
        this.fields = [];
        this.fieldMappings = {};
        this.connectionsOk = false;
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Create Anki Card' });

        // Show loading message
        const loadingEl = contentEl.createEl('div', { 
            text: 'Testing connections...', 
            cls: 'anki-loading' 
        });

        // Test connections first
        const connections = await this.ankiIntegration.testConnections();
        loadingEl.remove();
        
        if (!connections.tts) {
            contentEl.createEl('div', { 
                text: '❌ TTS Service not running. Please start: python tts-service.py',
                cls: 'anki-error'
            });
            
            const restartBtn = contentEl.createEl('button', { text: 'Retry Connection' });
            restartBtn.addEventListener('click', () => {
                this.close();
                new AnkiCardModal(this.app, this.plugin, this.dictionaryData).open();
            });
            return;
        }
        
        if (!connections.anki) {
            contentEl.createEl('div', { 
                text: '❌ Anki not connected. Make sure Anki is running with AnkiConnect addon.',
                cls: 'anki-error'
            });
            
            const troubleshootEl = contentEl.createEl('div', { cls: 'anki-troubleshoot' });
            troubleshootEl.createEl('p', { text: 'Troubleshooting steps:' });
            troubleshootEl.createEl('p', { text: '1. Open Anki desktop application' });
            troubleshootEl.createEl('p', { text: '2. Install AnkiConnect addon (code: 2055492159)' });
            troubleshootEl.createEl('p', { text: '3. Restart Anki' });
            
            const retryBtn = contentEl.createEl('button', { text: 'Retry Connection' });
            retryBtn.addEventListener('click', () => {
                this.close();
                new AnkiCardModal(this.app, this.plugin, this.dictionaryData).open();
            });
            return;
        }

        this.connectionsOk = true;
        new Notice('✅ Anki connection successful!');

        // Load data
        await this.loadAnkiData();
        
        // Create form
        await this.createForm();
    }

    async loadAnkiData() {
        try {
            // Load with timeout and better error handling
            const loadingPromises = [
                this.ankiIntegration.getDecks(),
                this.ankiIntegration.getNoteTypes()
            ];
            
            const [decks, noteTypes] = await Promise.all(loadingPromises);
            
            this.decks = decks && decks.length > 0 ? decks : ['Default'];
            this.noteTypes = noteTypes && noteTypes.length > 0 ? noteTypes : ['Basic', 'English Vocabulary'];
            
            console.log('Loaded Anki data:', { 
                decks: this.decks.length, 
                noteTypes: this.noteTypes.length 
            });
            
        } catch (error) {
            console.error('Failed to load Anki data:', error);
            // Use fallback values
            this.decks = ['Default'];
            this.noteTypes = ['Basic', 'English Vocabulary'];
        }
    }

    async createForm() {
        const { contentEl } = this;
        
        // Deck selection
        const deckContainer = contentEl.createDiv({ cls: 'anki-form-row' });
        deckContainer.createEl('label', { text: 'Deck:' });
        const deckSelect = deckContainer.createEl('select');
        this.decks.forEach(deck => {
            const option = deckSelect.createEl('option', { text: deck, value: deck });
            if (deck === this.plugin.settings.defaultDeck) option.selected = true;
        });

        // Note type selection với recommendation
        const noteTypeContainer = contentEl.createDiv({ cls: 'anki-form-row' });
        noteTypeContainer.createEl('label', { text: 'Note Type:' });
        
        // Add recommendation notice
        const recommendationEl = noteTypeContainer.createEl('div', { 
            cls: 'anki-recommendation',
            text: '💡 Recommended: Create "English Vocabulary" note type with proper fields for best experience'
        });
        
        const noteTypeSelect = noteTypeContainer.createEl('select');
        this.noteTypes.forEach(noteType => {
            const option = noteTypeSelect.createEl('option', { text: noteType, value: noteType });
            // Prefer English Vocabulary if available
            if (noteType.toLowerCase().includes('english') && noteType.toLowerCase().includes('vocabulary')) {
                option.selected = true;
            } else if (noteType === this.plugin.settings.defaultNoteType && !noteTypeSelect.value) {
                option.selected = true;
            }
        });

        // Field mapping container
        const fieldsContainer = contentEl.createDiv({ cls: 'anki-fields-container' });
        
        // Update fields when note type changes
        noteTypeSelect.addEventListener('change', async () => {
            await this.updateFields(noteTypeSelect.value, fieldsContainer);
        });

        // Initialize with selected note type
        if (this.noteTypes.length > 0) {
            const selectedNoteType = noteTypeSelect.value || this.noteTypes[0];
            await this.updateFields(selectedNoteType, fieldsContainer);
        }

        // Buttons
        const buttonContainer = contentEl.createDiv({ cls: 'anki-form-buttons' });
        
        const createBtn = buttonContainer.createEl('button', { text: 'Create Card', cls: 'mod-cta' });
        createBtn.addEventListener('click', async () => {
            await this.createAnkiCard(deckSelect.value, noteTypeSelect.value);
        });

        const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelBtn.addEventListener('click', () => this.close());
    }

    async updateFields(noteType, container) {
        container.empty();
        
        // Show loading
        const loadingEl = container.createEl('div', { 
            text: 'Loading fields...', 
            cls: 'anki-loading' 
        });
        
        try {
            this.fields = await this.ankiIntegration.getFields(noteType);
            this.fieldMappings = {};
            
            loadingEl.remove();
            
            if (!this.fields || this.fields.length === 0) {
                container.createEl('div', { 
                    text: `❌ No fields found for note type "${noteType}". Please check if note type exists in Anki.`, 
                    cls: 'anki-error' 
                });
                return;
            }
            
            console.log(`Loading ${this.fields.length} fields for ${noteType}:`, this.fields);
            
            this.fields.forEach(field => {
                const fieldContainer = container.createDiv({ cls: 'anki-field-row' });
                fieldContainer.createEl('label', { text: `${field}:` });
                
                const input = fieldContainer.createEl('textarea');
                input.placeholder = `Enter ${field}...`;
                
                // Intelligent field mapping
                this.autoFillField(field, input);
                
                // Add audio checkbox for Audio_Term field specifically
                if (field === 'Audio_Term' || field.toLowerCase().includes('audio')) {
                    const audioContainer = fieldContainer.createDiv({ cls: 'audio-checkbox-container' });
                    const audioCheckbox = audioContainer.createEl('input', { type: 'checkbox' });
                    
                    // Check if we already have audio from Save to Note
                    const hasExistingAudio = this.dictionaryData.ankiFormat || 
                                           (this.dictionaryData.audioFiles && this.dictionaryData.audioFiles.ipa);
                    
                    audioCheckbox.checked = hasExistingAudio || this.plugin.settings.autoGenerateAudio !== false;
                    
                    if (hasExistingAudio) {
                        audioContainer.createEl('span', { 
                            text: ' ✅ Using saved audio',
                            cls: 'using-saved-audio' 
                        });
                    } else {
                        audioContainer.createEl('span', { text: ' Generate audio' });
                    }
                    
                    this.fieldMappings[field] = { 
                        input, 
                        audioCheckbox,
                        useExistingAudio: hasExistingAudio 
                    };
                } else {
                    this.fieldMappings[field] = { input };
                }
            });
            
        } catch (error) {
            loadingEl.remove();
            console.error('Error loading fields:', error);
            container.createEl('div', { 
                text: `❌ Failed to load fields: ${error.message}. Using default fields.`, 
                cls: 'anki-error' 
            });
            
            // Use default fields
            this.fields = this.ankiIntegration.getDefaultFields(noteType);
            this.createDefaultFieldInputs(container);
        }
    }
    
    createDefaultFieldInputs(container) {
        this.fieldMappings = {};
        
        this.fields.forEach(field => {
            const fieldContainer = container.createDiv({ cls: 'anki-field-row' });
            fieldContainer.createEl('label', { text: `${field}:` });
            
            const input = fieldContainer.createEl('textarea');
            input.placeholder = `Enter ${field}...`;
            
            this.autoFillField(field, input);
            this.fieldMappings[field] = { input };
        });
    }

    autoFillField(fieldName, input) {
        const data = this.dictionaryData;
        const upperFieldName = fieldName.toUpperCase();
        
        // Enhanced field mapping - case sensitive và exact match
        switch (upperFieldName) {
            // English Vocabulary note type fields
            case 'TERM':
                input.value = data.Term || this.selectedText || '';
                break;
            case 'DEFINITION':
                input.value = data.Definition || '';
                break;
            case 'VIETNAMESE':
                input.value = data.Vietnamese || '';
                break;
            case 'IPA':
                input.value = data.IPA || '';
                break;
            case 'TYPE':
                input.value = data.Type || '';
                break;
            case 'EXAMPLES':
                if (Array.isArray(data.Examples) && data.Examples.length > 0) {
                    input.value = data.Examples.map(ex => `• ${ex}`).join('\n');
                } else {
                    input.value = data.Examples || '';
                }
                break;
            case 'SYNONYMS':
                input.value = Array.isArray(data.Synonyms) ? data.Synonyms.join(', ') : (data.Synonyms || '');
                break;
            case 'ANTONYMS':
                input.value = Array.isArray(data.Antonyms) ? data.Antonyms.join(', ') : (data.Antonyms || '');
                break;
            case 'AUDIO_TERM':
                // CRITICAL: Audio field theo readme(anki).md format
                if (data.ankiFormat) {
                    input.value = data.ankiFormat;
                    console.log(`Auto-filled Audio_Term with saved format: ${data.ankiFormat}`);
                } else if (data.audioFiles && data.audioFiles.ipa && data.audioFiles.ipa.filename) {
                    const filename = data.audioFiles.ipa.filename;
                    input.value = `[sound:${filename}]`;
                    console.log(`Auto-filled Audio_Term with: [sound:${filename}]`);
                } else {
                    input.value = ''; // Will be filled when audio is generated
                    console.log('Audio_Term field left empty - will be filled with generated audio');
                }
                break;
            case 'SOURCE':
                input.value = data.Source || '';
                break;
            case 'ID':
                input.value = data.ID || `${Date.now()}`;
                break;
                
            // Basic note type fields (Front/Back)
            case 'FRONT':
                input.value = data.Term || this.selectedText || '';
                break;
            case 'BACK':
                // For Front/Back note type, put definition + Vietnamese in back
                let backContent = data.Definition || '';
                if (data.Vietnamese) {
                    backContent += (backContent ? '\n\n' : '') + `Vietnamese: ${data.Vietnamese}`;
                }
                if (data.IPA) {
                    backContent += (backContent ? '\n\n' : '') + `Pronunciation: ${data.IPA}`;
                }
                if (data.Examples && Array.isArray(data.Examples) && data.Examples.length > 0) {
                    backContent += (backContent ? '\n\n' : '') + `Examples:\n${data.Examples.map(ex => `• ${ex}`).join('\n')}`;
                }
                input.value = backContent;
                break;
                
            // Fallback for other field patterns
            default:
                const lowerFieldName = fieldName.toLowerCase();
                if (lowerFieldName.includes('meaning')) {
                    input.value = data.Definition || '';
                } else if (lowerFieldName.includes('pronunciation')) {
                    input.value = data.IPA || '';
                } else if (lowerFieldName.includes('audio') || lowerFieldName.includes('sound')) {
                    // Handle other audio fields
                    if (data.ankiFormat) {
                        input.value = data.ankiFormat;
                    }
                }
                break;
        }
    }

    async createAnkiCard(deck, noteType) {
        try {
            // Show loading state
            new Notice('Creating Anki card...');
            
            // Collect field values
            const fields = {};
            const existingAudioFiles = {};
            
            for (const [fieldName, mapping] of Object.entries(this.fieldMappings)) {
                fields[fieldName] = mapping.input.value;
                
                // Check if this field contains [sound:xxx] from existing audio
                if (mapping.input.value.includes('[sound:')) {
                    // Extract the filename and add to existing audio files list
                    const soundMatch = mapping.input.value.match(/\[sound:([^\]]+)\]/);
                    if (soundMatch) {
                        const filename = soundMatch[1];
                        // Use vault path if available
                        const vaultPath = this.dictionaryData.vaultPath || '';
                        const audioPath = vaultPath ? `${vaultPath}/Audio/${filename}` : `Audio/${filename}`;
                        
                        existingAudioFiles[fieldName] = {
                            filename: filename,
                            obsidianPath: audioPath,
                            vaultPath: vaultPath
                        };
                        
                        console.log(`Added audio file info for ${fieldName}:`, existingAudioFiles[fieldName]);
                    }
                }
            }

            // Create note data object with enhanced audio info
            const noteData = {
                deck,
                noteType,
                fields,
                tags: this.plugin.settings.ankiTags || ['obsidian', 'llm-dictionary'],
                existingAudioFiles, // Send existing audio files info
                vaultPath: this.dictionaryData.vaultPath || this.app.vault.adapter.basePath || ''
            };

            console.log('Sending note data to Anki:', noteData);

            const result = await this.ankiIntegration.createNote(noteData);
            if (result) {
                new Notice(`✅ Card created successfully! Note ID: ${result}`);
                this.close();
            }
        } catch (error) {
            new Notice(`❌ Failed to create card: ${error.message}`);
        }
    }
    
    async testAudioFiles(audioFiles) {
        try {
            for (const [fieldName, audioInfo] of Object.entries(audioFiles)) {
                const filename = audioInfo.filename;
                
                new Notice(`🔍 Checking audio file: ${filename}`, 2000);
                
                // Check if audio file exists in Anki media folder
                const response = await fetch(`${this.plugin.settings.ttsServiceUrl}/anki/check-audio/${filename}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Audio file check result:', data);
                    
                    if (data.total_found === 0) {
                        new Notice(`❌ Audio file not found anywhere: ${filename}`, 5000);
                        console.error(`Audio file not found in any location:`, data);
                        continue;
                    }
                    
                    if (!data.locations.anki_media || !data.locations.anki_media.exists) {
                        new Notice(`📋 Copying audio file to Anki: ${filename}`, 3000);
                        
                        // Try to copy the file
                        const copyResponse = await fetch(`${this.plugin.settings.ttsServiceUrl}/anki/copy-audio`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filename })
                        });
                        
                        if (copyResponse.ok) {
                            const copyResult = await copyResponse.json();
                            console.log('Audio copy result:', copyResult);
                            new Notice(`✅ Audio file copied successfully: ${filename}`, 3000);
                        } else {
                            const errorResult = await copyResponse.json();
                            console.error('Failed to copy audio file:', errorResult);
                            
                            if (copyResponse.status === 404) {
                                new Notice(`⚠️ Audio file not found. Please ensure 'Save Note' was clicked first.`, 5000);
                                
                                // Show detailed error in console
                                console.error('Audio file copy failed - 404 Not Found:');
                                console.error('Error details:', errorResult);
                                console.error('Suggestions:');
                                console.error('1. Make sure to click "Save Note" before "Add to Anki"');
                                console.error('2. Check if Audio folder exists in your vault');
                                console.error('3. Verify TTS service is working');
                            } else {
                                new Notice(`❌ Failed to copy audio: ${errorResult.error || 'Unknown error'}`, 5000);
                            }
                        }
                    } else {
                        console.log(`✅ Audio file already exists in Anki: ${filename}`);
                        new Notice(`✅ Audio file ready in Anki: ${filename}`, 2000);
                    }
                } else {
                    console.error('Audio check request failed:', response.status);
                    new Notice(`❌ Cannot check audio file: ${filename}`, 3000);
                }
            }
        } catch (error) {
            console.error('Audio file test failed:', error);
            new Notice(`❌ Audio test failed: ${error.message}`, 5000);
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

class LLMDictionaryPlugin extends Plugin {
    async onload() {
        await this.loadSettings();
        
        this.registerView(
            DICTIONARY_VIEW_TYPE,
            (leaf) => new DictionaryView(leaf, this)
        );
        
        this.addCommand({
            id: 'lookup-word',
            name: 'Look up selected text',
            hotkeys: [{ modifiers: ['Ctrl'], key: 'd' }],
            callback: () => {
                this.lookupSelectedText();
            }
        });
        
        this.addCommand({
            id: 'open-dictionary-view',
            name: 'Open Dictionary View',
            callback: () => {
                this.activateView();
            }
        });
        
        this.addSettingTab(new LLMDictionarySettingTab(this.app, this));
        
        this.addCommand({
            id: 'create-anki-card',
            name: 'Create Anki Card from Selection',
            editorCallback: (editor, view) => {
                const selectedText = editor.getSelection();
                if (selectedText) {
                    new AnkiCardModal(this.app, this, selectedText).open();
                } else {
                    new Notice('Please select text to create an Anki card');
                }
            }
        });

        this.addCommand({
            id: 'test-anki-connection',
            name: 'Test Anki Connection',
            callback: async () => {
                const anki = new AnkiIntegration(this.settings.ttsServiceUrl || 'http://localhost:6789');
                const connections = await anki.testConnections();
                
                if (connections.tts && connections.anki) {
                    new Notice('✅ All connections working!');
                } else {
                    new Notice(`❌ Connection issues: TTS=${connections.tts}, Anki=${connections.anki}`);
                }
            }
        });

        // Add debug command for audio files
        this.addCommand({
            id: 'debug-audio-files',
            name: 'Debug Audio Files',
            callback: async () => {
                try {
                    // Check recent audio files
                    const audioFolder = this.app.vault.getAbstractFileByPath('Audio');
                    if (audioFolder && audioFolder.children) {
                        const mp3Files = audioFolder.children
                            .filter(file => file.name.endsWith('.mp3'))
                            .slice(0, 5); // Check last 5 files
                        
                        new Notice(`Found ${mp3Files.length} recent audio files`, 3000);
                        
                        for (const file of mp3Files) {
                            const response = await fetch(`${this.settings.ttsServiceUrl}/anki/check-audio/${file.name}`);
                            if (response.ok) {
                                const data = await response.json();
                                console.log(`Audio check for ${file.name}:`, data);
                            }
                        }
                    } else {
                        new Notice('No Audio folder found');
                    }
                } catch (error) {
                    new Notice(`Debug failed: ${error.message}`);
                }
            }
        });

        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => {
                const selectedText = editor.getSelection();
                if (selectedText && this.settings.enableAnkiIntegration) {
                    menu.addItem((item) => {
                        item
                            .setTitle('🃏 Create Anki Card')
                            .setIcon('card-glyph')
                            .onClick(() => {
                                new AnkiCardModal(this.app, this, selectedText).open();
                            });
                    });
                }
            })
        );
        
        console.log('LLM Dictionary Plugin loaded');
    }

    async lookupSelectedText() {
        const activeLeaf = this.app.workspace.activeLeaf;
        let selectedText = '';
        
        if (activeLeaf && activeLeaf.view.editor) {
            selectedText = activeLeaf.view.editor.getSelection();
        } else {
            const selection = window.getSelection();
            selectedText = selection.toString();
        }
        
        if (!selectedText || selectedText.trim().length === 0) {
            new Notice("No text selected for lookup");
            return;
        }
        
        await this.activateView();
        
        const view = this.getDictionaryView();
        if (view) {
            await view.lookupWord(selectedText.trim());
        }
    }

    async activateView() {
        const { workspace } = this.app;
        
        let leaf = null;
        const leaves = workspace.getLeavesOfType(DICTIONARY_VIEW_TYPE);
        
        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: DICTIONARY_VIEW_TYPE, active: true });
        }
        
        workspace.revealLeaf(leaf);
        return leaf;
    }

    getDictionaryView() {
        const leaves = this.app.workspace.getLeavesOfType(DICTIONARY_VIEW_TYPE);
        if (leaves.length > 0) {
            return leaves[0].view;
        }
        return null;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class LLMDictionarySettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'LLM Dictionary Settings' });

        new Setting(containerEl)
            .setName('Groq API Key')
            .setDesc('Enter your Groq API key for AI dictionary lookup')
            .addText(text => text
                .setPlaceholder('Enter API key')
                .setValue(this.plugin.settings.llmkey)
                .onChange(async (value) => {
                    this.plugin.settings.llmkey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Definition Language')
            .setDesc('Language for word definitions')
            .addDropdown(dropdown => dropdown
                .addOption('English', 'English')
                .addOption('Vietnamese', 'Vietnamese')
                .addOption('Spanish', 'Spanish')
                .addOption('French', 'French')
                .setValue(this.plugin.settings.def)
                .onChange(async (value) => {
                    this.plugin.settings.def = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: '🎙️ Text-to-Speech Settings' });

        new Setting(containerEl)
            .setName('Enable TTS')
            .setDesc('Enable text-to-speech for pronunciation')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ttsEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.ttsEnabled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('TTS Service URL')
            .setDesc('URL of the local TTS service')
            .addText(text => text
                .setPlaceholder('http://localhost:6789')
                .setValue(this.plugin.settings.ttsServiceUrl || 'http://localhost:6789')
                .onChange(async (value) => {
                    this.plugin.settings.ttsServiceUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('TTS Voice')
            .setDesc('Voice for text-to-speech')
            .addText(text => text
                .setPlaceholder('en-us')
                .setValue(this.plugin.settings.ttsVoice)
                .onChange(async (value) => {
                    this.plugin.settings.ttsVoice = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: '🃏 Anki Integration' });

        new Setting(containerEl)
            .setName('Enable Anki Integration')
            .setDesc('Enable creating Anki cards from selected text')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableAnkiIntegration)
                .onChange(async (value) => {
                    this.plugin.settings.enableAnkiIntegration = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Deck')
            .setDesc('Default Anki deck for new cards')
            .addText(text => text
                .setPlaceholder('Default')
                .setValue(this.plugin.settings.defaultDeck)
                .onChange(async (value) => {
                    this.plugin.settings.defaultDeck = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Note Type')
            .setDesc('Default Anki note type for new cards')
            .addText(text => text
                .setPlaceholder('Basic')
                .setValue(this.plugin.settings.defaultNoteType)
                .onChange(async (value) => {
                    this.plugin.settings.defaultNoteType = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Test Anki Connection')
            .setDesc('Test connection to Anki Connect and TTS service')
            .addButton(button => button
                .setButtonText('Test Connection')
                .onClick(async () => {
                    const anki = new AnkiIntegration(this.plugin.settings.ttsServiceUrl || 'http://localhost:6789');
                    const connections = await anki.testConnections();
                    
                    if (connections.tts && connections.anki) {
                        new Notice('✅ All connections working!');
                    } else {
                        new Notice(`❌ Connection issues: TTS=${connections.tts}, Anki=${connections.anki}`);
                    }
                }));
    }
}

module.exports = LLMDictionaryPlugin;
