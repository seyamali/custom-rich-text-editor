import {
    $getSelection,
    $isRangeSelection,
    createCommand,
    type LexicalCommand,
    $createParagraphNode,
    COMMAND_PRIORITY_EDITOR
} from 'lexical';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

// This is the missing exported member
export const REMOVE_FORMATTING_COMMAND: LexicalCommand<void> = createCommand('REMOVE_FORMATTING_COMMAND');

export const ClipboardPlugin: EditorPlugin = {
    name: 'clipboard',
    init: (sdk: EditorSDK) => {
        // Register the listener for the command
        sdk.registerCommand(
            REMOVE_FORMATTING_COMMAND,
            () => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    // 1. Clear inline styles
                    $patchStyleText(selection, {
                        'font-weight': null,
                        'font-style': null,
                        'text-decoration': null,
                        'color': null,
                        'background-color': null,
                    });

                    // 2. Reset block types to paragraph
                    $setBlocksType(selection, () => $createParagraphNode());
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }
};