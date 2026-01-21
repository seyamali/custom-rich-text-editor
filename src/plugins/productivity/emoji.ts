import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical';
import { EditorSDK } from '../../core/sdk';

export const EmojiPlugin = {
    name: 'emoji',
    init: (_sdk: EditorSDK) => {
        // No specific command registration needed if we just insert text directly
        // via the UI handler, but we could register a command if we wanted to be strict.
        console.log('EmojiPlugin initialized');
    }
};

export const EmojiPicker = {
    insertEmoji: (editor: LexicalEditor, emoji: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.insertText(emoji);
            }
        });
    }
};
