import { $getRoot } from 'lexical';
import { EditorSDK } from '../../core/sdk';

export const ProductivityPlugin = {
    name: 'productivity-pack',
    init: (sdk: EditorSDK) => {
        const wordCountEl = document.getElementById('word-count');
        const charCountEl = document.getElementById('char-count');
        const readingTimeEl = document.getElementById('reading-time');
        const zenBtn = document.getElementById('zen-mode-btn');
        const wrapper = document.getElementById('editor-wrapper');

        // 1. Zen Mode Toggle
        if (zenBtn && wrapper) {
            zenBtn.addEventListener('click', () => {
                wrapper.classList.toggle('zen-mode');
                const isZen = wrapper.classList.contains('zen-mode');
                zenBtn.innerText = isZen ? '🚪 Exit Zen' : '🧘 Zen';
                sdk.announce(isZen ? "Zen mode enabled. Distraction-free writing active." : "Zen mode disabled.");
            });
        }

        // 2. Word & Character Count + Reading Time
        sdk.registerUpdateListener(() => {
            sdk.update(() => {
                const root = $getRoot();
                const text = root.getTextContent();

                // Characters
                const chars = text.length;

                // Words
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;

                // Reading Time (Avg 200 wpm)
                const readingTime = Math.max(1, Math.ceil(words / 200));

                if (wordCountEl) wordCountEl.innerText = `${words} words`;
                if (charCountEl) charCountEl.innerText = `${chars} characters`;
                if (readingTimeEl) readingTimeEl.innerText = `${readingTime} min read`;
            });
        });

        console.log("Productivity Pack (Zen Mode, Stats) initialized.");
    }
};
