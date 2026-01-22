import { $getSelection, $isRangeSelection, $isNodeSelection, COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND, CAN_UNDO_COMMAND, CAN_REDO_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $isImageNode } from '../../plugins/media/image-node';
import { $isTableNode } from '@lexical/table';
import { $getSelectionStyleValueForProperty } from '@lexical/selection';

export function setupToolbarState(internalEditor: any) {
    const updateToolbar = () => {
        internalEditor.getEditorState().read(() => {
            const selection = $getSelection();

            let isLink = false;

            if ($isRangeSelection(selection)) {
                // Formatting
                const isBold = selection.hasFormat('bold');
                const isItalic = selection.hasFormat('italic');
                const isUnderline = selection.hasFormat('underline');
                const isStrike = selection.hasFormat('strikethrough');
                const isSub = selection.hasFormat('subscript');
                const isSup = selection.hasFormat('superscript');
                const isCode = selection.hasFormat('code');

                document.getElementById('bold-btn')?.classList.toggle('active', isBold);
                document.getElementById('italic-btn')?.classList.toggle('active', isItalic);
                document.getElementById('underline-btn')?.classList.toggle('active', isUnderline);
                document.getElementById('strike-btn')?.classList.toggle('active', isStrike);
                document.getElementById('sub-btn')?.classList.toggle('active', isSub);
                document.getElementById('sup-btn')?.classList.toggle('active', isSup);
                document.getElementById('code-btn')?.classList.toggle('active', isCode);

                // Block Type Detection
                const anchorNode = selection.anchor.getNode();
                let element = anchorNode.getKey() === 'root'
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();

                const blockSelect = document.getElementById('block-type-select') as HTMLSelectElement;
                if (blockSelect) {
                    if ($isHeadingNode(element)) {
                        blockSelect.value = element.getTag();
                    } else if ($isQuoteNode(element)) {
                        blockSelect.value = 'quote';
                    } else {
                        blockSelect.value = 'paragraph';
                    }
                }

                document.getElementById('quote-btn')?.classList.toggle('active', $isQuoteNode(element));

                // List Detection
                const listNode = $getNearestNodeOfType(anchorNode, ListNode);
                if (listNode) {
                    const listType = listNode.getListType();
                    document.getElementById('bullet-btn')?.classList.toggle('active', listType === 'bullet');
                    document.getElementById('number-btn')?.classList.toggle('active', listType === 'number');
                } else {
                    document.getElementById('bullet-btn')?.classList.remove('active');
                    document.getElementById('number-btn')?.classList.remove('active');
                }

                // Link Detection
                isLink = $getNearestNodeOfType(anchorNode, LinkNode) !== null;
            } else if ($isNodeSelection(selection)) {
                // Node Selection (e.g. Image)
                const nodes = selection.getNodes();
                if (nodes.length === 1 && $isImageNode(nodes[0])) {
                    isLink = !!(nodes[0] as any).__linkUrl;
                }
            }

            document.getElementById('link-btn')?.classList.toggle('active', isLink);

            // 1. Remove Formatting Status (Enabled if any formatting exists)
            const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
            if (clearBtn) {
                if ($isRangeSelection(selection)) {
                    const hasFormatting =
                        selection.hasFormat('bold') ||
                        selection.hasFormat('italic') ||
                        selection.hasFormat('underline') ||
                        selection.hasFormat('strikethrough') ||
                        selection.hasFormat('subscript') ||
                        selection.hasFormat('superscript') ||
                        selection.hasFormat('code') ||
                        isLink ||
                        $getSelectionStyleValueForProperty(selection, 'color') !== '' ||
                        $getSelectionStyleValueForProperty(selection, 'background-color') !== '';
                    clearBtn.disabled = !hasFormatting;
                } else {
                    clearBtn.disabled = true;
                }
            }

            // 2. Indentation Status
            const indentBtn = document.getElementById('indent-btn') as HTMLButtonElement;
            const outdentBtn = document.getElementById('outdent-btn') as HTMLButtonElement;
            if (indentBtn && outdentBtn) {
                if ($isRangeSelection(selection)) {
                    const anchorNode = selection.anchor.getNode();
                    const topElement = anchorNode.getTopLevelElement();

                    // Most top-level elements or list items can be indented
                    const canIndent = topElement !== null && !$isTableNode(topElement);
                    indentBtn.disabled = !canIndent;

                    // Can outdent if indent level > 0 or in a nested list
                    const listNode = $getNearestNodeOfType(anchorNode, ListNode);
                    const currentIndent = topElement?.getIndent?.() || 0;
                    const isNestedList = listNode !== null && listNode.getParent() instanceof ListNode;

                    outdentBtn.disabled = !(currentIndent > 0 || isNestedList);
                } else {
                    indentBtn.disabled = true;
                    outdentBtn.disabled = true;
                }
            }
        });
    };

    // A11y Announcer for Undo/Redo
    const announceAction = (message: string) => {
        const announcer = document.getElementById('announcer');
        if (announcer) {
            announcer.innerText = message;
            // Clear message after announcement
            setTimeout(() => {
                if (announcer.innerText === message) announcer.innerText = '';
            }, 3000);
        }
    };

    // --- History State Tracking ---
    internalEditor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload: boolean) => {
            const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
            if (undoBtn) {
                undoBtn.disabled = !payload;
            }
            return false;
        },
        COMMAND_PRIORITY_CRITICAL
    );

    internalEditor.registerCommand(
        CAN_REDO_COMMAND,
        (payload: boolean) => {
            const redoBtn = document.getElementById('redo-btn') as HTMLButtonElement;
            if (redoBtn) {
                redoBtn.disabled = !payload;
            }
            return false;
        },
        COMMAND_PRIORITY_CRITICAL
    );

    // Announcements
    internalEditor.registerCommand(
        UNDO_COMMAND,
        () => {
            announceAction('Undo performed');
            return false;
        },
        COMMAND_PRIORITY_CRITICAL
    );

    internalEditor.registerCommand(
        REDO_COMMAND,
        () => {
            announceAction('Redo performed');
            return false;
        },
        COMMAND_PRIORITY_CRITICAL
    );

    // Listen for selection changes and editor updates
    internalEditor.registerUpdateListener(() => {
        updateToolbar();
    });

    internalEditor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
            updateToolbar();
            return false;
        },
        COMMAND_PRIORITY_CRITICAL
    );
}
