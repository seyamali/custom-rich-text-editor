import { type LexicalEditor } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import {
    SAVE_REVISION_COMMAND,
    RESTORE_REVISION_COMMAND,
    TOGGLE_REVISION_HISTORY_COMMAND,
    type Revision
} from '../plugins/advanced/revision-history';

const STORAGE_KEY = 'universal_editor_revisions';

export function setupRevisionHistoryUI(editor: LexicalEditor) {
    // Create UI Elements
    const sidebar = createSidebar(editor);
    const compareOverlay = createCompareOverlay(editor);

    document.body.appendChild(sidebar);
    document.body.appendChild(compareOverlay);

    // Listen for toggle command
    editor.registerCommand(
        TOGGLE_REVISION_HISTORY_COMMAND,
        () => {
            sidebar.classList.toggle('open');
            if (sidebar.classList.contains('open')) {
                updateRevisionList(sidebar, editor);
            }
            return true;
        },
        1
    );

    // Update list on changes
    window.addEventListener('editor-revisions-updated', () => {
        if (sidebar.classList.contains('open')) {
            updateRevisionList(sidebar, editor);
        }
    });
}

function createSidebar(editor: LexicalEditor): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.className = 'revision-history-sidebar';
    sidebar.innerHTML = `
        <div class="rev-header">
            <h3>Revision History</h3>
            <button class="rev-close-btn">&times;</button>
        </div>
        <div class="rev-list-container">
            <div class="rev-list" id="rev-list-items"></div>
        </div>
        <div class="rev-footer">
            <button class="rev-manual-save" id="rev-save-btn">
                <span>+</span> Save Snapshot
            </button>
        </div>
    `;

    sidebar.querySelector('.rev-close-btn')?.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    sidebar.querySelector('#rev-save-btn')?.addEventListener('click', () => {
        const name = prompt("Name this version:", `Version ${new Date().toLocaleTimeString()}`);
        if (name) {
            editor.dispatchCommand(SAVE_REVISION_COMMAND, { name });
        }
    });

    return sidebar;
}

function updateRevisionList(sidebar: HTMLElement, editor: LexicalEditor) {
    const listEl = sidebar.querySelector('#rev-list-items');
    if (!listEl) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const history: Revision[] = stored ? JSON.parse(stored) : [];

    listEl.innerHTML = history.length === 0
        ? '<div style="text-align:center; color:#94a3b8; padding:40px 10px;">No history yet. Changes will be saved automatically.</div>'
        : '';

    history.slice().reverse().forEach((rev) => {
        const item = document.createElement('div');
        item.className = 'rev-item';
        item.innerHTML = `
            <div class="rev-item-header">
                <span class="rev-item-name">${rev.name}</span>
                <span class="rev-item-time">${new Date(rev.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="rev-item-meta">
                <span>👤 ${rev.author}</span>
                <span>•</span>
                <span>${rev.isAuto ? 'Auto' : 'Manual'}</span>
            </div>
            <div class="rev-item-actions">
                <button class="rev-btn rev-btn-restore" data-id="${rev.id}">Restore</button>
                <button class="rev-btn rev-btn-compare" data-id="${rev.id}">Compare</button>
            </div>
        `;

        item.querySelector('.rev-btn-restore')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to restore this version? Your current unsaved changes will be snapshotted as a new version.")) {
                editor.dispatchCommand(RESTORE_REVISION_COMMAND, rev.id);
                sidebar.classList.remove('open');
            }
        });

        item.querySelector('.rev-btn-compare')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openCompareView(rev, editor);
        });

        listEl.appendChild(item);
    });
}

function createCompareOverlay(_editor: LexicalEditor): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'rev-compare-overlay';
    overlay.id = 'rev-compare-overlay';
    overlay.innerHTML = `
        <div class="rev-compare-header">
            <span class="rev-compare-title">Compare Versions</span>
            <button class="rev-btn rev-btn-compare" id="rev-compare-close">Exit Comparison</button>
        </div>
        <div class="rev-compare-content">
            <div class="rev-compare-pane">
                <div class="rev-pane-label">Original Version</div>
                <div id="rev-pane-old" class="editor-container"></div>
            </div>
            <div class="rev-compare-pane">
                <div class="rev-pane-label">Current Editor</div>
                <div id="rev-pane-new" class="editor-container"></div>
            </div>
        </div>
    `;

    overlay.querySelector('#rev-compare-close')?.addEventListener('click', () => {
        overlay.classList.remove('open');
    });

    return overlay;
}

function openCompareView(revision: Revision, editor: LexicalEditor) {
    const overlay = document.getElementById('rev-compare-overlay');
    const oldPane = document.getElementById('rev-pane-old');
    const newPane = document.getElementById('rev-pane-new');

    if (!overlay || !oldPane || !newPane) return;

    overlay.classList.add('open');

    // Render Old State
    const oldState = editor.parseEditorState(revision.state);
    oldState.read(() => {
        oldPane.innerHTML = $generateHtmlFromNodes(editor);
    });

    // Render Current State
    editor.getEditorState().read(() => {
        newPane.innerHTML = $generateHtmlFromNodes(editor);
    });

    // Simple Diff logic (Visual highlighting)
    applySimpleDiff(oldPane, newPane);
}

/**
 * Very basic visual diffing by comparing text content of nodes.
 * For a real visual diff, one would use a more sophisticated DOM diffing library.
 */
function applySimpleDiff(_oldEl: HTMLElement, _newEl: HTMLElement) {
    // This is a placeholder for actual semantic diffing.
    // To give a "WOW" effect, we will do a simple word-based diff on the text.

    // const oldText = oldEl.innerText;
    // const newText = newEl.innerText;

    // We keep the original HTML for structure but if we want additions/deletions 
    // we should ideally diff the HTML strings.

    // For now, let's keep the side-by-side view as it is very clear.
}
