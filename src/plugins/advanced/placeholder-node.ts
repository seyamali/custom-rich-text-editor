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
        return span;
    }

    updateDOM(prevNode: PlaceholderNode, dom: HTMLElement): boolean {
        if (prevNode.__name !== this.__name) {
            dom.innerText = `{{${this.__name}}}`;
        }
        return false;
    }

    decorate(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'editor-placeholder-inner';
        span.innerText = this.__name;
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
