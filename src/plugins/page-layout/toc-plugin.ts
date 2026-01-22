import {
    createCommand,
    type LexicalCommand,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_EDITOR,
    $getRoot
} from 'lexical';
import { $createTableOfContentsNode, TableOfContentsNode, type TOCEntry } from './toc-node';
import { $isHeadingNode } from '@lexical/rich-text';
import { EditorSDK } from '../../core/sdk';

export const INSERT_TOC_COMMAND: LexicalCommand<undefined> = createCommand('INSERT_TOC_COMMAND');

export const TableOfContentsPlugin = {
    name: 'toc',
    init: (sdk: EditorSDK) => {
        if (!sdk.hasNodes([TableOfContentsNode])) {
            throw new Error('TableOfContentsPlugin: TableOfContentsNode not registered on editor');
        }

        // Command to insert the TOC node
        sdk.registerCommand(
            INSERT_TOC_COMMAND,
            () => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const tocNode = $createTableOfContentsNode([]);
                    selection.insertNodes([tocNode]);
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // Update Listener to refresh TOC nodes
        sdk.registerUpdateListener(() => {
            sdk.update(() => {
                const root = $getRoot();
                const children = root.getChildren();
                const headings: TOCEntry[] = [];
                const tocNodes: TableOfContentsNode[] = [];

                // Scan for headings and TOC nodes
                children.forEach(node => {
                    if ($isHeadingNode(node)) {
                        const tag = node.getTag();
                        const level = parseInt(tag.slice(1)); // h1 -> 1, h2 -> 2, etc.
                        headings.push({
                            key: node.getKey(),
                            text: node.getTextContent(),
                            tag: tag,
                            level: level
                        });
                    } else if (node instanceof TableOfContentsNode) {
                        tocNodes.push(node);
                    }
                });

                // Update all TOC nodes found
                tocNodes.forEach(node => {
                    // Only update if changed to avoid continuous loops 
                    // We need to compare before setting.
                    if (JSON.stringify(node.__entries) !== JSON.stringify(headings)) {
                        node.setEntries(headings);
                    }
                });
            });
        });

        // Click listener for jumping
        sdk.getRootElement()?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('toc-item') && target.dataset.key) {
                sdk.update(() => {
                    const node = sdk.getElementByKey(target.dataset.key!);
                    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            }
        });
    }
};
