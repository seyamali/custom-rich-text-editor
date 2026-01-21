import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from 'lexical';


export const SourceViewPlugin = {
    /**
     * Converts the current editor state into a formatted HTML string.
     */
    getHtml: (editor: any): string => {
        let html = '';
        editor.getInternalEditor().update(() => {
            html = $generateHtmlFromNodes(editor.getInternalEditor());
        });
        return html;
    },

    /**
     * Replaces the entire editor content with new nodes parsed from an HTML string.
     */
    setHtml: (editor: any, html: string) => {
        editor.getInternalEditor().update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, 'text/html');
            const nodes = $generateNodesFromDOM(editor.getInternalEditor(), dom);

            const root = $getRoot();
            root.clear(); // Remove everything current
            root.append(...nodes); // Add the new HTML-based nodes
        });
    }
};