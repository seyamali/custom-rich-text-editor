import { TextNode, type NodeKey, type EditorConfig, type SerializedTextNode, type Spread } from 'lexical';

export type SuggestionType = 'insert' | 'delete' | 'format';

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
        const newNode = new SuggestionNode(
            node.__suggestionType,
            node.__author,
            node.__text,
            node.__key
        );
        newNode.__timestamp = node.__timestamp;
        return newNode;
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

    getTimestamp(): number {
        return this.__timestamp;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        dom.className = 'suggestion-node';
        dom.classList.add(`suggestion-${this.__suggestionType}`);
        dom.setAttribute('data-author', this.__author);

        const dateStr = new Date(this.__timestamp).toLocaleString();
        dom.title = `${this.__suggestionType.toUpperCase()} by ${this.__author}\n${dateStr}`;

        return dom;
    }

    static importJSON(serializedNode: SerializedSuggestionNode): SuggestionNode {
        const node = new SuggestionNode(
            serializedNode.suggestionType,
            serializedNode.author,
            serializedNode.text
        );
        node.__timestamp = serializedNode.timestamp;
        return node;
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