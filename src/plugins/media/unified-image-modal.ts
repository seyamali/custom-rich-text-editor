import { $insertNodes } from 'lexical';
import { $createImageNode } from './image-node';
import { UploadManager } from '../upload/upload-manager';

export function setupUnifiedImageModal(editor: any) {
    console.log('setupUnifiedImageModal called!');
    console.log('Editor:', editor);

    // Create modal HTML
    const modalHTML = `
        <div id="unified-image-modal" class="unified-image-modal hidden">
            <div class="unified-image-modal-content">
                <div class="unified-image-modal-header">
                    <h2>🖼️ Insert Image</h2>
                    <p>Upload, paste, drag & drop, or provide a URL</p>
                </div>
                <div class="unified-image-modal-body">
                    <div class="image-method-tabs">
                        <button class="image-method-tab active" data-tab="upload">
                            📤 Upload
                        </button>
                        <button class="image-method-tab" data-tab="url">
                            🌐 URL
                        </button>
                        <button class="image-method-tab" data-tab="paste">
                            📋 Paste
                        </button>
                    </div>

                    <!-- Upload Tab -->
                    <div class="tab-content active" data-content="upload">
                        <div class="upload-zone" id="upload-drop-zone">
                            <div class="upload-zone-icon">📁</div>
                            <h3>Drag & Drop Image Here</h3>
                            <p>or click to browse your files</p>
                            <button class="btn-browse" type="button">Browse Files</button>
                            <input type="file" id="unified-file-input" accept="image/*" style="display: none;" />
                        </div>
                    </div>

                    <!-- URL Tab -->
                    <div class="tab-content" data-content="url">
                        <div class="url-input-section">
                            <label for="unified-url-input">Image URL</label>
                            <input 
                                type="url" 
                                id="unified-url-input" 
                                placeholder="https://example.com/image.jpg"
                                autocomplete="off"
                            />
                        </div>
                        <div class="url-input-section">
                            <label for="unified-alt-input">Alt Text (Optional)</label>
                            <input 
                                type="text" 
                                id="unified-alt-input" 
                                placeholder="Describe the image..."
                                autocomplete="off"
                            />
                        </div>
                        <div class="url-preview" id="unified-url-preview">
                            <div class="url-preview-placeholder">
                                Enter a URL above to preview the image
                            </div>
                        </div>
                    </div>

                    <!-- Paste Tab -->
                    <div class="tab-content" data-content="paste">
                        <div class="paste-zone" id="paste-zone">
                            <div class="paste-zone-icon">📋</div>
                            <h3>Click Here & Press Ctrl+V</h3>
                            <p>Paste an image from your clipboard</p>
                        </div>
                    </div>
                </div>
                <div class="unified-image-modal-footer">
                    <button class="btn-cancel" id="unified-cancel-btn">Cancel</button>
                    <button class="btn-insert" id="unified-insert-btn" disabled>Insert Image</button>
                </div>
            </div>
        </div>
    `;

    // Inject modal into DOM
    const wrapper = document.getElementById('editor-wrapper');
    console.log('Editor wrapper:', wrapper);

    if (wrapper && !document.getElementById('unified-image-modal')) {
        console.log('Injecting modal HTML...');
        wrapper.insertAdjacentHTML('beforeend', modalHTML);
        console.log('Modal HTML injected!');
    } else {
        console.log('Wrapper not found or modal already exists');
    }

    const modal = document.getElementById('unified-image-modal');
    console.log('Modal element after injection:', modal);

    if (!modal) {
        console.error('Failed to create modal element!');
        return { showModal: () => console.error('Modal not initialized!') };
    }

    const tabs = modal.querySelectorAll('.image-method-tab');
    const tabContents = modal.querySelectorAll('.tab-content');
    const insertBtn = document.getElementById('unified-insert-btn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('unified-cancel-btn')!;

    // Upload elements
    const uploadZone = document.getElementById('upload-drop-zone')!;
    const fileInput = document.getElementById('unified-file-input') as HTMLInputElement;
    const browseBtn = uploadZone.querySelector('.btn-browse')!;

    // URL elements
    const urlInput = document.getElementById('unified-url-input') as HTMLInputElement;
    const altInput = document.getElementById('unified-alt-input') as HTMLInputElement;
    const urlPreview = document.getElementById('unified-url-preview')!;

    // Paste elements
    const pasteZone = document.getElementById('paste-zone')!;

    let currentImage: { file?: File; url?: string; altText?: string } | null = null;

    // Show/Hide modal
    const showModal = () => {
        console.log('showModal called!');
        console.log('Modal element:', modal);
        console.log('Modal classes before:', modal?.classList);

        modal.classList.remove('hidden');
        currentImage = null;
        insertBtn.disabled = true;

        // Reset all tabs
        urlInput.value = '';
        altInput.value = '';
        urlPreview.innerHTML = '<div class="url-preview-placeholder">Enter a URL above to preview the image</div>';
        pasteZone.classList.remove('has-image');
        pasteZone.innerHTML = `
            <div class="paste-zone-icon">📋</div>
            <h3>Click Here & Press Ctrl+V</h3>
            <p>Paste an image from your clipboard</p>
        `;

        // Activate first tab
        switchTab('upload');

        console.log('Modal classes after:', modal?.classList);
        console.log('Modal should be visible now!');
    };

    const hideModal = () => {
        modal.classList.add('hidden');
    };

    // Tab switching
    const switchTab = (tabName: string) => {
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        tabContents.forEach(content => {
            if (content.getAttribute('data-content') === tabName) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Reset insert button when switching tabs
        insertBtn.disabled = !currentImage;
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            if (tabName) switchTab(tabName);
        });
    });

    // Upload Tab Logic
    browseBtn.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('click', (e) => {
        if (e.target === uploadZone || e.target === uploadZone.querySelector('.upload-zone-icon') ||
            e.target === uploadZone.querySelector('h3') || e.target === uploadZone.querySelector('p')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (file && file.type.startsWith('image/')) {
            currentImage = { file, altText: file.name };
            insertBtn.disabled = false;
            uploadZone.innerHTML = `
                <div class="upload-zone-icon">✅</div>
                <h3>${file.name}</h3>
                <p>Ready to insert</p>
            `;
        }
    });

    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');

        const file = e.dataTransfer?.files[0];
        if (file && file.type.startsWith('image/')) {
            currentImage = { file, altText: file.name };
            insertBtn.disabled = false;
            uploadZone.innerHTML = `
                <div class="upload-zone-icon">✅</div>
                <h3>${file.name}</h3>
                <p>Ready to insert</p>
            `;
        }
    });

    // URL Tab Logic
    const updateUrlPreview = () => {
        const url = urlInput.value.trim();

        if (!url) {
            urlPreview.innerHTML = '<div class="url-preview-placeholder">Enter a URL above to preview the image</div>';
            insertBtn.disabled = true;
            currentImage = null;
            return;
        }

        urlPreview.innerHTML = '<div class="url-preview-placeholder">Loading preview...</div>';

        const img = new Image();
        img.onload = () => {
            urlPreview.innerHTML = '';
            urlPreview.appendChild(img);
            currentImage = { url, altText: altInput.value || 'Image' };
            insertBtn.disabled = false;
        };
        img.onerror = () => {
            urlPreview.innerHTML = '<div class="url-preview-placeholder" style="color: #dc2626;">❌ Failed to load image</div>';
            insertBtn.disabled = true;
            currentImage = null;
        };
        img.src = url;
    };

    urlInput.addEventListener('input', updateUrlPreview);
    altInput.addEventListener('input', () => {
        if (currentImage) {
            currentImage.altText = altInput.value || 'Image';
        }
    });

    // Paste Tab Logic
    pasteZone.addEventListener('click', () => pasteZone.focus());
    pasteZone.setAttribute('tabindex', '0');

    pasteZone.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (items) {
            for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        currentImage = { file, altText: 'Pasted Image' };
                        insertBtn.disabled = false;

                        const reader = new FileReader();
                        reader.onload = (event) => {
                            pasteZone.classList.add('has-image');
                            pasteZone.innerHTML = `
                                <img src="${event.target?.result}" style="max-width: 100%; max-height: 200px; border-radius: 10px;" />
                                <p style="margin-top: 12px; color: #10b981; font-weight: 500;">✅ Image pasted successfully!</p>
                            `;
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        }
    });

    // Insert Image
    const insertImage = async () => {
        if (!currentImage) return;

        try {
            if (currentImage.file) {
                // Upload file
                const response = await UploadManager.upload(currentImage.file);

                // Focus editor before insertion
                const editorElement = editor.getInternalEditor().getRootElement();
                if (editorElement) {
                    editorElement.focus();
                }

                // Small delay to ensure focus
                setTimeout(() => {
                    editor.getInternalEditor().update(() => {
                        const imageNode = $createImageNode(response.url, currentImage!.altText || 'Image', 500);
                        $insertNodes([imageNode]);
                    });
                }, 50);
            } else if (currentImage.url) {
                // Insert from URL
                // Focus editor before insertion
                const editorElement = editor.getInternalEditor().getRootElement();
                if (editorElement) {
                    editorElement.focus();
                }

                // Small delay to ensure focus
                setTimeout(() => {
                    editor.getInternalEditor().update(() => {
                        const imageNode = $createImageNode(currentImage!.url!, currentImage!.altText || 'Image', 500);
                        $insertNodes([imageNode]);
                    });
                }, 50);
            }
            hideModal();
        } catch (error) {
            console.error('Failed to insert image:', error);
            alert('Failed to insert image. Please try again.');
        }
    };

    insertBtn.addEventListener('click', insertImage);
    cancelBtn.addEventListener('click', hideModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Keyboard shortcuts
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
        } else if (e.key === 'Enter' && !insertBtn.disabled) {
            insertImage();
        }
    });

    return { showModal };
}
