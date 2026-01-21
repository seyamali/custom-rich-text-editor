import { registerHistory, createEmptyHistoryState } from '@lexical/history';
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const HistoryPlugin: EditorPlugin = {
    name: 'history',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        // Register history with a 1000-step limit
        registerHistory(editor, createEmptyHistoryState(), 1000);
        console.log("History (Undo/Redo) initialized");
    }
};

export const HISTORY_COMMANDS = {
    UNDO: { command: UNDO_COMMAND, payload: undefined },
    REDO: { command: REDO_COMMAND, payload: undefined }
};