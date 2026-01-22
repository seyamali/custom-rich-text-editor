import { ImageNode, type SerializedImageNode, type ImageAlignment } from './image-node';
import { type NodeKey, type DOMConversionMap, type DOMExportOutput, type Spread, type EditorConfig, type LexicalEditor } from 'lexical';

export type SerializedCustomImageNode = Spread<{
    attributes: Record<string, string>;
}, SerializedImageNode>;

export class CustomImageNode extends ImageNode {
    __attributes: Record<string, string>;

    constructor(
        src: string = '',
        altText: string = '',
        attributes: Record<string, string> = {},
        maxWidth: number = 500,
        width?: number | 'inherit',
        height?: number | 'inherit',
        caption?: string,
        alignment: ImageAlignment = 'center',
        showCaption: boolean = false,
        linkUrl: string = '',
        cropData: { x: number; y: number; width: number; height: number } | null = null,
        key?: NodeKey
    ) {
        super(src, altText, maxWidth, width, height, caption, alignment, showCaption, linkUrl, cropData, key);
        this.__attributes = attributes;
    }

    static getType(): string { return 'custom-image'; }

    static clone(node: CustomImageNode): CustomImageNode {
        return new CustomImageNode(
            node.__src,
            node.__altText,
            { ...node.__attributes },
            node.__maxWidth,
            node.__width,
            node.__height,
            node.__caption,
            node.__alignment,
            node.__showCaption,
            node.__linkUrl,
            node.__cropData,
            node.__key
        );
    }

    createDOM(config: EditorConfig): HTMLElement {
        return super.createDOM(config);
    }

    decorate(editor: LexicalEditor, config: EditorConfig): HTMLElement {
        const element = super.decorate(editor, config);
        const img = element.querySelector('img');
        if (img) {
            Object.entries(this.__attributes).forEach(([k, v]) => {
                if (k !== 'src' && k !== 'alt' && k !== 'style') {
                    img.setAttribute(k, v);
                }
            });
            // Support W3.CSS classes on the image itself
            if (this.__attributes.class) {
                img.className += ' ' + this.__attributes.class;
            }
        }
        return element;
    }

    exportDOM(): DOMExportOutput {
        const { element } = super.exportDOM();
        if (element instanceof HTMLElement) {
            const img = element.tagName === 'IMG' ? element : element.querySelector('img');
            if (img instanceof HTMLElement) {
                Object.entries(this.__attributes).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== '') {
                        img.setAttribute(k, v);
                    }
                });
            }
        }
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: (_node: Node) => ({
                conversion: (domNode: Node) => {
                    const img = domNode as HTMLImageElement;
                    const attrs: Record<string, string> = {};
                    Array.from(img.attributes).forEach(attr => attrs[attr.name] = attr.value);

                    const src = img.src;
                    const altText = img.alt;
                    const width = img.getAttribute('data-width') ? parseInt(img.getAttribute('data-width')!) : (img.width || 'inherit');
                    const height = img.getAttribute('data-height') ? parseInt(img.getAttribute('data-height')!) : (img.height || 'inherit');
                    const alignment = (img.getAttribute('data-alignment') as ImageAlignment) || 'center';

                    const node = new CustomImageNode(src, altText, attrs);
                    node.setWidthAndHeight(width as any, height as any);
                    node.setAlignment(alignment);
                    return { node };
                },
                priority: 2,
            }),
        };
    }

    static importJSON(serializedNode: SerializedCustomImageNode): CustomImageNode {
        const node = new CustomImageNode(
            serializedNode.src,
            serializedNode.altText,
            serializedNode.attributes,
            serializedNode.maxWidth
        );
        node.__width = serializedNode.width || 'inherit';
        node.__height = serializedNode.height || 'inherit';
        node.__caption = serializedNode.caption || '';
        node.__alignment = serializedNode.alignment || 'center';
        node.__showCaption = serializedNode.showCaption || false;
        node.__linkUrl = serializedNode.linkUrl || '';
        node.__cropData = serializedNode.cropData || null;
        return node;
    }

    exportJSON(): SerializedCustomImageNode {
        return {
            ...super.exportJSON(),
            attributes: this.__attributes,
            type: 'custom-image',
            version: 1,
        };
    }
}

export function $createCustomImageNode(src: string, altText: string, attributes: Record<string, string> = {}): CustomImageNode {
    return new CustomImageNode(src, altText, attributes);
}
