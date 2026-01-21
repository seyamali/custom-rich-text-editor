import { $createHeadingNode, $createQuoteNode, $isQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getSelection, $isRangeSelection, $createParagraphNode, type LexicalEditor, KEY_DOWN_COMMAND, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

export const HeadingsPlugin: EditorPlugin = {
    name: 'headings',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();

        // Register Keyboard Shortcuts (Ctrl+Alt+1..6)
        editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                const { code, ctrlKey, metaKey, altKey } = event;
                const isModifier = ctrlKey || metaKey;

                if (isModifier && altKey) {
                    if (code === 'Digit0') {
                        setBlockType(editor, 'paragraph');
                        return true;
                    }
                    const match = code.match(/^Digit([1-6])$/);
                    if (match) {
                        const level = parseInt(match[1]) as 1 | 2 | 3 | 4 | 5 | 6;
                        setBlockType(editor, `h${level}` as HeadingTagType);
                        return true;
                    }
                }

                // Block Quote (Ctrl+Shift+Q)
                if (isModifier && event.shiftKey && code === 'KeyQ') {
                    toggleBlockQuote(editor);
                    return true;
                }

                return false;
            },
            COMMAND_PRIORITY_EDITOR
        );

        console.log("Headings, Quotes & HR initialized");
    }
};

export const setBlockType = (editor: any, type: HeadingTagType | 'quote' | 'paragraph') => {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            if (type === 'quote') {
                $setBlocksType(selection, () => $createQuoteNode());
            } else if (type === 'paragraph') {
                // This allows the user to go back to normal text
                $setBlocksType(selection, () => $createParagraphNode());
            } else {
                $setBlocksType(selection, () => $createHeadingNode(type));
            }
        }
    });
};

export const toggleBlockQuote = (editor: LexicalEditor) => {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root'
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow();

            if ($isQuoteNode(element)) {
                $setBlocksType(selection, () => $createParagraphNode());
            } else {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        }
    });
};

export const insertHorizontalRule = (editor: LexicalEditor) => {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const hrNode = $createHorizontalRuleNode();
            // This inserts the divider at the cursor position
            selection.insertNodes([hrNode]);
        }
    });
};