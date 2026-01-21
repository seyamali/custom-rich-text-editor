import { DecoratorNode, type NodeKey, type SerializedLexicalNode, type Spread } from 'lexical';

export type SerializedHTMLSnippetNode = Spread<{ html: string; }, SerializedLexicalNode>;

export class HTMLSnippetNode extends DecoratorNode<HTMLElement> {
    __html: string;

    static getType(): string { return 'html-snippet'; }
    static clone(node: HTMLSnippetNode): HTMLSnippetNode { return new HTMLSnippetNode(node.__html, node.__key); }

    constructor(html: string, key?: NodeKey) {
        super(key);
        this.__html = html;
    }

    static importJSON(serializedNode: SerializedHTMLSnippetNode): HTMLSnippetNode {
        return new HTMLSnippetNode(serializedNode.html);
    }

    exportJSON(): SerializedHTMLSnippetNode {
        return { type: 'html-snippet', version: 1, html: this.__html };
    }

    createDOM(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'editor-html-snippet';
        const content = this.decorate();
        div.appendChild(content);
        return div;
    }

    updateDOM(): false { return false; }

    decorate(): HTMLElement {
        const container = document.createElement('div');
        container.innerHTML = this.__html; // Be careful: Ensure user trust for raw HTML
        return container;
    }
}

export function $createHTMLSnippetNode(html: string): HTMLSnippetNode {
    return new HTMLSnippetNode(html);
}