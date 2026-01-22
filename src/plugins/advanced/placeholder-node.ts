import {
    DecoratorNode,
    type EditorConfig,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from 'lexical';

export type SerializedPlaceholderNode = Spread<
    {
        name: string;
    },
    SerializedLexicalNode
>;

export class PlaceholderNode extends DecoratorNode<HTMLElement> {
    __name: string;

    static getType(): string {
        return 'placeholder';
    }

    static clone(node: PlaceholderNode): PlaceholderNode {
        return new PlaceholderNode(node.__name, node.__key);
    }

    static importJSON(serializedNode: SerializedPlaceholderNode): PlaceholderNode {
        return new PlaceholderNode(serializedNode.name);
    }

    constructor(name: string, key?: NodeKey) {
        super(key);
        this.__name = name;
    }

    exportJSON(): SerializedPlaceholderNode {
        return {
            name: this.__name,
            type: 'placeholder',
            version: 1,
        };
    }


    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        span.className = 'editor-placeholder-field';
        span.innerText = `{{${this.__name}}}`;
        span.setAttribute('contenteditable', 'false');
        span.setAttribute('tabindex', '0');
        span.setAttribute('role', 'button');
        span.setAttribute('aria-label', `Merge field: ${this.__name}`);
        span.title = `Merge field: ${this.__name}`;
        // Styling for highlight, border, and tooltip
        span.style.background = '#f3f4f6';
        span.style.borderRadius = '6px';
        span.style.border = '1px dashed #cbd5e1';
        span.style.padding = '2px 6px';
        span.style.margin = '0 2px';
        span.style.cursor = 'pointer';
        span.style.userSelect = 'none';
        return span;
    }

    updateDOM(prevNode: PlaceholderNode, dom: HTMLElement): boolean {
        if (prevNode.__name !== this.__name) {
            dom.innerText = `{{${this.__name}}}`;
            dom.title = `Merge field: ${this.__name}`;
            dom.setAttribute('aria-label', `Merge field: ${this.__name}`);
        }
        return false;
    }

    decorate(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'editor-placeholder-inner';
        span.innerText = `{{${this.__name}}}`;
        span.setAttribute('contenteditable', 'false');
        span.setAttribute('tabindex', '0');
        span.setAttribute('role', 'button');
        span.setAttribute('aria-label', `Merge field: ${this.__name}`);
        span.title = `Merge field: ${this.__name}`;
        span.style.background = '#f3f4f6';
        span.style.borderRadius = '6px';
        span.style.border = '1px dashed #cbd5e1';
        span.style.padding = '2px 6px';
        span.style.margin = '0 2px';
        span.style.cursor = 'pointer';
        span.style.userSelect = 'none';
        return span;
    }

    getTextContent(): string {
        return `{{${this.__name}}}`;
    }
}

export function $createPlaceholderNode(name: string): PlaceholderNode {
    return new PlaceholderNode(name);
}

export function $isPlaceholderNode(node: LexicalNode | null | undefined): node is PlaceholderNode {
    return node instanceof PlaceholderNode;
}
