import { ElementNode, type EditorConfig, type NodeKey, type DOMConversionMap, type DOMExportOutput, type SerializedElementNode, type Spread } from 'lexical';

export type SerializedSpanNode = Spread<{
    attributes: Record<string, string>;
}, SerializedElementNode>;

export class SpanNode extends ElementNode {
    __attributes: Record<string, string>;

    constructor(attributes: Record<string, string> = {}, key?: NodeKey) {
        super(key);
        this.__attributes = attributes;
    }

    static getType(): string { return 'span'; }

    static clone(node: SpanNode): SpanNode {
        return new SpanNode({ ...node.__attributes }, node.__key);
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const element = document.createElement('span');
        Object.entries(this.__attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    updateDOM(prevNode: SpanNode, dom: HTMLElement): boolean {
        if (JSON.stringify(this.__attributes) !== JSON.stringify(prevNode.__attributes)) {
            Array.from(dom.attributes).forEach(attr => dom.removeAttribute(attr.name));
            Object.entries(this.__attributes).forEach(([key, value]) => {
                dom.setAttribute(key, value);
            });
        }
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            span: (_node: Node) => ({
                conversion: (domNode: Node) => {
                    const el = domNode as HTMLElement;
                    const attributes: Record<string, string> = {};
                    Array.from(el.attributes).forEach(attr => {
                        attributes[attr.name] = attr.value;
                    });
                    // ONLY use SpanNode if it has attributes, otherwise let text be flat
                    if (Object.keys(attributes).length > 0) {
                        const node = new SpanNode(attributes);
                        return { node };
                    }
                    return null;
                },
                priority: 1,
            }),
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('span');
        Object.entries(this.__attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return { element };
    }

    static importJSON(serializedNode: SerializedSpanNode): SpanNode {
        const node = new SpanNode(serializedNode.attributes);
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedSpanNode {
        return {
            ...super.exportJSON(),
            attributes: this.__attributes,
            type: 'span',
            version: 1,
        };
    }

    canBeEmpty(): boolean { return false; }
    isInline(): boolean { return true; }
}
