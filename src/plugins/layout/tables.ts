import {
    $createTableNodeWithDimensions,
    INSERT_TABLE_COMMAND,
    $insertTableRow__EXPERIMENTAL,
    $insertTableColumn__EXPERIMENTAL,
    $deleteTableRow__EXPERIMENTAL,
    $deleteTableColumn__EXPERIMENTAL
} from '@lexical/table';
import { $insertNodes, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const TablesPlugin: EditorPlugin = {
    name: 'tables',
    init: (sdk: EditorSDK) => {
        sdk.registerCommand(
            INSERT_TABLE_COMMAND,
            ({ columns, rows }: { columns: string; rows: string }) => {
                const tableNode = $createTableNodeWithDimensions(
                    Number(rows),
                    Number(columns),
                    true // include headers
                );
                $insertNodes([tableNode]);
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }
};

export const tableHandlers = {
    insertRow: (editor: any) => {
        editor.getInternalEditor().update(() => {
            $insertTableRow__EXPERIMENTAL();
        });
    },
    insertColumn: (editor: any) => {
        editor.getInternalEditor().update(() => {
            $insertTableColumn__EXPERIMENTAL();
        });
    },
    deleteRow: (editor: any) => {
        editor.getInternalEditor().update(() => {
            $deleteTableRow__EXPERIMENTAL();
        });
    },
    deleteColumn: (editor: any) => {
        editor.getInternalEditor().update(() => {
            $deleteTableColumn__EXPERIMENTAL();
        });
    }
};

export const insertTable = (editor: any) => {
    editor.getInternalEditor().dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
};