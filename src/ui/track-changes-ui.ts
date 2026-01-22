import { type LexicalEditor, $nodesOfType } from 'lexical';
import { SuggestionNode } from '../plugins/collaboration/suggestion-node';
import {
    ACCEPT_SUGGESTION_COMMAND,
    REJECT_SUGGESTION_COMMAND
} from '../plugins/collaboration/track-changes';

export function setupTrackChangesUI(editor: LexicalEditor) {
    const sidebar = createTrackChangesSidebar(editor);
    document.body.appendChild(sidebar);

    const statusWidget = createStatusWidget(editor);
    document.body.appendChild(statusWidget);

    // Listen for toggle events
    window.addEventListener('track-changes-toggled', ((e: CustomEvent) => {
        const isOn = e.detail;
        statusWidget.classList.toggle('active', isOn);
        statusWidget.querySelector('.tc-status-text')!.textContent = isOn ? 'Suggesting' : 'Editing';

        if (isOn) {
            sidebar.classList.add('open');
            updateReviewList(sidebar, editor);
        }
    }) as any);

    // Update list dynamically when editor changes
    editor.registerUpdateListener(() => {
        if (sidebar.classList.contains('open')) {
            updateReviewList(sidebar, editor);
        }
    });

    // Toggle sidebar on widget click
    statusWidget.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open')) {
            updateReviewList(sidebar, editor);
        }
    });
}

function createTrackChangesSidebar(editor: LexicalEditor): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.className = 'tc-review-sidebar';
    sidebar.innerHTML = `
        <div class="tc-header">
            <h3>Review Suggestions</h3>
            <button class="tc-close">&times;</button>
        </div>
        <div class="tc-list-container" style="flex:1; overflow-y:auto;">
            <div id="tc-suggestion-list"></div>
        </div>
        <div class="rev-footer">
            <button class="rev-manual-save" id="tc-accept-all">Accept All</button>
        </div>
    `;

    sidebar.querySelector('.tc-close')?.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    sidebar.querySelector('#tc-accept-all')?.addEventListener('click', () => {
        editor.update(() => {
            const nodes = $nodesOfType(SuggestionNode);
            nodes.forEach(node => {
                editor.dispatchCommand(ACCEPT_SUGGESTION_COMMAND, node.getKey());
            });
        });
    });

    return sidebar;
}

function updateReviewList(sidebar: HTMLElement, editor: LexicalEditor) {
    const listEl = sidebar.querySelector('#tc-suggestion-list');
    if (!listEl) return;

    editor.getEditorState().read(() => {
        const suggestions = $nodesOfType(SuggestionNode);

        listEl.innerHTML = suggestions.length === 0
            ? '<div style="text-align:center; color:#94a3b8; padding:40px 20px;">No pending suggestions.</div>'
            : '';

        suggestions.forEach(node => {
            const card = document.createElement('div');
            card.className = 'tc-card';
            const type = node.getSuggestionType();

            card.innerHTML = `
                <div class="tc-card-header">
                    <span class="tc-author">${node.getAuthor()}</span>
                    <span class="tc-type-badge badge-${type}">${type}</span>
                </div>
                <div class="tc-content-preview">
                    "${node.getTextContent()}"
                </div>
                <div class="tc-actions">
                    <button class="tc-btn tc-btn-accept" data-key="${node.getKey()}">Accept</button>
                    <button class="tc-btn tc-btn-reject" data-key="${node.getKey()}">Reject</button>
                </div>
            `;

            card.querySelector('.tc-btn-accept')?.addEventListener('click', () => {
                editor.dispatchCommand(ACCEPT_SUGGESTION_COMMAND, node.getKey());
            });

            card.querySelector('.tc-btn-reject')?.addEventListener('click', () => {
                editor.dispatchCommand(REJECT_SUGGESTION_COMMAND, node.getKey());
            });

            listEl.appendChild(card);
        });
    });
}

function createStatusWidget(_editor: LexicalEditor): HTMLElement {
    const widget = document.createElement('div');
    widget.className = 'tc-status-widget';
    widget.style.position = 'fixed';
    widget.style.bottom = '20px';
    widget.style.left = '20px';
    widget.style.zIndex = '2000';
    widget.innerHTML = `
        <div class="tc-dot"></div>
        <span class="tc-status-text">Editing</span>
    `;
    return widget;
}
