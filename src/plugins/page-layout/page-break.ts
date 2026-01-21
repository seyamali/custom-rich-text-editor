import {
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    type LexicalCommand,
    $getSelection,
    $isRangeSelection
} from 'lexical';
import { $createPageBreakNode, PageBreakNode } from './page-break-node';
import { EditorSDK } from '../../core/sdk';

export const INSERT_PAGE_BREAK_COMMAND: LexicalCommand<undefined> = createCommand(
    'INSERT_PAGE_BREAK_COMMAND'
);

export const PageBreakPlugin = {
    name: 'page-break',
    init: (sdk: EditorSDK) => {
        if (!sdk.hasNodes([PageBreakNode])) {
            throw new Error('PageBreakPlugin: PageBreakNode not registered on editor');
        }

        sdk.registerCommand(
            INSERT_PAGE_BREAK_COMMAND,
            () => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const pageBreak = $createPageBreakNode();
                    selection.insertNodes([pageBreak]);
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }
};
