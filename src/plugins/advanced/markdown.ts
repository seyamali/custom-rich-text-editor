import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
    registerMarkdownShortcuts,
} from '@lexical/markdown';
import {
    COMMAND_PRIORITY_LOW,
    PASTE_COMMAND,
    createCommand,
    type LexicalCommand,
} from 'lexical';
import { type EditorPlugin } from '../../core/registry';
import { type EditorSDK } from '../../core/sdk';

export const IMPORT_MARKDOWN_COMMAND: LexicalCommand<string> = createCommand('IMPORT_MARKDOWN_COMMAND');
export const EXPORT_MARKDOWN_COMMAND: LexicalCommand<void> = createCommand('EXPORT_MARKDOWN_COMMAND');

export const MarkdownPlugin: EditorPlugin = {
    name: 'markdown',
    init: (sdk: EditorSDK) => {
        const editor = sdk.getLexicalEditor();

        // 0. Register live markdown shortcuts
        registerMarkdownShortcuts(editor, TRANSFORMERS);

        // 1. Register Import Command
        sdk.registerCommand(
            IMPORT_MARKDOWN_COMMAND,
            (markdown: string) => {
                editor.update(() => {
                    $convertFromMarkdownString(markdown, TRANSFORMERS);
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        // 2. Register Export Command
        sdk.registerCommand(
            EXPORT_MARKDOWN_COMMAND,
            () => {
                editor.getEditorState().read(() => {
                    const markdown = $convertToMarkdownString(TRANSFORMERS);

                    // Create a hidden textarea to copy to clipboard or show in a modal
                    // For now, let's just log it and offer it as an alert (simple solution)
                    // In a real app, we might trigger a download or open a modal
                    console.log('Exported Markdown:', markdown);

                    const blob = new Blob([markdown], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'document.md';
                    a.click();
                    URL.revokeObjectURL(url);

                    sdk.announce('Markdown exported successfully.');
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        // 3. Add Toolbar Buttons
        sdk.addToolbarButton({
            id: 'import-markdown-btn',
            label: 'Import MD',
            icon: '📥',
            tooltip: 'Import Markdown Content',
            onClick: () => {
                const markdown = window.prompt('Paste your Markdown content here:');
                if (markdown !== null) {
                    sdk.dispatchCommand(IMPORT_MARKDOWN_COMMAND, markdown);
                }
            }
        });

        sdk.addToolbarButton({
            id: 'export-markdown-btn',
            label: 'Export MD',
            icon: '📤',
            tooltip: 'Export as Markdown File',
            onClick: () => {
                sdk.dispatchCommand(EXPORT_MARKDOWN_COMMAND, undefined);
            }
        });

        // 4. Auto-detect Markdown on Paste
        sdk.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const data = event.clipboardData?.getData('text/plain');
                if (data && isMarkdown(data)) {
                    // Check if it's already being handled as HTML (rich text)
                    const htmlData = event.clipboardData?.getData('text/html');
                    if (!htmlData) {
                        event.preventDefault();
                        editor.update(() => {
                            $convertFromMarkdownString(data, TRANSFORMERS);
                        });
                        sdk.announce('Markdown auto-converted.');
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }
};

/**
 * Simple heuristic to check if a string looks like Markdown.
 */
function isMarkdown(text: string): boolean {
    const mdPatterns = [
        /^#\s/m,           // Headings
        /^\*\s/m,          // Lists
        /^-\s/m,           // Lists
        /^\d+\.\s/m,       // Numbered lists
        /^>\s/m,           // Blockquotes
        /\[.*\]\(.*\)/,    // Links
        /\*\*.*\*\*/,      // Bold
        /__.*__/,          // Bold
        /\*.*\*/,          // Italic
        /_.*_/,            // Italic
        /`.*`/,            // Inline code
        /^```/m,           // Code blocks
        /\|.*\|/,          // Tables
    ];

    return mdPatterns.some(pattern => pattern.test(text));
}
