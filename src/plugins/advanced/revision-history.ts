import {
    createCommand,
    type LexicalCommand,
    COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

// Types
export interface Revision {
    id: string;
    timestamp: number;
    name: string;
    state: string; // Serialized EditorState
    author: string;
    isAuto: boolean;
}

// Commands
export const SAVE_REVISION_COMMAND: LexicalCommand<{ name?: string, isAuto?: boolean }> = createCommand('SAVE_REVISION');
export const RESTORE_REVISION_COMMAND: LexicalCommand<string> = createCommand('RESTORE_REVISION_BY_ID');
export const TOGGLE_REVISION_HISTORY_COMMAND: LexicalCommand<void> = createCommand('TOGGLE_REVISION_HISTORY');

const STORAGE_KEY = 'universal_editor_revisions';
const MAX_REVISIONS = 50;
const AUTO_VERSION_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const RevisionHistoryPlugin: EditorPlugin = {
    name: 'revision-history',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        let lastAutoSaveTime = Date.now();

        // 1. Load existing history
        const getHistory = (): Revision[] => {
            const stored = localStorage.getItem(STORAGE_KEY);
            try {
                return stored ? JSON.parse(stored) : [];
            } catch {
                return [];
            }
        };

        const saveHistory = (history: Revision[]) => {
            // Keep only latest revisions
            const trimmed = history.slice(-MAX_REVISIONS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        };

        // 2. Register Commands
        sdk.registerCommand(
            SAVE_REVISION_COMMAND,
            (payload) => {
                const state = editor.getEditorState();
                const json = JSON.stringify(state.toJSON());

                const newRevision: Revision = {
                    id: Math.random().toString(36).substring(2, 11),
                    timestamp: Date.now(),
                    name: payload.name || (payload.isAuto ? 'Auto Snapshot' : 'Manual Version'),
                    state: json,
                    author: 'Current User',
                    isAuto: !!payload.isAuto
                };

                const history = getHistory();
                // Avoid duplicates if content hasn't changed significantly (optional, but good)
                if (history.length > 0 && history[history.length - 1].state === json) {
                    return true;
                }

                history.push(newRevision);
                saveHistory(history);
                console.log(`[Revision] Saved: ${newRevision.name}`);

                // Fire event for UI update
                window.dispatchEvent(new CustomEvent('editor-revisions-updated'));
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        sdk.registerCommand(
            RESTORE_REVISION_COMMAND,
            (revisionId) => {
                const history = getHistory();
                const revision = history.find(r => r.id === revisionId);
                if (revision) {
                    // Before restoring, save a "Pre-restore" snapshot so user doesn't lose current work
                    sdk.dispatchCommand(SAVE_REVISION_COMMAND, { name: 'Before Restore', isAuto: true });

                    const state = editor.parseEditorState(revision.state);
                    editor.setEditorState(state);

                    // Add a notification or log
                    console.log(`[Revision] Restored version from ${new Date(revision.timestamp).toLocaleString()}`);
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 3. Automatic Versioning Logic
        editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
            // Only auto-save if content actually changed
            if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

            const now = Date.now();
            if (now - lastAutoSaveTime > AUTO_VERSION_INTERVAL) {
                sdk.dispatchCommand(SAVE_REVISION_COMMAND, { isAuto: true });
                lastAutoSaveTime = now;
            }
        });

        // 4. Initial Snapshot
        setTimeout(() => {
            const hist = getHistory();
            if (hist.length === 0) {
                sdk.dispatchCommand(SAVE_REVISION_COMMAND, { name: 'Initial Version', isAuto: true });
            }
        }, 1000);

        // 5. Toolbar Button
        sdk.addToolbarButton({
            id: 'revision-history-toggle',
            label: 'History',
            icon: '🕒',
            tooltip: 'View Revision History',
            onClick: () => {
                sdk.dispatchCommand(TOGGLE_REVISION_HISTORY_COMMAND, undefined);
            }
        });
    }
};

/**
 * Utility for Diffing (Internal Use for UI)
 * Simple word-level diff
 */
export function diffHtml(oldHtml: string, newHtml: string): string {
    // This is a placeholder for a more complex diffing logic
    // For now, let's return a simple structure. 
    // In a real app, you'd use a library like 'diff-match-patch'
    return `
        <div class="diff-container">
            <div class="diff-old">${oldHtml}</div>
            <div class="diff-new">${newHtml}</div>
        </div>
    `;
}
