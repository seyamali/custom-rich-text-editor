import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    ListNode,
    registerList
} from '@lexical/list';
import {
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    KEY_DOWN_COMMAND,
    COMMAND_PRIORITY_EDITOR,
    $getSelection,
    $isRangeSelection,
    type LexicalEditor
} from 'lexical';
import { $getNearestNodeOfType } from '@lexical/utils';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const ListsPlugin: EditorPlugin = {
    name: 'lists',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        // This single line handles the logic for Tab, Shift+Tab, 
        // and connects the indent/outdent commands to list behavior.
        registerList(editor);

        // Register Keyboard Shortcuts
        editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                const { code, ctrlKey, metaKey, shiftKey } = event;
                const isModifier = ctrlKey || metaKey;

                if (isModifier && shiftKey) {
                    // Numbered List (Ctrl+Shift+7)
                    if (code === 'Digit7') {
                        toggleList(editor, 'number');
                        return true;
                    }
                    // Bulleted List (Ctrl+Shift+8)
                    if (code === 'Digit8') {
                        toggleList(editor, 'bullet');
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_EDITOR
        );

        console.log("Lists logic registered with shortcuts");
    }
};

export const toggleList = (editor: LexicalEditor, type: 'bullet' | 'number') => {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const listNode = $getNearestNodeOfType(anchorNode, ListNode);

            if (listNode && listNode.getListType() === type) {
                // If already this list type, remove it
                editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            } else {
                // Otherwise apply it
                editor.dispatchCommand(
                    type === 'bullet' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
                    undefined
                );
            }
        }
    });
};

export const LIST_COMMANDS = {
    BULLET: { command: INSERT_UNORDERED_LIST_COMMAND, payload: undefined },
    NUMBER: { command: INSERT_ORDERED_LIST_COMMAND, payload: undefined },
    INDENT: { command: INDENT_CONTENT_COMMAND, payload: undefined },
    OUTDENT: { command: OUTDENT_CONTENT_COMMAND, payload: undefined }
};