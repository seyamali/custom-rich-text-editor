import { $getRoot } from 'lexical';
import { $isHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { EditorSDK } from '../../core/sdk';

type OutlineItem = {
    key: string;
    text: string;
    tag: HeadingTagType;
};

export const DocumentOutlinePlugin = {
    name: 'document-outline',
    init: (sdk: EditorSDK) => {
        const outlineContainer = document.getElementById('outline-list');
        const outlinePanel = document.getElementById('document-outline');

        if (!outlineContainer || !outlinePanel) return;

        // Function to update the outline
        const updateOutline = () => {
            sdk.getLexicalEditor().getEditorState().read(() => {
                const root = $getRoot();
                const children = root.getChildren();
                const headings: OutlineItem[] = [];

                children.forEach((node) => {
                    if ($isHeadingNode(node)) {
                        headings.push({
                            key: node.getKey(),
                            text: node.getTextContent(),
                            tag: node.getTag()
                        });
                    }
                });

                renderOutline(headings);
            });
        };

        // Render to DOM
        const renderOutline = (headings: OutlineItem[]) => {
            outlineContainer.innerHTML = '';

            if (headings.length === 0) {
                outlineContainer.innerHTML = '<div style="color: #999; padding: 10px;">No headings found.</div>';
                return;
            }

            headings.forEach(h => {
                const div = document.createElement('div');
                div.className = `outline-item outline-${h.tag}`;
                div.innerText = h.text || '(Untitled)';
                div.addEventListener('click', () => {
                    sdk.update(() => {
                        const node = sdk.getElementByKey(h.key);
                        node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                });
                outlineContainer.appendChild(div);
            });
        };

        // Listen for updates using specific debounce or throttle could be better
        // but for now, simple update listener.
        sdk.registerUpdateListener(() => {
            updateOutline();
        });

        // Initial render
        updateOutline();
    },

    toggleVisibility: () => {
        const outlinePanel = document.getElementById('document-outline');
        if (outlinePanel) {
            outlinePanel.classList.toggle('hidden');
        }
    }
};
