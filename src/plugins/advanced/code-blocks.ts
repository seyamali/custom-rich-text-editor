import { $createCodeNode, registerCodeHighlighting } from '@lexical/code';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const INSERT_CODE_BLOCK_COMMAND: LexicalCommand<void> = createCommand();

export const CodeBlockPlugin: EditorPlugin = {
    name: 'code-blocks',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        // 1. Initialize syntax highlighting logic
        registerCodeHighlighting(editor);

        // 2. Register the toggle command
        sdk.registerCommand(
            INSERT_CODE_BLOCK_COMMAND,
            () => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createCodeNode());
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }
};