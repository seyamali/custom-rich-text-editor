import { FORMAT_TEXT_COMMAND, type TextFormatType, KEY_DOWN_COMMAND, COMMAND_PRIORITY_EDITOR, $getSelection, $isRangeSelection } from 'lexical';
import { registerRichText } from '@lexical/rich-text';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const BasicStylesPlugin: EditorPlugin = {
    name: 'basic-styles',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        // 1. Enable Rich Text support
        registerRichText(editor);

        // 2. Add Strikethrough shortcut (Ctrl+Shift+X)
        editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                const { code, ctrlKey, metaKey, shiftKey } = event;

                // Strikethrough (Ctrl+Shift+X)
                if ((ctrlKey || metaKey) && shiftKey && code === 'KeyX') {
                    sdk.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                    return true;
                }

                // Subscript (Ctrl+=)
                if ((ctrlKey || metaKey) && !shiftKey && (code === 'Equal' || code === 'Minus')) {
                    // Note: Code 'Equal' is '='. 
                    sdk.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
                    return true;
                }

                // Superscript (Ctrl+Shift++)
                if ((ctrlKey || metaKey) && shiftKey && (code === 'Equal' || code === 'Plus')) {
                    sdk.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
                    return true;
                }

                // Inline Code (Ctrl+Bucktick)
                if ((ctrlKey || metaKey) && code === 'Backquote') {
                    sdk.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                    return true;
                }

                return false;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 3. Mutual Exclusivity for Subscript/Superscript
        editor.registerCommand(
            FORMAT_TEXT_COMMAND,
            (format) => {
                if (format === 'subscript') {
                    // If applying subscript, remove superscript
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            if (selection.hasFormat('superscript')) {
                                selection.formatText('superscript');
                            }
                        }
                    });
                } else if (format === 'superscript') {
                    // If applying superscript, remove subscript
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            if (selection.hasFormat('subscript')) {
                                selection.formatText('subscript');
                            }
                        }
                    });
                }
                return false; // Let the default handler actually apply the new format
            },
            COMMAND_PRIORITY_EDITOR
        );

        console.log("Basic Styles (Bold, Italic, Sub/Sup, etc.) initialized");
    }
};

export const FORMAT_COMMANDS = {
    BOLD: { command: FORMAT_TEXT_COMMAND, payload: 'bold' as TextFormatType },
    ITALIC: { command: FORMAT_TEXT_COMMAND, payload: 'italic' as TextFormatType },
    UNDERLINE: { command: FORMAT_TEXT_COMMAND, payload: 'underline' as TextFormatType },
    STRIKETHROUGH: { command: FORMAT_TEXT_COMMAND, payload: 'strikethrough' as TextFormatType },
    SUBSCRIPT: { command: FORMAT_TEXT_COMMAND, payload: 'subscript' as TextFormatType },
    SUPERSCRIPT: { command: FORMAT_TEXT_COMMAND, payload: 'superscript' as TextFormatType },
    CODE: { command: FORMAT_TEXT_COMMAND, payload: 'code' as TextFormatType },
};