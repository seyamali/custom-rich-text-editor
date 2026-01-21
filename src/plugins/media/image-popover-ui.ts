import { $getSelection, $isNodeSelection, $getNodeByKey, $createNodeSelection, $setSelection, type LexicalEditor, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW, KEY_DELETE_COMMAND, KEY_BACKSPACE_COMMAND } from 'lexical';
import { ImageNode, $isImageNode } from './image-node';

export function setupImagePopover(editor: LexicalEditor) {
    // 1. Create the Popover Element
    let popover = document.getElementById('image-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'image-popover';
        popover.className = 'image-popover hidden';
        popover.innerHTML = `
            <div class="popover-row">
                <button id="img-align-left" title="Align Left">⬅️ Left</button>
                <button id="img-align-center" title="Align Center">⬛ Center</button>
                <button id="img-align-right" title="Align Right">➡️ Right</button>
                <button id="img-align-full" title="Full Width">↔️ Full</button>
            </div>
            <div class="popover-divider"></div>
            <div class="popover-row">
                <input type="text" id="img-alt-input" placeholder="Alt text..." />
                <button id="img-unlink-btn" title="Remove Link" class="danger hidden">🔗 Remove Link</button>
            </div>
        `;
        document.getElementById('editor-wrapper')?.appendChild(popover);
    }

    const altInput = document.getElementById('img-alt-input') as HTMLInputElement;
    const unlinkBtn = document.getElementById('img-unlink-btn') as HTMLButtonElement;

    // Helper to position the popover
    const updatePopoverPosition = (target: HTMLElement) => {
        const wrapper = document.getElementById('editor-wrapper');
        if (!wrapper) return;
        const wrapperRect = wrapper.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const popoverRect = popover!.getBoundingClientRect();

        // Default to showing BELOW the image
        let top = targetRect.bottom - wrapperRect.top + 10;
        let left = targetRect.left - wrapperRect.left + (targetRect.width / 2) - (popoverRect.width / 2);

        // Boundary checks
        if (left < 10) left = 10;
        if (left + popoverRect.width > wrapperRect.width - 10) {
            left = wrapperRect.width - popoverRect.width - 10;
        }

        // If not enough space below, show ABOVE
        if (top + popoverRect.height > wrapperRect.height - 10) {
            top = targetRect.top - wrapperRect.top - popoverRect.height - 10;
        }

        popover!.style.top = `${top}px`;
        popover!.style.left = `${left}px`;
    };

    let currentImageNodeKey: string | null = null;

    const showPopover = (target: HTMLElement, node: ImageNode) => {
        currentImageNodeKey = node.getKey();
        altInput.value = node.__altText;

        // Show unlink button only if there is a link
        if (node.__linkUrl) {
            unlinkBtn.classList.remove('hidden');
        } else {
            unlinkBtn.classList.add('hidden');
        }

        popover!.classList.remove('hidden');
        requestAnimationFrame(() => updatePopoverPosition(target));

        // Highlighting active alignment
        ['left', 'center', 'right', 'full'].forEach(align => {
            const btn = document.getElementById(`img-align-${align}`);
            btn?.classList.toggle('active', node.__alignment === align);
        });
    };

    const hidePopover = () => {
        currentImageNodeKey = null;
        popover?.classList.add('hidden');
    };

    // Unlink button click
    unlinkBtn.addEventListener('click', () => {
        if (!currentImageNodeKey) return;
        editor.update(() => {
            const node = $getNodeByKey(currentImageNodeKey!);
            if (node && $isImageNode(node)) {
                node.setLinkUrl('');
            }
        });
        hidePopover();
    });

    // 2. Handle Interactions via Delegation (Single Click Selects, Double Click Shows Popover)
    editor.registerRootListener((rootElement, _prevRootElement) => {
        if (!rootElement) return;

        // Click -> Selection & Custom Double Click Logic
        let lastClickTime = 0;
        let lastClickTarget: HTMLElement | null = null;

        rootElement.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const wrapper = target.closest('.image-wrapper') as HTMLElement;

            // If clicked outside, hide popover (unless clicking IN the popover)
            if (!wrapper && !popover?.contains(target)) {
                hidePopover();
            }

            if (wrapper) {
                const nodeKey = wrapper.getAttribute('data-node-key');

                // Explicitly select the node in Lexical
                if (nodeKey) {
                    editor.update(() => {
                        const nodeSelection = $createNodeSelection();
                        nodeSelection.add(nodeKey);
                        $setSelection(nodeSelection);
                    });
                }

                // Custom Double Click Detection
                const currentTime = new Date().getTime();
                const isSameTarget = lastClickTarget === wrapper;
                const isQuickEnough = (currentTime - lastClickTime) < 300;

                if (isSameTarget && isQuickEnough) {
                    // Double Click Detected!
                    if (nodeKey) {
                        editor.getEditorState().read(() => {
                            const node = $getNodeByKey(nodeKey);
                            if (node && $isImageNode(node)) {
                                showPopover(wrapper, node);
                            }
                        });
                    }
                    // Reset to prevent triple-click triggering
                    lastClickTime = 0;
                    lastClickTarget = null;
                } else {
                    // First Click
                    lastClickTime = currentTime;
                    lastClickTarget = wrapper;
                }
            } else {
                lastClickTime = 0;
                lastClickTarget = null;
            }
        });

        // 4. Handle Paste Logic for selected ImageNode
        rootElement.addEventListener('paste', (e: ClipboardEvent) => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if ($isNodeSelection(selection)) {
                    const nodes = selection.getNodes();
                    if (nodes.length === 1 && $isImageNode(nodes[0])) {
                        const pastedText = e.clipboardData?.getData('text');
                        if (pastedText && /^(https?:\/\/|www\.)/i.test(pastedText.trim())) {
                            e.preventDefault();
                            e.stopPropagation();
                            editor.update(() => {
                                const node = nodes[0] as ImageNode;
                                let url = pastedText.trim();
                                if (url.startsWith('www.')) url = 'http://' + url;
                                node.setLinkUrl(url);
                            });
                        }
                    }
                }
            });
        });
    });

    // 3. Handle Selection Changes (Just to hide popover when deselecting)
    editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();

                // If no selection or selection is not the current image, might need to hide
                if (!currentImageNodeKey) return;

                // Check if current image is still selected
                let isCurrentNodeSelected = false;
                if ($isNodeSelection(selection)) {
                    const nodes = selection.getNodes();
                    if (nodes.length === 1 && nodes[0].getKey() === currentImageNodeKey) {
                        isCurrentNodeSelected = true;
                    }
                }

                // If selection moved away from the image, hide the popover
                if (!isCurrentNodeSelected && document.activeElement !== altInput) {
                    if (!popover?.contains(document.activeElement)) {
                        // Keep open only if focused inside
                    }
                }
            });
            return false;
        },
        COMMAND_PRIORITY_LOW
    );

    // Update visual selection state on DOM wrapper (optional, for CSS styling)
    editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
            const selection = $getSelection();
            const root = editor.getRootElement();
            if (!root) return;

            // Clear all selected classes
            root.querySelectorAll('.image-wrapper.selected').forEach(el => el.classList.remove('selected'));

            if ($isNodeSelection(selection)) {
                const nodes = selection.getNodes();
                nodes.forEach(node => {
                    if ($isImageNode(node)) {
                        const el = editor.getElementByKey(node.getKey());
                        if (el) el.classList.add('selected');
                    }
                });
            }
        });
    });

    // Event Listeners for Buttons
    ['left', 'center', 'right', 'full'].forEach(align => {
        document.getElementById(`img-align-${align}`)?.addEventListener('click', () => {
            if (!currentImageNodeKey) return;

            editor.update(() => {
                const imageNode = $getNodeByKey(currentImageNodeKey!);
                if (imageNode && $isImageNode(imageNode)) {
                    imageNode.setAlignment(align as any);
                }
            });
        });
    });

    altInput.addEventListener('input', (e) => {
        if (!currentImageNodeKey) return;

        const text = (e.target as HTMLInputElement).value;
        editor.update(() => {
            const imageNode = $getNodeByKey(currentImageNodeKey!);
            if (imageNode && $isImageNode(imageNode)) {
                imageNode.setAltText(text);
            }
        });
    });

    // Keyboard deletion support
    const displayDelete = (command: any) => {
        return editor.registerCommand(
            command,
            () => {
                const selection = $getSelection();
                if ($isNodeSelection(selection)) {
                    const nodes = selection.getNodes();
                    if (nodes.length === 1 && $isImageNode(nodes[0])) {
                        nodes[0].remove();
                        hidePopover();
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }
    displayDelete(KEY_DELETE_COMMAND);
    displayDelete(KEY_BACKSPACE_COMMAND);
}
