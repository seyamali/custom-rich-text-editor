import {
    COMMAND_PRIORITY_CRITICAL,
    CONTROLLED_TEXT_INSERTION_COMMAND,
    $createTextNode,
    $getSelection,
    $isRangeSelection
} from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';
import { SuggestionNode } from './suggestion-node';

let isTracking = false;

export const TrackChangesPlugin: EditorPlugin = {
    name: 'track-changes',
    init: (sdk: EditorSDK) => {
        // Intercept Text Insertion
        sdk.registerCommand(
            CONTROLLED_TEXT_INSERTION_COMMAND,
            (eventOrText: any) => {
                if (!isTracking) return false;

                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const text = typeof eventOrText === 'string' ? eventOrText : eventOrText.data;
                    if (text) {
                        // Insert a suggestion node instead of plain text
                        const node = new SuggestionNode('insert', 'Current User', text);
                        selection.insertNodes([node]);
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );
    }
};

export const toggleTracking = () => {
    isTracking = !isTracking;
    return isTracking;
};

export function acceptSuggestion(node: SuggestionNode) {
    if (node.getSuggestionType() === 'insert') {
        const textNode = $createTextNode(node.getTextContent());
        node.replace(textNode);
    } else if (node.getSuggestionType() === 'delete') {
        node.remove();
    }
}

export function rejectSuggestion(node: SuggestionNode) {
    if (node.getSuggestionType() === 'insert') {
        node.remove();
    } else {
        const textNode = $createTextNode(node.getTextContent());
        node.replace(textNode);
    }
}