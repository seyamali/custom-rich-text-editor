import {
    DecoratorNode,
    type EditorConfig,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from 'lexical';

export type SerializedFootnoteNode = Spread<
    {
        content: string;
        type: 'footnote';
        version: 1;
    },
    SerializedLexicalNode
>;

export class FootnoteNode extends DecoratorNode<HTMLElement> {
    __content: string;

    static getType(): string {
        return 'footnote';
    }

    static clone(node: FootnoteNode): FootnoteNode {
        return new FootnoteNode(node.__content, node.__key);
    }

    static importJSON(serializedNode: SerializedFootnoteNode): FootnoteNode {
        return $createFootnoteNode(serializedNode.content);
    }

    constructor(content: string, key?: NodeKey) {
        super(key);
        this.__content = content;
    }

    exportJSON(): SerializedFootnoteNode {
        return {
            content: this.__content,
            type: 'footnote',
            version: 1,
        };
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const sup = document.createElement('sup');
        sup.className = 'editor-footnote';
        sup.innerText = '[*]'; // Placeholder, will be updated or indexed
        sup.title = this.__content; // Simple tooltip
        sup.style.cursor = 'pointer';
        sup.style.color = '#007bff';

        // Add click listener to edit (handled via delegation or here if simple)
        // Since we are in vanilla createDOM, we can add a listener but communicating back to editor 
        // command might need a custom event or closure. 
        // For simplicity, we'll let the plugin handle clicks or rely on title hover.

        return sup;
    }

    updateDOM(prevNode: FootnoteNode, dom: HTMLElement): boolean {
        if (prevNode.__content !== this.__content) {
            dom.title = this.__content;
        }
        return false; // We don't need to replace the node usually
    }

    setContent(content: string) {
        const writable = this.getWritable();
        writable.__content = content;
    }

    getContent(): string {
        return this.__content;
    }

    decorate(): HTMLElement {
        const element = document.createElement('sup');
        element.className = 'editor-footnote';
        element.innerText = '[fn]';
        // We might want to use a dynamic index? 
        // For now, static marker to signify a footnote.
        return element;
    }
}

export function $createFootnoteNode(content: string): FootnoteNode {
    return new FootnoteNode(content);
}

export function $isFootnoteNode(node: LexicalNode | null | undefined): node is FootnoteNode {
    return node instanceof FootnoteNode;
}
