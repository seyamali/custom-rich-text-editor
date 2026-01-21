
import {
    DecoratorNode,
    $applyNodeReplacement,
} from 'lexical';

import type {
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

export type SerializedYouTubeNode = Spread<
    {
        videoID: string;
    },
    SerializedLexicalNode
>;

export class YouTubeNode extends DecoratorNode<HTMLElement> {
    __id: string;

    static getType(): string {
        return 'youtube';
    }

    static clone(node: YouTubeNode): YouTubeNode {
        return new YouTubeNode(node.__id, node.__key);
    }

    static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
        const node = $createYouTubeNode(serializedNode.videoID);
        return node;
    }

    exportJSON(): SerializedYouTubeNode {
        return {
            type: 'youtube',
            version: 1,
            videoID: this.__id,
        };
    }

    constructor(id: string, key?: NodeKey) {
        super(key);
        this.__id = id;
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        // You might want to add a 'youtube' theme class in your engine setup similar to 'image'
        // if (_config.theme.youtube !== undefined) span.className = _config.theme.youtube;
        const element = this.decorate();
        span.appendChild(element);
        return span;
    }

    updateDOM(): false {
        return false;
    }

    decorate(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'editor-youtube-container';

        const iframe = document.createElement('iframe');
        iframe.width = '560';
        iframe.height = '315';
        iframe.src = `https://www.youtube-nocookie.com/embed/${this.__id}`;
        iframe.frameBorder = '0';
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.title = 'YouTube video';

        container.appendChild(iframe);
        return container;
    }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
    return $applyNodeReplacement(new YouTubeNode(videoID));
}

export function $isYouTubeNode(node: LexicalNode | null | undefined): node is YouTubeNode {
    return node instanceof YouTubeNode;
}
