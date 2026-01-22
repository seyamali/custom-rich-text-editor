import { TOGGLE_LINK_COMMAND, registerAutoLink, toggleLink } from '@lexical/link';
import { COMMAND_PRIORITY_EDITOR, $getSelection, $isRangeSelection } from 'lexical';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

// Standard URL Matcher for Auto-detection
const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const LinksPlugin: EditorPlugin = {
    name: 'links',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        // Fix: Explicitly provide 'matchers' and an empty 'changeHandlers'
        registerAutoLink(editor, {
            matchers: [
                (text: string) => {
                    const match = URL_MATCHER.exec(text);
                    if (match) {
                        // Optimization: If the match is preceded by a Zero-Width Space (\u200B),
                        // it means the user has explicitly unlinked this URL. 
                        // We should not auto-link it again.
                        if (match.index > 0 && text[match.index - 1] === '\u200B') {
                            return null;
                        }

                        return {
                            index: match.index,
                            length: match[0].length,
                            text: match[0],
                            url: match[0].startsWith('http') ? match[0] : `https://${match[0]}`,
                        };
                    }
                    return null;
                },
            ],
            changeHandlers: [],
        });

        // Register the command listener for TOGGLE_LINK_COMMAND
        sdk.registerCommand(
            TOGGLE_LINK_COMMAND,
            (payload: any) => {
                const selection = $getSelection();
                if (payload === null) {
                    toggleLink(null);
                    // Add an invisible marker to prevent AutoLink from re-triggering on this text.
                    // We collapse to start to ensure we don't overwrite the existing text.
                    if ($isRangeSelection(selection)) {
                        if (selection.isBackward()) {
                            selection.anchor.set(selection.focus.key, selection.focus.offset, selection.focus.type);
                        } else {
                            selection.focus.set(selection.anchor.key, selection.anchor.offset, selection.anchor.type);
                        }
                        selection.insertText('\u200B');
                    }
                    return true;
                } else if (typeof payload === 'string') {
                    toggleLink(payload);
                    return true;
                } else {
                    const { url, target, rel, title } = payload;
                    toggleLink(url, { target, rel, title });
                    return true;
                }
            },
            COMMAND_PRIORITY_EDITOR,
        );

        console.log("Link & Auto-link support initialized");
    }
};

export const insertLink = (editor: any) => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) {
        editor.getInternalEditor().dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
};