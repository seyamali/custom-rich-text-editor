import type { EditorPlugin } from '../../core/registry';
import { type LexicalEditor, type EditorState } from 'lexical';
import { EditorSDK } from '../../core/sdk';

export const AUTOSAVE_KEY = 'editor_autosave_state';
const DELAY = 2000; // 2 seconds

export const AutosavePlugin: EditorPlugin = {
    name: 'autosave',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        let timeoutId: number | undefined;

        // Listen for updates
        return editor.registerUpdateListener(({ editorState }) => {
            // Only save if content changed (clean listeners might fire for selection changes too, but update listeners usually imply content or potential serializable change)
            // Actually registerUpdateListener fires on selection too.
            // We can check if `dirtyElements` or `dirtyLeaves` is empty, but serialization is cheap enough for a debounce.

            clearTimeout(timeoutId);
            updateStatus('Writing...');

            // @ts-ignore
            timeoutId = setTimeout(() => {
                saveState(editorState);
            }, DELAY);
        });
    }
};

function saveState(editorState: EditorState) {
    const json = JSON.stringify(editorState.toJSON());
    localStorage.setItem(AUTOSAVE_KEY, json);
    updateStatus('Saved ✔');
}

function updateStatus(msg: string) {
    const statusEl = document.getElementById('autosave-status');
    if (statusEl) {
        statusEl.innerText = msg;
        statusEl.style.opacity = '1';

        if (msg.includes('Saved')) {
            // Fade out "Saved" after a bit
            setTimeout(() => {
                if (statusEl.innerText === msg) {
                    statusEl.style.opacity = '0.5';
                }
            }, 1000);
        }
    }
}

export function hasAutosavedState(): boolean {
    return !!localStorage.getItem(AUTOSAVE_KEY);
}

export function loadAutosavedState(editor: LexicalEditor) {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
        try {
            const state = editor.parseEditorState(saved);
            editor.setEditorState(state);
            console.log("Autosave restored.");
        } catch (e) {
            console.error("Failed to restore autosave:", e);
        }
    }
}
