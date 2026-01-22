import {
    $getSelection,
    $isRangeSelection,
    createCommand,
    type LexicalCommand,
    COMMAND_PRIORITY_EDITOR,
    COPY_COMMAND,
    CUT_COMMAND,
    PASTE_COMMAND,
    $isNodeSelection,
    COMMAND_PRIORITY_LOW
} from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
    copyToClipboard,
    $insertDataTransferForRichText
} from '@lexical/clipboard';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const REMOVE_FORMATTING_COMMAND: LexicalCommand<void> = createCommand('REMOVE_FORMATTING_COMMAND');

export const ClipboardPlugin: EditorPlugin = {
    name: 'clipboard',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();

        // 1. Remove Formatting Logic
        sdk.registerCommand(
            REMOVE_FORMATTING_COMMAND,
            () => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    // 1. Clear inline styles (colors, fonts, etc.)
                    $patchStyleText(selection, {
                        'font-weight': null,
                        'font-style': null,
                        'text-decoration': null,
                        'color': null,
                        'background-color': null,
                        'font-family': null,
                        'font-size': null,
                    });

                    // 2. Clear core formats (Bold, Italic, etc.)
                    const formats = ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code'];
                    formats.forEach(f => {
                        if (selection.hasFormat(f as any)) {
                            selection.formatText(f as any);
                        }
                    });

                    // 3. Remove Links (Unlink)
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 2. High-Fidelity Copy Support
        editor.registerCommand(
            COPY_COMMAND,
            (event: ClipboardEvent) => {
                editor.getEditorState().read(() => {
                    const selection = $getSelection();
                    if (selection !== null) {
                        copyToClipboard(editor, event);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        // 3. High-Fidelity Cut Support
        editor.registerCommand(
            CUT_COMMAND,
            (event: ClipboardEvent) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if (selection !== null) {
                        copyToClipboard(editor, event);
                        if ($isRangeSelection(selection)) {
                            selection.removeText();
                        } else if ($isNodeSelection(selection)) {
                            selection.deleteNodes();
                        }
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        // 4. High-Fidelity Paste Support
        editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const dataTransfer = event.clipboardData;
                if (!dataTransfer) return false;

                // Stop native paste
                event.preventDefault();

                editor.update(() => {
                    const selection = $getSelection();
                    if (selection !== null) {
                        $insertDataTransferForRichText(dataTransfer, selection, editor);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        console.log("Global Clipboard Service (High-Fidelity) initialized");
    }
};