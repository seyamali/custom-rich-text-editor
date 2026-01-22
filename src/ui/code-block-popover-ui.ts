import { $getNodeByKey, $getSelection, $isRangeSelection } from 'lexical';
import { $isCodeBlockNode } from '../plugins/advanced/code-block-node';
import { SET_CODE_LANGUAGE_COMMAND, SUPPORTED_LANGUAGES } from '../plugins/advanced/code-blocks';
import type { LexicalEditor } from 'lexical';

/**
 * Setup code block popover for language selection
 */
export function setupCodeBlockPopover(editor: LexicalEditor) {
    const popover = createCodeBlockPopover();
    document.body.appendChild(popover);

    // Listen for selection changes
    editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
                hidePopover(popover);
                return;
            }

            const anchorNode = selection.anchor.getNode();
            const parent = anchorNode.getParent();

            if ($isCodeBlockNode(parent)) {
                const language = parent.getLanguage();
                showPopover(popover, parent.getKey(), language, editor);
            } else {
                hidePopover(popover);
            }
        });
    });

    // Hide popover when clicking outside
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!popover.contains(target) && !target.closest('.code-block-wrapper')) {
            hidePopover(popover);
        }
    });
}

function createCodeBlockPopover(): HTMLElement {
    const popover = document.createElement('div');
    popover.id = 'code-block-popover';
    popover.className = 'code-block-popover hidden';
    popover.innerHTML = `
        <div class="code-block-popover-content">
            <label class="code-block-label">
                <span>Language:</span>
                <select id="code-language-select" class="code-language-select">
                    ${SUPPORTED_LANGUAGES.map(lang =>
        `<option value="${lang.value}">${lang.label}</option>`
    ).join('')}
                </select>
            </label>
            <button id="code-block-delete-btn" class="code-block-delete-btn" title="Delete Code Block">
                🗑️ Delete
            </button>
        </div>
    `;
    return popover;
}

function showPopover(popover: HTMLElement, nodeKey: string, currentLanguage: string | null, editor: LexicalEditor) {
    popover.classList.remove('hidden');

    const select = popover.querySelector('#code-language-select') as HTMLSelectElement;
    if (select) {
        // Remove previous event listeners by cloning
        const newSelect = select.cloneNode(true) as HTMLSelectElement;
        select.parentNode?.replaceChild(newSelect, select);

        // Set value on the new select
        newSelect.value = currentLanguage || 'plaintext';

        newSelect.addEventListener('change', () => {
            const newLanguage = newSelect.value;
            editor.dispatchCommand(SET_CODE_LANGUAGE_COMMAND, {
                nodeKey,
                language: newLanguage
            });
        });
    }

    const deleteBtn = popover.querySelector('#code-block-delete-btn') as HTMLButtonElement;
    if (deleteBtn) {
        const newDeleteBtn = deleteBtn.cloneNode(true) as HTMLButtonElement;
        deleteBtn.parentNode?.replaceChild(newDeleteBtn, deleteBtn);

        newDeleteBtn.addEventListener('click', () => {
            editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if (node) {
                    node.remove();
                }
            });
            hidePopover(popover);
        });
    }

    // Position the popover
    positionPopover(popover, nodeKey, editor);
}

function hidePopover(popover: HTMLElement) {
    popover.classList.add('hidden');
}

function positionPopover(popover: HTMLElement, nodeKey: string, editor: LexicalEditor) {
    const element = editor.getElementByKey(nodeKey);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    // Position below the code block
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX;

    // Adjust if popover goes off-screen
    if (left + popoverRect.width > window.innerWidth) {
        left = window.innerWidth - popoverRect.width - 20;
    }

    if (top + popoverRect.height > window.innerHeight + window.scrollY) {
        // Position above if not enough space below
        top = rect.top + window.scrollY - popoverRect.height - 8;
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
}
