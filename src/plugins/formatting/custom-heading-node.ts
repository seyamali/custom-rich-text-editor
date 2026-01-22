import { HeadingNode, type SerializedHeadingNode } from '@lexical/rich-text';
import { type EditorConfig, type NodeKey, type DOMConversionMap, type DOMExportOutput, type Spread } from 'lexical';

export type SerializedCustomHeadingNode = Spread<{
    attributes: Record<string, string>;
}, SerializedHeadingNode>;

export class CustomHeadingNode extends HeadingNode {
    __attributes: Record<string, string>;

    constructor(tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', attributes: Record<string, string> = {}, key?: NodeKey) {
        super(tag, key);
        this.__attributes = attributes;
    }

    static getType(): string { return 'custom-heading'; }
    static clone(node: CustomHeadingNode): CustomHeadingNode {
        return new CustomHeadingNode(node.getTag(), { ...node.__attributes }, node.__key);
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
            h1: (_node: Node) => ({ conversion: $convertHeadingElement, priority: 2 }),
            h2: (_node: Node) => ({ conversion: $convertHeadingElement, priority: 2 }),
            h3: (_node: Node) => ({ conversion: $convertHeadingElement, priority: 2 }),
            h4: (_node: Node) => ({ conversion: $convertHeadingElement, priority: 2 }),
            h5: (_node: Node) => ({ conversion: $convertHeadingElement, priority: 2 }),
            h6: (_node: Node) => ({ conversion: $convertHeadingElement, priority: 2 }),
        };
    }

    static importJSON(serializedNode: SerializedCustomHeadingNode): CustomHeadingNode {
        const node = $createCustomHeadingNode(serializedNode.tag, serializedNode.attributes);
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedCustomHeadingNode {
        return {
            ...super.exportJSON(),
            attributes: this.__attributes,
            type: 'custom-heading',
            version: 1,
        };
    }
}

function $convertHeadingElement(domNode: Node) {
    const el = domNode as HTMLElement;
    const attrs: Record<string, string> = {};
    Array.from(el.attributes).forEach(attr => attrs[attr.name] = attr.value);
    const node = $createCustomHeadingNode(el.tagName.toLowerCase() as any, attrs);
    return { node };
}

export function $createCustomHeadingNode(tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', attributes: Record<string, string> = {}): CustomHeadingNode {
    return new CustomHeadingNode(tag, attributes);
}
