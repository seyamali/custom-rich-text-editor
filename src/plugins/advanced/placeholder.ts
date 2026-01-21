import {
    $insertNodes,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    type LexicalCommand,
} from 'lexical';
import { $createPlaceholderNode, PlaceholderNode } from './placeholder-node';
import { EditorSDK } from '../../core/sdk';

export const INSERT_PLACEHOLDER_COMMAND: LexicalCommand<string> = createCommand(
    'INSERT_PLACEHOLDER_COMMAND',
);

export const PlaceholderPlugin = {
    name: 'placeholder',
    init: (sdk: EditorSDK) => {
        if (!sdk.hasNodes([PlaceholderNode])) {
            throw new Error('PlaceholderPlugin: PlaceholderNode not registered on editor');
        }

        sdk.registerCommand(
            INSERT_PLACEHOLDER_COMMAND,
            (name: string) => {
                sdk.update(() => {
                    const node = $createPlaceholderNode(name);
                    $insertNodes([node]);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    },
};
