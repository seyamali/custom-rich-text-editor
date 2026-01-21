// Imports for classes and values
import {
    DecoratorNode,
    $applyNodeReplacement
} from 'lexical';

// Imports for Types only (using the 'type' keyword)
import type {
    NodeKey,
    EditorConfig,
    LexicalNode,
    SerializedLexicalNode,
    Spread,
    LexicalEditor
} from 'lexical';


export type ImageAlignment = 'left' | 'right' | 'center' | 'full';

export type SerializedImageNode = Spread<{
    altText: string;
    caption: string;
    height?: number;
    maxWidth: number;
    src: string;
    width?: number;
    alignment?: ImageAlignment;
    showCaption?: boolean;
    linkUrl?: string;
    cropData?: { x: number; y: number; width: number; height: number };
}, SerializedLexicalNode>;

export class ImageNode extends DecoratorNode<HTMLElement> {
    __src: string;
    __altText: string;
    __width: 'inherit' | number;
    __height: 'inherit' | number;
    __maxWidth: number;
    __caption: string;
    __alignment: ImageAlignment;
    __showCaption: boolean;
    __linkUrl: string;
    __cropData: { x: number; y: number; width: number; height: number } | null;

    constructor(
        src: string = '',
        altText: string = '',
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
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width || 'inherit';
        this.__height = height || 'inherit';
        this.__caption = caption || '';
        this.__alignment = alignment;
        this.__showCaption = showCaption;
        this.__linkUrl = linkUrl;
        this.__cropData = cropData;
    }

    static getType(): string { return 'image'; }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
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

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, caption, height, maxWidth, src, width, alignment, showCaption, linkUrl, cropData } = serializedNode;
        const node = $createImageNode(src, altText, maxWidth);
        node.__width = width || 'inherit';
        node.__height = height || 'inherit';
        node.__caption = caption || '';
        node.__alignment = alignment || 'center';
        node.__showCaption = showCaption || false;
        node.__linkUrl = linkUrl || '';
        node.__cropData = cropData || null;
        return node;
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.__altText,
            caption: this.__caption,
            height: this.__height === 'inherit' ? 0 : this.__height,
            maxWidth: this.__maxWidth,
            src: this.__src,
            type: 'image',
            version: 1,
            width: this.__width === 'inherit' ? 0 : this.__width,
            alignment: this.__alignment,
            showCaption: this.__showCaption,
            linkUrl: this.__linkUrl,
            cropData: this.__cropData || undefined,
        };
    }

    setWidthAndHeight(width: number | 'inherit', height: number | 'inherit'): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    setAlignment(alignment: ImageAlignment): void {
        const writable = this.getWritable();
        writable.__alignment = alignment;
    }

    setShowCaption(show: boolean): void {
        const writable = this.getWritable();
        writable.__showCaption = show;
    }

    setCaption(caption: string): void {
        const writable = this.getWritable();
        writable.__caption = caption;
    }

    setAltText(altText: string): void {
        const writable = this.getWritable();
        writable.__altText = altText;
    }

    setLinkUrl(url: string): void {
        const writable = this.getWritable();
        writable.__linkUrl = url;
    }

    setCropData(cropData: { x: number; y: number; width: number; height: number } | null): void {
        const writable = this.getWritable();
        writable.__cropData = cropData;
    }

    // Make the node selectable with keyboard
    isInline(): boolean {
        return false;
    }

    // Allow keyboard selection (arrow keys can select this node)
    isKeyboardSelectable(): boolean {
        return true;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        span.className = 'image-node-container';
        const element = this.decorate(null as any, config); // Vanilla bridge
        span.appendChild(element as Node);
        return span;
    }

    updateDOM(prevNode: ImageNode): boolean {
        return (
            this.__src !== prevNode.__src ||
            this.__width !== prevNode.__width ||
            this.__height !== prevNode.__height ||
            this.__alignment !== prevNode.__alignment ||
            this.__showCaption !== prevNode.__showCaption ||
            this.__altText !== prevNode.__altText ||
            this.__caption !== prevNode.__caption ||
            this.__linkUrl !== prevNode.__linkUrl
        );
    }

    decorate(editor: LexicalEditor, _config: EditorConfig): HTMLElement {
        const container = document.createElement('div');
        container.className = `image-wrapper alignment-${this.__alignment}`;
        container.setAttribute('data-node-key', this.getKey());
        container.setAttribute('draggable', 'true');
        if (this.__showCaption) container.classList.add('has-caption');

        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-content';

        const img = document.createElement('img');
        img.src = this.__src;
        img.alt = this.__altText;
        img.draggable = false; // Prevent native image dragging so wrapper drag works
        img.style.width = this.__width === 'inherit' ? '100%' : `${this.__width}px`;
        img.style.height = this.__height === 'inherit' ? 'auto' : `${this.__height}px`;

        // Apply crop if exists
        if (this.__cropData) {
            img.style.objectFit = 'cover';
            img.style.objectPosition = `${-this.__cropData.x}px ${-this.__cropData.y}px`;
        }

        // Wrap in link if linkUrl exists
        if (this.__linkUrl) {
            const link = document.createElement('a');
            link.href = this.__linkUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            // Prevent navigation in editor unless Ctrl is held
            link.onclick = (e: MouseEvent) => {
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                }
            };

            link.appendChild(img);
            imgContainer.appendChild(link);
        } else {
            imgContainer.appendChild(img);
        }

        // Resize Handles
        const resizer = document.createElement('div');
        resizer.className = 'image-resizer';
        ['nw', 'ne', 'sw', 'se'].forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resizer-handle handle-${dir}`;
            resizer.appendChild(handle);
        });
        imgContainer.appendChild(resizer);

        container.appendChild(imgContainer);

        if (this.__showCaption) {
            const caption = document.createElement('div');
            caption.className = 'image-caption';
            caption.contentEditable = 'true';
            caption.innerText = this.__caption || 'Write a caption...';

            caption.addEventListener('input', (e) => {
                const val = (e.target as HTMLElement).innerText;
                if (editor) {
                    editor.update(() => {
                        this.setCaption(val);
                    });
                }
            });

            container.appendChild(caption);
        }

        return container;
    }
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}

export function $createImageNode(src: string, altText: string, maxWidth: number): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, maxWidth));
}
