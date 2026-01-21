import { $insertNodes, COMMAND_PRIORITY_LOW, PASTE_COMMAND, DROP_COMMAND, type LexicalEditor } from 'lexical';
import { $createImageNode } from './image-node';
import { EditorSDK } from '../../core/sdk';
import type { EditorPlugin } from '../../core/registry';
import { UploadManager } from '../upload/upload-manager';
import { setupImagePopover } from './image-popover-ui';
import { setupImageResizer } from './image-resizer';
import { setupUnifiedImageModal } from './unified-image-modal';
import { setupImageDragToMove } from './image-drag-move';

let unifiedImageModalInstance: { showModal: () => void } | null = null;

export const ImagesPlugin: EditorPlugin = {
    name: 'images',
    init: (sdk: EditorSDK) => {
        try {
            console.log('ImagesPlugin init called!');
            const editor = sdk.getLexicalEditor();
            console.log('Editor from SDK:', editor);

            setupImagePopover(editor);
            console.log('Image popover setup complete');

            setupImageResizer(editor);
            console.log('Image resizer setup complete');

            setupImageDragToMove(editor);
            console.log('Image drag-to-move setup complete');

            // Setup unified modal and store instance
            console.log('About to setup unified modal...');
            unifiedImageModalInstance = setupUnifiedImageModal({ getInternalEditor: () => editor });
            console.log('Unified modal instance:', unifiedImageModalInstance);

            // Paste support
            editor.registerCommand(
                PASTE_COMMAND,
                (event: ClipboardEvent) => {
                    const items = event.clipboardData?.items;
                    if (items) {
                        for (const item of Array.from(items)) {
                            if (item.type.startsWith('image/')) {
                                const file = item.getAsFile();
                                if (file) {
                                    handleFileUpload(editor, file);
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            );

            // Drop support
            editor.registerCommand(
                DROP_COMMAND,
                (event: DragEvent) => {
                    const files = event.dataTransfer?.files;
                    if (files && files.length > 0) {
                        for (const file of Array.from(files)) {
                            if (file.type.startsWith('image/')) {
                                handleFileUpload(editor, file);
                            }
                        }
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            );

            console.log("Advanced Image Support initialized");
        } catch (error) {
            console.error('Error initializing ImagesPlugin:', error);
        }
    }
};

async function handleFileUpload(editor: LexicalEditor, file: File) {
    try {
        const response = await UploadManager.upload(file);

        // Focus editor to ensure undo/redo tracking
        const editorElement = editor.getRootElement();
        if (editorElement) {
            editorElement.focus();
        }

        // Small delay to ensure focus is registered
        setTimeout(() => {
            editor.update(() => {
                const imageNode = $createImageNode(response.url, response.filename || file.name, 500);
                $insertNodes([imageNode]);
            });
        }, 50);
    } catch (error) {
        console.error("Image upload failed:", error);
    }
}

export const insertImage = () => {
    console.log('insertImage called!');
    console.log('unifiedImageModalInstance:', unifiedImageModalInstance);
    if (unifiedImageModalInstance) {
        unifiedImageModalInstance.showModal();
    } else {
        console.error('Modal instance not initialized!');
    }
};

export const insertImageFromURL = () => {
    console.log('insertImageFromURL called!');
    if (unifiedImageModalInstance) {
        unifiedImageModalInstance.showModal();
    }
};

