import { DecoratorNode, type NodeKey, type SerializedLexicalNode, type Spread, type DOMConversionMap, type DOMExportOutput } from 'lexical';

export type SerializedAssetLinkNode = Spread<{ attributes: Record<string, string>; }, SerializedLexicalNode>;

export class AssetLinkNode extends DecoratorNode<HTMLElement> {
    __attributes: Record<string, string>;

    static getType(): string { return 'asset-link'; }
    static clone(node: AssetLinkNode): AssetLinkNode { return new AssetLinkNode({ ...node.__attributes }, node.__key); }

    constructor(attributes: Record<string, string>, key?: NodeKey) {
        super(key);
        this.__attributes = attributes;
    }

    static importJSON(serializedNode: SerializedAssetLinkNode): AssetLinkNode {
        return new AssetLinkNode(serializedNode.attributes);
    }

    exportJSON(): SerializedAssetLinkNode {
        return { type: 'asset-link', version: 1, attributes: this.__attributes };
    }

    createDOM(): HTMLElement {
        const link = document.createElement('link');
        Object.entries(this.__attributes).forEach(([k, v]) => link.setAttribute(k, v));
        return link;
    }

    updateDOM(): false { return false; }

    decorate(): HTMLElement {
        const link = document.createElement('link');
        Object.entries(this.__attributes).forEach(([k, v]) => link.setAttribute(k, v));
        return link;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            link: (node: Node) => {
                const el = node as HTMLLinkElement;
                if (el.rel === 'stylesheet') {
                    return {
                        conversion: (domNode: Node) => {
                            const link = domNode as HTMLLinkElement;
                            const attrs: Record<string, string> = {};
                            Array.from(link.attributes).forEach(attr => attrs[attr.name] = attr.value);
                            return { node: new AssetLinkNode(attrs) };
                        },
                        priority: 0,
                    };
                }
                return null;
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('link');
        Object.entries(this.__attributes).forEach(([k, v]) => element.setAttribute(k, v));
        return { element };
    }
}

export function $createAssetLinkNode(attributes: Record<string, string>): AssetLinkNode {
    return new AssetLinkNode(attributes);
}
