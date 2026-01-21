// 1. Fixed type-only imports using 'import type'
import { createEditor } from 'lexical';
import type { LexicalEditor } from 'lexical';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { registerHistory, createEmptyHistoryState } from '@lexical/history';
import { PluginRegistry, type EditorPlugin } from './registry';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ImageNode } from '../plugins/media/image-node';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { YouTubeNode } from '../plugins/advanced/youtube-node.ts';
import { HTMLSnippetNode } from '../plugins/advanced/html-snippet-node.ts';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { SuggestionNode } from '../plugins/collaboration/suggestion-node.ts';
import { PlaceholderNode } from '../plugins/advanced/placeholder-node.ts';
import { PageBreakNode } from '../plugins/page-layout/page-break-node';
import { FootnoteNode } from '../plugins/advanced/footnote-node';
import { TableOfContentsNode } from '../plugins/page-layout/toc-node';


export class MyUniversalEditor {
    private editor: LexicalEditor;
    private registry: PluginRegistry;

    constructor(element: HTMLDivElement) {

        this.editor = createEditor({
            namespace: 'MyCustomEditor',
            nodes: [
                HeadingNode,
                QuoteNode,
                ListNode,
                ListItemNode,
                HorizontalRuleNode,
                LinkNode,
                AutoLinkNode,
                ImageNode,
                TableNode,
                TableRowNode,
                TableCellNode,
                YouTubeNode,
                HTMLSnippetNode,
                CodeNode,
                CodeHighlightNode,
                CodeHighlightNode,
                SuggestionNode,
                PlaceholderNode,
                PageBreakNode,
                FootnoteNode,
                TableOfContentsNode
            ], // Add these here!
            theme: {
                heading: {
                    h1: 'editor-h1',
                    h2: 'editor-h2',
                    h3: 'editor-h3',
                    h4: 'editor-h4',
                    h5: 'editor-h5',
                    h6: 'editor-h6',
                },
                list: {
                    ul: 'editor-list-ul',
                    ol: 'editor-list-ol',
                    listitem: 'editor-listitem',
                },
                quote: 'editor-quote',
                hr: 'editor-hr',
                text: {
                    bold: 'editor-text-bold',
                    italic: 'editor-text-italic',
                    underline: 'editor-text-underline',
                    strikethrough: 'editor-text-strikethrough',
                    underlineStrikethrough: 'editor-text-underlineStrikethrough',
                    subscript: 'editor-text-subscript',
                    superscript: 'editor-text-superscript',
                    code: 'editor-text-code',
                },
                link: 'editor-link',
                autolink: 'editor-autolink',
                image: 'editor-image',
                table: 'editor-table',
                tableRow: 'editor-table-row',
                tableCell: 'editor-table-cell',
                tableCellHeader: 'editor-table-cell-header',
                code: 'editor-code',
                codeHighlight: {
                    at: 'editor-code-attr',
                    attr: 'editor-code-attr',
                    boolean: 'editor-code-boolean',
                    builtin: 'editor-code-builtin',
                    cdata: 'editor-code-comment',
                    char: 'editor-code-string',
                    class: 'editor-code-class',
                    'class-name': 'editor-code-class',
                    comment: 'editor-code-comment',
                    constant: 'editor-code-constant',
                    deleted: 'editor-code-deleted',
                    doctype: 'editor-code-comment',
                    entity: 'editor-code-entity',
                    function: 'editor-code-function',
                    important: 'editor-code-important',
                    inserted: 'editor-code-inserted',
                    keyword: 'editor-code-keyword',
                    namespace: 'editor-code-variable',
                    number: 'editor-code-number',
                    operator: 'editor-code-operator',
                    prolog: 'editor-code-comment',
                    property: 'editor-code-property',
                    punctuation: 'editor-code-punctuation',
                    regex: 'editor-code-regex',
                    selector: 'editor-code-selector',
                    string: 'editor-code-string',
                    symbol: 'editor-code-property',
                    tag: 'editor-code-tag',
                    url: 'editor-code-url',
                    variable: 'editor-code-variable'
                }
            },
            onError: (err) => console.error(err)
        });
        element.contentEditable = "true";

        // 3. Fixed the onError callback (second argument)
        this.editor._onError = (error: Error) => console.error(error);

        // Mount the editor to the HTML element
        this.editor.setRootElement(element);

        // Initialize Plugin Registry
        this.registry = new PluginRegistry(this.editor);

        // Initial basic setup (Essentials)
        registerRichText(this.editor);

        // 4. Fixed registerHistory: It requires a HistoryState object, 
        // passing 'undefined' is not allowed in strict mode.
        registerHistory(this.editor, createEmptyHistoryState(), 1000);

        console.log("Core Engine Initialized");
    }

    // Register a plugin
    use(plugin: EditorPlugin) {
        this.registry.register(plugin);
    }

    // Method to execute commands from your future toolbar
    execute(command: any, payload?: any) {
        this.editor.dispatchCommand(command, payload);
    }

    // Expose update method for external helpers
    update(updateFn: () => void) {
        this.editor.update(updateFn);
    }

    getInternalEditor(): LexicalEditor {
        return this.editor;
    }
}