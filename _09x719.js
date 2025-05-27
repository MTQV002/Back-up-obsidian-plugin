(async () => {

function stopAllPlayingAudio() {
    // Get all <audio> elements in the page
    const audioElements = document.querySelectorAll('audio');

    // Iterate over each audio element
    audioElements.forEach(audio => {
        // Check if the audio is currently playing
        if (!audio.paused && !audio.ended) {
            // Pause the audio
            audio.pause();

            // Optionally reset the playback position
            audio.currentTime = 0;
        }
    });

    console.log("All playing audio elements have been stopped.");
}

// Example usage
stopAllPlayingAudio();

async function setUp(voice) {
    try {
        let t = {
            sleep: function (e) {
                return new Promise((t) => setTimeout(t, e));
            },
        };
        let n = document.getElementsByClassName("tts");

        t.textToSpeech = async (text, opts = {}) => {
            if (!text) return;
            let synth = window.speechSynthesis;
            let voiceName = opts.voice || voice || "";
            let rate = opts.rate ? parseFloat(opts.rate) : 1;
            function cleanText(e) {
                const div = document.createElement("div");
                div.innerHTML = e;
                return div.innerText.replace(/([\p{Emoji_Presentation}|\p{Extended_Pictographic}]|\u200d|\uFE0F)/gu, "");
            }
            text = cleanText(text);
            let chunks = [];
            if (text.trim().split(/\s+/).length < 20) {
                chunks = [text];
            } else {
                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                let chunk = [];
                let count = 0;
                for (let s of sentences) {
                    let words = s.trim().split(/\s+/).length;
                    if (count + words > 20) {
                        chunks.push(chunk.join(" ").trim());
                        chunk = [];
                        count = 0;
                    }
                    chunk.push(s.trim());
                    count += words;
                }
                if (chunk.length) chunks.push(chunk.join(" ").trim());
            }
            for (let chunk of chunks) {
                let utter = new SpeechSynthesisUtterance(chunk);
                utter.rate = rate;
                if (voiceName) {
                    let voices = synth.getVoices();
                    let found = voices.find(v => v.name === voiceName || v.lang === voiceName);
                    if (found) utter.voice = found;
                }
                synth.speak(utter);
                await new Promise(res => {
                    utter.onend = res;
                });
            }
            return [];
        };

        let r = document.createElement("style");
        r.innerHTML =
            `
    .play-button {
        width: 30px !important;
        height: 30px !important;
        background-color: #007BFF !important;
        border: none !important;
        border-radius: 5px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        transition: background-color 0.3s !important, transform 0.3s !important;
        display: inline-block !important;
        position: relative !important;
    }
    .play-button:hover {
        background-color: #0056b3 !important;
        transform: scale(1.1) !important;
    }
    .play-icon {
        width: 16px !important;
        height: 16px !important;
        fill: white !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
    }
    `;
        document.head.appendChild(r);
        for (let e of n) {
            let nspan = document.createElement("span"),
                o = e.innerText;
            nspan.classList.add("play-button"),
                (nspan.innerHTML =
                    '<svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
            e.innerHTML = "";
            e.appendChild(nspan);
            nspan.addEventListener("click", async () => {
                await t.textToSpeech(o, { voice: e.getAttribute("voice") || voice });
            });
        }
    } catch (e) {
        console.error("lighter-tts")
        console.error(e)
    }
}
await setUp(voice);
})();
