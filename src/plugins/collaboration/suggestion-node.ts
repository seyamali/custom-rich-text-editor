import { TextNode, type NodeKey, type EditorConfig, type SerializedTextNode, type Spread } from 'lexical';

export type SuggestionType = 'insert' | 'delete';

export type SerializedSuggestionNode = Spread<{
    suggestionType: SuggestionType;
    author: string;
    timestamp: number;
}, SerializedTextNode>;

export class SuggestionNode extends TextNode {
    __suggestionType: SuggestionType;
    __author: string;
    __timestamp: number;

    static getType(): string { return 'suggestion'; }

    static clone(node: SuggestionNode): SuggestionNode {
        return new SuggestionNode(
            node.__suggestionType,
            node.__author,
            node.__text,
            node.__key
        );
    }

    constructor(type: SuggestionType, author: string, text: string, key?: NodeKey) {
        super(text, key);
        this.__suggestionType = type;
        this.__author = author;
        this.__timestamp = Date.now();
    }

    getSuggestionType(): SuggestionType {
        return this.__suggestionType;
    }

    getAuthor(): string {
        return this.__author;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        dom.classList.add('suggestion-node');
        dom.classList.add(`suggestion-${this.__suggestionType}`);
        dom.setAttribute('data-author', this.__author);
        dom.title = `Suggested by ${this.__author} at ${new Date(this.__timestamp).toLocaleTimeString()}`;
        return dom;
    }

    static importJSON(serializedNode: SerializedSuggestionNode): SuggestionNode {
        return new SuggestionNode(
            serializedNode.suggestionType,
            serializedNode.author,
            serializedNode.text
        );
    }

    exportJSON(): SerializedSuggestionNode {
        return {
            ...super.exportJSON(),
            author: this.__author,
            suggestionType: this.__suggestionType,
            timestamp: this.__timestamp,
            type: 'suggestion',
            version: 1,
        };
    }
}