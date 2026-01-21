import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ARROW_UP_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
} from 'lexical';

import { SlashMenuUI, type SlashCommand } from './slash-menu-ui';
import { EditorSDK } from '../../core/sdk';

// Command Implementations
import { setBlockType, insertHorizontalRule } from '../layout/headings';
import { LIST_COMMANDS } from '../layout/lists';
import { insertImage } from '../media/images';
import { insertTable } from '../layout/tables';
import { INSERT_CODE_BLOCK_COMMAND } from '../advanced/code-blocks';
import { MediaEmbedPlugin } from '../advanced/media-embed';
import { INSERT_PLACEHOLDER_COMMAND } from '../advanced/placeholder';

const SLASH_COMMANDS: SlashCommand[] = [
    {
        label: 'Paragraph',
        icon: '¶',
        execute: (editor) => setBlockType(editor, 'paragraph')
    },
    {
        label: 'Heading 1',
        icon: 'H1',
        execute: (editor) => setBlockType(editor, 'h1')
    },
    {
        label: 'Heading 2',
        icon: 'H2',
        execute: (editor) => setBlockType(editor, 'h2')
    },
    {
        label: 'Bullet List',
        icon: '•',
        execute: (editor) => editor.dispatchCommand(LIST_COMMANDS.BULLET.command, undefined)
    },
    {
        label: 'Numbered List',
        icon: '1.',
        execute: (editor) => editor.dispatchCommand(LIST_COMMANDS.NUMBER.command, undefined)
    },
    {
        label: 'Divider',
        icon: '—',
        execute: (editor) => insertHorizontalRule(editor)
    },
    {
        label: 'Code Block',
        icon: '{}',
        execute: (editor) => editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, undefined)
    },
    {
        label: 'Image',
        icon: '🖼️',
        execute: (editor) => insertImage(editor)
    },
    {
        label: 'Table',
        icon: '📅',
        execute: (editor) => insertTable(editor)
    },
    {
        label: 'YouTube',
        icon: '📹',
        execute: (editor) => MediaEmbedPlugin.insertYouTube(editor)
    },
    {
        label: 'Placeholder',
        icon: '🏷️',
        execute: (editor) => editor.dispatchCommand(INSERT_PLACEHOLDER_COMMAND, 'Custom')
    }
];

export const SlashCommandPlugin = {
    name: 'slash-commands',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();
        const menuUI = new SlashMenuUI(editor, SLASH_COMMANDS);

        // Define a way to track the slash trigger
        let matchOffset = -1;
        let matchNodeKey: string | null = null;

        // Listen to updates to detect '/'
        sdk.registerUpdateListener(({ editorState }: any) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
                    menuUI.hide();
                    return;
                }

                const node = selection.anchor.getNode();
                const offset = selection.anchor.offset;
                const text = node.getTextContent();

                // Check if we are typing a slash command
                // Pattern: Starts with '/' or space + '/'
                // We want to capture text AFTER the slash as the query

                const lastSlash = text.lastIndexOf('/', offset - 1);

                if (lastSlash !== -1) {
                    // Make sure it's either the start of the node OR preceded by space
                    const isStart = lastSlash === 0;
                    const precededBySpace = lastSlash > 0 && text[lastSlash - 1] === ' ';

                    if (isStart || precededBySpace) {
                        const query = text.substring(lastSlash + 1, offset);
                        // Do not allow spaces in query for now (simplifies things)
                        if (!query.includes(' ')) {
                            matchOffset = lastSlash;
                            matchNodeKey = node.getKey();

                            // Calculate position for menu
                            const domElement = sdk.getElementByKey(node.getKey());
                            if (domElement) {
                                // Fallback positioning using window selection (simplest for now)
                                const nativeSelection = window.getSelection();
                                if (nativeSelection && nativeSelection.rangeCount > 0) {
                                    const rect = nativeSelection.getRangeAt(0).getBoundingClientRect();
                                    menuUI.show(rect, query);
                                    return;
                                }
                            }
                        }
                    }
                }

                menuUI.hide();
            });
        });

        // Intercept Keys
        sdk.registerCommand(
            KEY_ARROW_UP_COMMAND,
            (payload) => {
                if (menuUI.isVisible) {
                    menuUI.moveUp();
                    payload.preventDefault();
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        sdk.registerCommand(
            KEY_ARROW_DOWN_COMMAND,
            (payload) => {
                if (menuUI.isVisible) {
                    menuUI.moveDown();
                    payload.preventDefault();
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        sdk.registerCommand(
            KEY_ENTER_COMMAND,
            (payload) => {
                if (menuUI.isVisible) {
                    const action = menuUI.selectAction();
                    if (action) {
                        // We need to delete the slash command text before executing!
                        sdk.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection) && matchNodeKey) {
                                // Delete the query + slash
                                // Simplified approach:
                                const anchor = selection.anchor;
                                if (anchor.key === matchNodeKey) {
                                    // Remove from matchOffset to current anchor offset
                                    const deleteSize = anchor.offset - matchOffset;
                                    selection.anchor.offset = matchOffset;
                                    selection.focus.offset = matchOffset + deleteSize;
                                    selection.removeText();
                                }
                            }
                        });

                        // Execute action
                        action.execute(editor);
                        menuUI.hide();
                        payload?.preventDefault();
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        sdk.registerCommand(
            KEY_ESCAPE_COMMAND,
            () => {
                if (menuUI.isVisible) {
                    menuUI.hide();
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }
};
