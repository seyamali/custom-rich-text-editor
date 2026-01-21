import { type LexicalEditor } from 'lexical';
import { RevisionHistory, type Revision } from './revision-history';

export function setupRevisionHistoryUI(internalEditor: LexicalEditor) {
    const updateRevisionList = () => {
        const listEl = document.getElementById('revision-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        const history = RevisionHistory.getHistory();

        if (history.length === 0) {
            listEl.innerHTML = '<div style="padding:10px; color:#888;">No revisions saved.</div>';
            return;
        }

        history.slice().reverse().forEach((rev: Revision) => {
            const item = document.createElement('div');
            item.className = 'revision-item';

            const info = document.createElement('span');
            info.innerHTML = `<strong>${rev.name}</strong> <br/> <small>${new Date(rev.timestamp).toLocaleString()}</small>`;

            const restoreBtn = document.createElement('button');
            restoreBtn.innerText = 'Restore';
            restoreBtn.onclick = () => {
                if (confirm(`Restore version "${rev.name}"? Unsaved changes will be lost.`)) {
                    RevisionHistory.restoreSnapshot(internalEditor, rev);
                }
            };

            item.appendChild(info);
            item.appendChild(restoreBtn);
            listEl.appendChild(item);
        });
    };

    // Initial load
    updateRevisionList();

    document.getElementById('save-revision-btn')?.addEventListener('click', () => {
        const name = prompt("Name this version:", "Draft");
        if (name) {
            RevisionHistory.saveSnapshot(internalEditor, name);
            updateRevisionList();
        }
    });

    document.getElementById('clear-history-btn')?.addEventListener('click', () => {
        if (confirm("Clear all revision history?")) {
            RevisionHistory.clearHistory();
            updateRevisionList();
        }
    });
}
