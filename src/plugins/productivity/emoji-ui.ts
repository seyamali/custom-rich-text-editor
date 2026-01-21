import { type LexicalEditor } from 'lexical';
import { EmojiPicker } from './emoji';

const COMMON_EMOJIS = [
    // Faces
    '😀', '😂', '😍', '😎', '😭', '😡', '👍', '👎', '👏', '🙏',
    // Nature
    '🔥', '🌈', '☀️', '🌙', '⭐', '🌺', '🍀',
    // Objects
    '💻', '📱', '💡', '📅', '📝', '🔒', '🔑',
    // Symbols
    '✅', '❌', '❤️', '💯', '‼️', '❓',
    // Special Characters
    '©', '®', '™', '€', '£', '¥', '§', '¶', '←', '→', '↑', '↓'
];

export function setupEmojiUI(internalEditor: LexicalEditor) {
    const emojiDialog = document.getElementById('emoji-dialog');
    const emojiGrid = document.getElementById('emoji-grid');
    const closeBtn = document.getElementById('close-emoji-btn');

    if (!emojiDialog || !emojiGrid) return;

    // Populate Grid
    emojiGrid.innerHTML = '';
    COMMON_EMOJIS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.innerText = emoji;
        btn.className = 'emoji-item';
        btn.onclick = () => {
            EmojiPicker.insertEmoji(internalEditor, emoji);
            emojiDialog.classList.add('hidden'); // Close after selection
        };
        emojiGrid.appendChild(btn);
    });

    // Close Handler
    closeBtn?.addEventListener('click', () => {
        emojiDialog.classList.add('hidden');
    });

    // Toggle Handler (attached to the main toolbar button)
    document.getElementById('emoji-btn')?.addEventListener('click', () => {
        emojiDialog.classList.toggle('hidden');
    });
}
