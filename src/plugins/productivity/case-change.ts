import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical';
import { EditorSDK } from '../../core/sdk';

export const CaseChange = {
    toUpperCase: (editor: LexicalEditor) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const textContent = selection.getTextContent();
                selection.insertText(textContent.toUpperCase());
            }
        });
    },

    toLowerCase: (editor: LexicalEditor) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const textContent = selection.getTextContent();
                selection.insertText(textContent.toLowerCase());
            }
        });
    },

    toTitleCase: (editor: LexicalEditor) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const textContent = selection.getTextContent();
                const titleCased = textContent.replace(
                    /\w\S*/g,
                    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                selection.insertText(titleCased);
            }
        });
    }
};

export const CaseChangePlugin = {
    name: 'case-change',
    init: (_sdk: EditorSDK) => {
        // No specific command registration needed as we use direct helpers
    }
};
