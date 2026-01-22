import { registerCodeHighlighting } from '@lexical/code';
import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_LOW,
    COMMAND_PRIORITY_HIGH,
    createCommand,
    type LexicalCommand,
    KEY_TAB_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    $getNodeByKey,
    PASTE_COMMAND,
    $createParagraphNode,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createCodeBlockNode, $isCodeBlockNode } from './code-block-node';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';

export const INSERT_CODE_BLOCK_COMMAND: LexicalCommand<string | null> = createCommand('INSERT_CODE_BLOCK');
export const SET_CODE_LANGUAGE_COMMAND: LexicalCommand<{ nodeKey: string; language: string }> = createCommand('SET_CODE_LANGUAGE');
export const TOGGLE_LINE_NUMBERS_COMMAND: LexicalCommand<string> = createCommand('TOGGLE_LINE_NUMBERS');

// Supported programming languages
export const SUPPORTED_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'plaintext', label: 'Plain Text' },
];

export const CodeBlockPlugin: EditorPlugin = {
    name: 'code-blocks',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();

        // 1. Initialize syntax highlighting logic
        registerCodeHighlighting(editor);

        // 2. Register INSERT command with optional language
        sdk.registerCommand(
            INSERT_CODE_BLOCK_COMMAND,
            (language: string | null) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createCodeBlockNode(language));
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 3. Register SET_CODE_LANGUAGE command
        sdk.registerCommand(
            SET_CODE_LANGUAGE_COMMAND,
            (payload: { nodeKey: string; language: string }) => {
                editor.update(() => {
                    const node = $getNodeByKey(payload.nodeKey);
                    if ($isCodeBlockNode(node)) {
                        node.setLanguage(payload.language);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 4. Register TOGGLE_LINE_NUMBERS command
        sdk.registerCommand(
            TOGGLE_LINE_NUMBERS_COMMAND,
            (nodeKey: string) => {
                editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isCodeBlockNode(node)) {
                        node.setShowLineNumbers(!node.getShowLineNumbers());
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 5. Handle TAB key inside code blocks (insert tab character)
        sdk.registerCommand(
            KEY_TAB_COMMAND,
            (event: KeyboardEvent) => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return false;

                const anchorNode = selection.anchor.getNode();
                const parent = anchorNode.getParent();

                if ($isCodeBlockNode(parent)) {
                    event.preventDefault();

                    if (event.shiftKey) {
                        // Shift+Tab: Dedent (remove leading tab/spaces)
                        if ($isTextNode(anchorNode)) {
                            const text = anchorNode.getTextContent();
                            if (text.startsWith('\t')) {
                                const newText = text.substring(1);
                                const textNode = anchorNode.getWritable();
                                textNode.setTextContent(newText);
                            } else if (text.startsWith('    ')) {
                                const newText = text.substring(4);
                                const textNode = anchorNode.getWritable();
                                textNode.setTextContent(newText);
                            }
                        }
                    } else {
                        // Tab: Insert tab character
                        selection.insertText('\t');
                    }
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        // 6. Handle ENTER key inside code blocks (new line, maintain indentation, or exit)
        sdk.registerCommand(
            KEY_ENTER_COMMAND,
            (event: KeyboardEvent | null) => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return false;

                const anchorNode = selection.anchor.getNode();
                const parent = anchorNode.getParent();

                if ($isCodeBlockNode(parent)) {
                    event?.preventDefault();

                    // Get current line content
                    const text = anchorNode.getTextContent();
                    const offset = selection.anchor.offset;
                    const beforeCursor = text.substring(0, offset);
                    const afterCursor = text.substring(offset);

                    // Check if we're on an empty line (or only whitespace before cursor)
                    const isEmptyLine = beforeCursor.trim() === '' && afterCursor.trim() === '';

                    if (isEmptyLine && event?.shiftKey) {
                        // Shift+Enter on empty line: Exit code block and create paragraph
                        editor.update(() => {
                            const paragraph = $createParagraphNode();
                            parent.insertAfter(paragraph);
                            paragraph.select();
                        });
                        return true;
                    } else if (isEmptyLine && beforeCursor === '' && afterCursor === '') {
                        // Double Enter (empty line): Exit code block
                        editor.update(() => {
                            const paragraph = $createParagraphNode();
                            parent.insertAfter(paragraph);
                            paragraph.select();
                        });
                        return true;
                    } else {
                        // Normal Enter: Insert newline with indentation
                        const match = beforeCursor.match(/^(\s+)/);
                        const indent = match ? match[1] : '';
                        selection.insertText('\n' + indent);
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        // 7. Handle ESC key to exit code block
        sdk.registerCommand(
            KEY_ESCAPE_COMMAND,
            (event: KeyboardEvent) => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return false;

                const anchorNode = selection.anchor.getNode();
                const parent = anchorNode.getParent();

                if ($isCodeBlockNode(parent)) {
                    event.preventDefault();

                    editor.update(() => {
                        const paragraph = $createParagraphNode();
                        parent.insertAfter(paragraph);
                        paragraph.select();
                    });

                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        // 8. Prevent indent/outdent commands inside code blocks
        sdk.registerCommand(
            INDENT_CONTENT_COMMAND,
            () => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return false;

                const anchorNode = selection.anchor.getNode();
                const parent = anchorNode.getParent();

                if ($isCodeBlockNode(parent)) {
                    // Let TAB handle indentation in code blocks
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        sdk.registerCommand(
            OUTDENT_CONTENT_COMMAND,
            () => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return false;

                const anchorNode = selection.anchor.getNode();
                const parent = anchorNode.getParent();

                if ($isCodeBlockNode(parent)) {
                    // Let Shift+TAB handle dedentation in code blocks
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        // 9. Handle paste into code blocks (preserve formatting)
        sdk.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return false;

                const anchorNode = selection.anchor.getNode();
                const parent = anchorNode.getParent();

                if ($isCodeBlockNode(parent)) {
                    const text = event.clipboardData?.getData('text/plain');
                    if (text) {
                        event.preventDefault();
                        selection.insertText(text);
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        // 10. Support inline code formatting (Ctrl+Shift+C or Cmd+Shift+C)
        sdk.registerCommand(
            FORMAT_TEXT_COMMAND,
            (format: string) => {
                if (format === 'code') {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.formatText('code');
                    }
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        // 11. Add toolbar button with language selector
        sdk.addToolbarButton({
            id: 'insert-code-block-advanced',
            label: 'Code Block',
            icon: '{}',
            tooltip: 'Insert Code Block (with language selection)',
            onClick: () => {
                // This will be handled by the UI popover
                const language = prompt('Enter language (e.g., javascript, python) or leave empty:');
                sdk.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, language || null);
            }
        });

        console.log('✓ Code Blocks Plugin initialized with advanced features');
    }
};