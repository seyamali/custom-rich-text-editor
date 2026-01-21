import {
    createCommand,
    type LexicalCommand,
    $getSelection,
    $isRangeSelection,
    $getNodeByKey,
    type NodeKey,
    COMMAND_PRIORITY_EDITOR
} from 'lexical';
import { $createFootnoteNode, FootnoteNode } from './footnote-node';
import { EditorSDK } from '../../core/sdk';

export const INSERT_FOOTNOTE_COMMAND: LexicalCommand<string> = createCommand('INSERT_FOOTNOTE_COMMAND');
export const EDIT_FOOTNOTE_COMMAND: LexicalCommand<NodeKey> = createCommand('EDIT_FOOTNOTE_COMMAND');

export const FootnotePlugin = {
    name: 'footnote',
    init: (sdk: EditorSDK) => {
        if (!sdk.hasNodes([FootnoteNode])) {
            throw new Error('FootnotePlugin: FootnoteNode not registered on editor');
        }

        sdk.registerCommand(
            INSERT_FOOTNOTE_COMMAND,
            (content) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const footnote = $createFootnoteNode(content);
                    selection.insertNodes([footnote]);
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        sdk.registerCommand(
            EDIT_FOOTNOTE_COMMAND,
            (key) => {
                sdk.update(() => {
                    const node = $getNodeByKey(key);
                    if (node instanceof FootnoteNode) {
                        const newContent = prompt("Edit Footnote:", node.getContent());
                        if (newContent !== null) {
                            node.setContent(newContent);
                        }
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }
};
