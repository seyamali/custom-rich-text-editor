import {
    $getRoot,
    $getSelection,
    $isRangeSelection,
    $createRangeSelection,
    $setSelection,
    TextNode,
    type LexicalEditor
} from 'lexical';

export const FindReplace = {
    /**
     * Finds the next occurrence of text after the current selection.
     * Circles back to the beginning if end is reached.
     */
    findNext: (editor: LexicalEditor, searchText: string) => {
        if (!searchText) return;

        editor.update(() => {
            const root = $getRoot();
            const textNodes = root.getAllTextNodes();
            let matchFound = false;

            // 1. Get current selection pivot to start searching from
            const selection = $getSelection();
            let startNodeIndex = 0;
            let startOffset = 0;

            if ($isRangeSelection(selection)) {
                // Approximate starting point based on anchor
                const anchor = selection.anchor;
                const nodeKey = anchor.key;
                startNodeIndex = textNodes.findIndex(n => n.getKey() === nodeKey);
                if (startNodeIndex === -1) startNodeIndex = 0;
                startOffset = anchor.offset + 1; // Start searching AFTER the current cursor
            }

            // 2. Search forward from current position
            for (let i = startNodeIndex; i < textNodes.length; i++) {
                const node = textNodes[i];
                const textContent = node.getTextContent();
                // Determine where to start searching in this node
                const searchFrom = (i === startNodeIndex) ? startOffset : 0;

                const index = textContent.toLowerCase().indexOf(searchText.toLowerCase(), searchFrom);

                if (index !== -1) {
                    FindReplace.selectMatch(editor, node, index, searchText.length);
                    matchFound = true;
                    return; // Stop after finding one
                }
            }

            // 3. Loop back to beginning if not found yet (Circle back)
            if (!matchFound) {
                for (let i = 0; i <= startNodeIndex; i++) {
                    const node = textNodes[i];
                    const textContent = node.getTextContent();
                    // Stop searching at the original start point to prevent infinite loop
                    const searchLimit = (i === startNodeIndex) ? startOffset : textContent.length;

                    // We need to slice or check index manually to ensure we don't cross the "searchFrom" barrier of the first loop effectively
                    // But simpler: just search the whole node. If it's the startNode, we only search up to startOffset.
                    // Actually, indexOf doesn't support "end index". We check result.

                    const index = textContent.toLowerCase().indexOf(searchText.toLowerCase());
                    if (index !== -1 && (i !== startNodeIndex || index < searchLimit)) {
                        FindReplace.selectMatch(editor, node, index, searchText.length);
                        return;
                    }
                }
            }

            // alert('No matches found.'); // Optional feedback
        });
    },

    /**
     * Helper to highlight/select the text found.
     */
    selectMatch: (editor: LexicalEditor, node: TextNode, index: number, length: number) => {
        const selection = $createRangeSelection();
        selection.setTextNodeRange(node, index, node, index + length);
        $setSelection(selection);

        // Scroll found node into view
        const element = editor.getElementByKey(node.getKey());
        if (element) {
            element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    },

    /**
     * Replaces the currently selected text IF it matches the search query,
     * then finds the next match.
     */
    replace: (editor: LexicalEditor, searchText: string, replaceText: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const text = selection.getTextContent();
                // Check if current selection matches search text (case insensitive)
                if (text.toLowerCase() === searchText.toLowerCase()) {
                    selection.insertText(replaceText);
                }
            }
        });
        // Find next immediately after
        setTimeout(() => FindReplace.findNext(editor, searchText), 0);
    },

    /**
     * Replaces ALL occurrences in the document.
     */
    replaceAll: (editor: LexicalEditor, searchText: string, replaceText: string) => {
        editor.update(() => {
            const root = $getRoot();
            const textNodes = root.getAllTextNodes();
            let count = 0;

            textNodes.forEach(node => {
                const text = node.getTextContent();
                const regex = new RegExp(escapeRegExp(searchText), 'gi'); // Global, Case-insensitive

                if (regex.test(text)) {
                    const newText = text.replace(regex, replaceText);
                    node.setTextContent(newText);
                    count++;
                }
            });
            console.log(`Replaced ${count} occurrences.`);
        });
    }
};

// Helper for regex safety
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
