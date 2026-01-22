import { DecoratorNode, type NodeKey, type SerializedLexicalNode, type Spread, type DOMConversionMap, type DOMExportOutput } from 'lexical';

export type SerializedStyleNode = Spread<{ css: string; }, SerializedLexicalNode>;

export class StyleNode extends DecoratorNode<HTMLElement> {
    __css: string;

    static getType(): string { return 'style-node'; }
    static clone(node: StyleNode): StyleNode { return new StyleNode(node.__css, node.__key); }

    constructor(css: string, key?: NodeKey) {
        super(key);
        this.__css = css;
    }

    static importJSON(serializedNode: SerializedStyleNode): StyleNode {
        return new StyleNode(serializedNode.css);
    }

    exportJSON(): SerializedStyleNode {
        return { type: 'style-node', version: 1, css: this.__css };
    }

    createDOM(): HTMLElement {
        const style = document.createElement('style');
        style.innerHTML = this.__css;
        return style;
    }

    updateDOM(): false { return false; }

    decorate(): HTMLElement {
        const style = document.createElement('style');
        style.innerHTML = this.__css;
        return style;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            style: () => ({
                conversion: (domNode: Node) => {
                    const style = domNode as HTMLStyleElement;
                    return { node: new StyleNode(style.innerHTML) };
                },
                priority: 0,
            }),
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('style');
        element.innerHTML = this.__css;
        return { element };
    }
}

export function $createStyleNode(css: string): StyleNode {
    return new StyleNode(css);
}
