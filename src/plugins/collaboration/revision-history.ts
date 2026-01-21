import type { LexicalEditor } from 'lexical';

export interface Revision {
    id: string;
    timestamp: number;
    name: string;
    state: string; // JSON string of the editor state
}

const STORAGE_KEY = 'editor_revisions';

export const RevisionHistory = {
    /**
     * Saves the current editor state as a new revision.
     */
    saveSnapshot: (editor: LexicalEditor, name: string): Revision => {
        const state = editor.getEditorState();
        const json = JSON.stringify(state.toJSON());

        const revision: Revision = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            name: name || `Revision ${new Date().toLocaleTimeString()}`,
            state: json
        };

        const history = RevisionHistory.getHistory();
        history.push(revision);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

        return revision;
    },

    /**
     * Retrieves all saved revisions from local storage.
     */
    getHistory: (): Revision[] => {
        const stored = localStorage.getItem(STORAGE_KEY);
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to parse revision history', e);
            return [];
        }
    },

    /**
     * Restores a specific revision to the editor.
     */
    restoreSnapshot: (editor: LexicalEditor, revision: Revision) => {
        const state = editor.parseEditorState(revision.state);
        editor.setEditorState(state);
    },

    /**
     * Clears all history.
     */
    clearHistory: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
