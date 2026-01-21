import { $getSelection, $isRangeSelection, $isNodeSelection, COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from 'lexical';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $isImageNode } from '../../plugins/media/image-node';

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
        });
    };

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
