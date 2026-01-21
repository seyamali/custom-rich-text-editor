import {
    DecoratorNode,
    type EditorConfig,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from 'lexical';

export type TOCEntry = {
    key: string;
    text: string;
    tag: string; // h1, h2, etc.
};

export type SerializedTableOfContentsNode = Spread<
    {
        entries: TOCEntry[];
        type: 'toc';
        version: 1;
    },
    SerializedLexicalNode
>;

export class TableOfContentsNode extends DecoratorNode<HTMLElement> {
    __entries: TOCEntry[];

    static getType(): string {
        return 'toc';
    }

    static clone(node: TableOfContentsNode): TableOfContentsNode {
        return new TableOfContentsNode(node.__entries, node.__key);
    }

    static importJSON(serializedNode: SerializedTableOfContentsNode): TableOfContentsNode {
        return $createTableOfContentsNode(serializedNode.entries);
    }

    constructor(entries: TOCEntry[] = [], key?: NodeKey) {
        super(key);
        this.__entries = entries;
    }

    exportJSON(): SerializedTableOfContentsNode {
        return {
            entries: this.__entries,
            type: 'toc',
            version: 1,
        };
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = 'editor-toc';
        div.contentEditable = 'false';
        this.renderEntries(div);
        return div;
    }

    updateDOM(prevNode: TableOfContentsNode, dom: HTMLElement): boolean {
        if (JSON.stringify(prevNode.__entries) !== JSON.stringify(this.__entries)) {
            this.renderEntries(dom);
        }
        return false;
    }

    renderEntries(container: HTMLElement) {
        container.innerHTML = '';
        const title = document.createElement('div');
        title.className = 'toc-title';
        title.innerText = 'Table of Contents';
        container.appendChild(title);

        if (this.__entries.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'toc-empty';
            empty.innerText = 'No headings found.';
            container.appendChild(empty);
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'toc-list';

        this.__entries.forEach(entry => {
            const li = document.createElement('li');
            li.className = `toc-item toc-${entry.tag}`;
            li.innerText = entry.text || '(Untitled)';
            // We can add click listeners if we had access to editor, 
            // but usually this is purely visual in the doc until exported.
            // For editing experience, we might want it clickable.
            // However, inside `createDOM` we don't have easy access to `editor` instance to dispatch scroll.
            // We'll rely on the Plugin to attach behavior or globally delegated events.
            li.dataset.key = entry.key;
            ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    setEntries(entries: TOCEntry[]) {
        const writable = this.getWritable();
        writable.__entries = entries;
    }

    decorate(): HTMLElement {
        const div = document.createElement('div');
        return div;
    }
}

export function $createTableOfContentsNode(entries: TOCEntry[] = []): TableOfContentsNode {
    return new TableOfContentsNode(entries);
}

export function $isTableOfContentsNode(node: LexicalNode | null | undefined): node is TableOfContentsNode {
    return node instanceof TableOfContentsNode;
}
