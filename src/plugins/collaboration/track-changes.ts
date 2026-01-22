import {
    COMMAND_PRIORITY_CRITICAL,
    CONTROLLED_TEXT_INSERTION_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    $createTextNode,
    $getSelection,
    $isRangeSelection,
    createCommand,
    type LexicalCommand,
    COMMAND_PRIORITY_EDITOR,
    $isTextNode,
} from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';
import { SuggestionNode } from './suggestion-node';

// Commands
export const TOGGLE_TRACK_CHANGES_COMMAND: LexicalCommand<void> = createCommand('TOGGLE_TRACK_CHANGES');
export const ACCEPT_SUGGESTION_COMMAND: LexicalCommand<string> = createCommand('ACCEPT_SUGGESTION');
export const REJECT_SUGGESTION_COMMAND: LexicalCommand<string> = createCommand('REJECT_SUGGESTION');

let isTracking = false;

export const TrackChangesPlugin: EditorPlugin = {
    name: 'track-changes',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();

        // 1. Toggle Tracking
        sdk.registerCommand(
            TOGGLE_TRACK_CHANGES_COMMAND,
            () => {
                isTracking = !isTracking;
                console.log(`[Track Changes] ${isTracking ? 'ENABLED' : 'DISABLED'}`);
                window.dispatchEvent(new CustomEvent('track-changes-toggled', { detail: isTracking }));
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 2. Intercept Text Insertion
        sdk.registerCommand(
            CONTROLLED_TEXT_INSERTION_COMMAND,
            (eventOrText: any) => {
                if (!isTracking) return false;

                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const text = typeof eventOrText === 'string' ? eventOrText : eventOrText.data;
                    if (text) {
                        const node = new SuggestionNode('insert', 'Current User', text);
                        selection.insertNodes([node]);
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        // 3. Intercept Deletions (Backpace/Delete)
        const handleDeletion = (_event: KeyboardEvent) => {
            if (!isTracking) return false;

            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return false;

            // If it's a selection collapse, we 'delete' the character or wrap it
            // For a premium experience, we don't remove text, we mark it as deleted.
            if (selection.isCollapsed()) {
                // This is complex to implement generically without custom logic for segments.
                // Simple implementation: intercept the command and convert selected text to 'delete' suggestion.
                return false; // Fallback to default for now, or implement character-by-character wrap
            } else {
                // Wrap the entire selection as a 'delete' suggestion
                const nodes = selection.extract();
                nodes.forEach(node => {
                    if ($isTextNode(node) && !(node instanceof SuggestionNode)) {
                        const suggestion = new SuggestionNode('delete', 'Current User', node.getTextContent());
                        node.replace(suggestion);
                    }
                });
                return true;
            }
        };

        sdk.registerCommand(KEY_BACKSPACE_COMMAND, handleDeletion, COMMAND_PRIORITY_CRITICAL);
        sdk.registerCommand(KEY_DELETE_COMMAND, handleDeletion, COMMAND_PRIORITY_CRITICAL);

        // 4. Intercept Formatting
        sdk.registerCommand(
            createCommand('FORMAT_TEXT_COMMAND'), // FORMAT_TEXT_COMMAND is a string/command type
            (_format: string) => {
                if (!isTracking) return false;

                const selection = $getSelection();
                if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                    const nodes = selection.extract();
                    nodes.forEach(node => {
                        if ($isTextNode(node) && !(node instanceof SuggestionNode)) {
                            const suggestion = new SuggestionNode('format', 'Current User', node.getTextContent());
                            // We could also store the intended format in metadata
                            node.replace(suggestion);
                        }
                    });
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        // 5. Accept/Reject Logic
        sdk.registerCommand(
            ACCEPT_SUGGESTION_COMMAND,
            (nodeKey: string) => {
                editor.update(() => {
                    // Wait, we need the actual LexicalNode by key
                    const lexicalNode = sdk.getLexicalEditor().getEditorState()._nodeMap.get(nodeKey);

                    if (lexicalNode instanceof SuggestionNode) {
                        if (lexicalNode.getSuggestionType() === 'insert') {
                            const textNode = $createTextNode(lexicalNode.getTextContent());
                            lexicalNode.replace(textNode);
                        } else {
                            lexicalNode.remove();
                        }
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        sdk.registerCommand(
            REJECT_SUGGESTION_COMMAND,
            (nodeKey: string) => {
                editor.update(() => {
                    const lexicalNode = sdk.getLexicalEditor().getEditorState()._nodeMap.get(nodeKey);
                    if (lexicalNode instanceof SuggestionNode) {
                        if (lexicalNode.getSuggestionType() === 'insert') {
                            lexicalNode.remove();
                        } else {
                            const textNode = $createTextNode(lexicalNode.getTextContent());
                            lexicalNode.replace(textNode);
                        }
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 5. Toolbar Button
        sdk.addToolbarButton({
            id: 'track-changes-toggle',
            label: 'Track',
            icon: '📝',
            tooltip: 'Toggle Track Changes / Suggest Edits',
            onClick: () => {
                sdk.dispatchCommand(TOGGLE_TRACK_CHANGES_COMMAND, undefined);
            }
        });
    }
};

export const isTrackingEnabled = () => isTracking;

export const toggleTracking = () => {
    isTracking = !isTracking;
    window.dispatchEvent(new CustomEvent('track-changes-toggled', { detail: isTracking }));
    return isTracking;
};
