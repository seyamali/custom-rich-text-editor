import { ParagraphNode, type SerializedParagraphNode } from 'lexical';
import { type EditorConfig, type NodeKey, type DOMConversionMap, type DOMExportOutput, type Spread } from 'lexical';

export type SerializedCustomParagraphNode = Spread<{
    attributes: Record<string, string>;
}, SerializedParagraphNode>;

export class CustomParagraphNode extends ParagraphNode {
    __attributes: Record<string, string>;

    constructor(attributes: Record<string, string> = {}, key?: NodeKey) {
        super(key);
        this.__attributes = attributes;
    }

    static getType(): string { return 'custom-paragraph'; }
    static clone(node: CustomParagraphNode): CustomParagraphNode {
        return new CustomParagraphNode({ ...node.__attributes }, node.__key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        Object.entries(this.__attributes).forEach(([k, v]) => dom.setAttribute(k, v));
        return dom;
    }

    exportDOM(editor: any): DOMExportOutput {
        const { element } = super.exportDOM(editor);
        if (element instanceof HTMLElement) {
            Object.entries(this.__attributes).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    element.setAttribute(k, v);
                }
            });
        }
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            p: (_node: Node) => ({
                conversion: (domNode: Node) => {
                    const el = domNode as HTMLElement;
                    const attrs: Record<string, string> = {};
                    Array.from(el.attributes).forEach(attr => attrs[attr.name] = attr.value);
                    return { node: $createCustomParagraphNode(attrs) };
                },
                priority: 2, // Even higher priority to beat standard Lexical Paragraph
            }),
        };
    }

    static importJSON(serializedNode: SerializedCustomParagraphNode): CustomParagraphNode {
        const node = $createCustomParagraphNode(serializedNode.attributes);
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedCustomParagraphNode {
        return {
            ...super.exportJSON(),
            attributes: this.__attributes,
            type: 'custom-paragraph',
            version: 1,
        };
    }
}

export function $createCustomParagraphNode(attributes: Record<string, string> = {}): CustomParagraphNode {
    return new CustomParagraphNode(attributes);
}
