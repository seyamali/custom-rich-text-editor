import { $getSelection, $isRangeSelection, $isNodeSelection, type LexicalEditor, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $isImageNode } from './image-node';

export function setupLinkPopover(editor: LexicalEditor) {
    const popover = document.getElementById('link-popover')!;
    const urlInput = document.getElementById('link-url-input') as HTMLInputElement;
    const applyBtn = document.getElementById('link-apply-btn')!;
    const openBtn = document.getElementById('link-open-btn')!;
    const removeBtn = document.getElementById('link-remove-btn')!;
    const targetCheckbox = document.getElementById('link-target-checkbox') as HTMLInputElement;

    const updatePopoverPosition = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // If selection is collapsed or weird, fallback to active Element if possible?
        // Actually window.getSelection() usually covers it. 

        const editorContainer = document.getElementById('editor-wrapper')!;
        const containerRect = editorContainer.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();

        // rect is from viewport (getBoundingClientRect)
        // containerRect is from viewport
        // position = viewportSelection - viewportContainer
        let top = rect.bottom - containerRect.top + 10;
        let left = rect.left - containerRect.left + (rect.width / 2) - (popoverRect.width / 2);

        // If rect is 0 (e.g. node selection), fallback to .image-wrapper.selected
        if (rect.width === 0 && rect.height === 0) {
            const activeElement = document.querySelector('.image-wrapper.selected');
            if (activeElement) {
                const imgRect = activeElement.getBoundingClientRect();
                top = imgRect.bottom - containerRect.top + 10;
                left = imgRect.left - containerRect.left + (imgRect.width / 2) - (popoverRect.width / 2);
            }
        }

        // Boundary checks - keep it inside the editor
        if (left < 10) left = 10;
        if (left + popoverRect.width > containerRect.width - 10) {
            left = containerRect.width - popoverRect.width - 10;
        }

        // If it overlaps the bottom of the editor wrapper, show it above the selection
        if (top + popoverRect.height > containerRect.height - 10) {
            // Position above the selection/image
            const selectionTop = (rect.width === 0 && rect.height === 0)
                ? (document.querySelector('.image-wrapper.selected')?.getBoundingClientRect().top || rect.top)
                : rect.top;

            top = selectionTop - containerRect.top - popoverRect.height - 10;
        }

        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
    };

    const showPopover = (url: string = '', isNewTab: boolean = false) => {
        urlInput.value = url;
        targetCheckbox.checked = isNewTab;
        popover.classList.remove('hidden');

        // Use requestAnimationFrame for smoother layout calculation
        requestAnimationFrame(() => {
            updatePopoverPosition();
            urlInput.focus();
        });
    };

    const hidePopover = () => {
        popover.classList.add('hidden');
    };

    // 1. Handle selection changes to HIDE popover when moving away from a link
    editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                let isInLink = false;

                if ($isRangeSelection(selection)) {
                    const node = selection.anchor.getNode();
                    const linkNode = $getNearestNodeOfType(node, LinkNode);
                    if (linkNode) isInLink = true;
                } else if ($isNodeSelection(selection)) {
                    const nodes = selection.getNodes();
                    if (nodes.length === 1 && $isImageNode(nodes[0]) && (nodes[0] as any).__linkUrl) {
                        isInLink = true;
                    }
                }

                // If not in a link and popover is visible, hide it (unless focus is in the popover)
                if (!isInLink && !popover.classList.contains('hidden')) {
                    if (document.activeElement !== urlInput && !popover.contains(document.activeElement)) {
                        hidePopover();
                    }
                }
            });
            return false;
        },
        COMMAND_PRIORITY_LOW
    );

    // 2. Explicitly show popover only on CLICK (prevents popover on paste/typing)
    editor.registerRootListener((rootElement) => {
        if (!rootElement) return;

        rootElement.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check if clicking a link or inside a link
            editor.getEditorState().read(() => {
                const selection = $getSelection();

                // Text Link Check
                if ($isRangeSelection(selection)) {
                    const node = selection.anchor.getNode();
                    const linkNode = $getNearestNodeOfType(node, LinkNode);
                    if (linkNode) {
                        const url = linkNode.getURL();
                        const target = linkNode.getTarget();
                        showPopover(url, target === '_blank');
                        return;
                    }
                }

                // Image Link Check (already handled selection in image-popover-ui, 
                // but we need to show the LINK popover if the image HAS a link)
                if ($isNodeSelection(selection)) {
                    const nodes = selection.getNodes();
                    if (nodes.length === 1 && $isImageNode(nodes[0])) {
                        const imageNode = nodes[0] as any;
                        if (imageNode.__linkUrl) {
                            showPopover(imageNode.__linkUrl, true);
                        }
                    }
                }
            });
        });
    });

    // Apply Link
    applyBtn.addEventListener('click', () => {
        const url = urlInput.value;
        const target = targetCheckbox.checked ? '_blank' : '_self';

        editor.update(() => {
            const selection = $getSelection();

            // 1. Handle Image Selection
            if ($isNodeSelection(selection)) {
                const nodes = selection.getNodes();
                if (nodes.length === 1 && $isImageNode(nodes[0])) {
                    const imageNode = nodes[0];
                    imageNode.setLinkUrl(url ? url : '');
                    hidePopover();
                    return;
                }
            }

            // 2. Handle Text Selection (Standard)
            if (url) {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url, target });
            } else {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            }
        });

        hidePopover();
    });

    // Enter to apply
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            applyBtn.click();
        } else if (e.key === 'Escape') {
            hidePopover();
        }
    });

    // Remove Link
    removeBtn.addEventListener('click', () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isNodeSelection(selection)) {
                const nodes = selection.getNodes();
                if (nodes.length === 1 && $isImageNode(nodes[0])) {
                    nodes[0].setLinkUrl('');
                    hidePopover();
                    return;
                }
            }
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        });
        hidePopover();
    });

    // Open Link
    openBtn.addEventListener('click', () => {
        let url = urlInput.value.trim();
        if (url) {
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        }
    });

    // Handle Link Button in Toolbar
    const toolbarLinkBtn = document.getElementById('link-btn');
    toolbarLinkBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        editor.getEditorState().read(() => {
            const selection = $getSelection();

            // Handle Image Selection
            if ($isNodeSelection(selection)) {
                const nodes = selection.getNodes();
                if (nodes.length === 1 && $isImageNode(nodes[0])) {
                    const imageNode = nodes[0];
                    const url = imageNode.__linkUrl || '';
                    showPopover(url, true); // defaulting to new tab for images usually
                    return;
                }
            }

            if ($isRangeSelection(selection)) {
                showPopover();
            }
        });
    });

    // Global click to hide
    document.addEventListener('mousedown', (e) => {
        if (!popover.contains(e.target as Node) && !toolbarLinkBtn?.contains(e.target as Node)) {
            hidePopover();
        }
    });
}
