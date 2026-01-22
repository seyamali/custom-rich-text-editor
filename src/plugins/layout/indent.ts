import {
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    KEY_TAB_COMMAND,
    COMMAND_PRIORITY_EDITOR,
    $getSelection,
    $isRangeSelection,
    $isNodeSelection
} from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const IndentPlugin: EditorPlugin = {
    name: 'indent',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();

        // Handle Tab for Indentation
        editor.registerCommand(
            KEY_TAB_COMMAND,
            (event: KeyboardEvent) => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
                    return false;
                }

                event.preventDefault();
                editor.dispatchCommand(
                    event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
                    undefined
                );
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        console.log("Indentation Controls (Tab/Shift+Tab) initialized");
    }
};
