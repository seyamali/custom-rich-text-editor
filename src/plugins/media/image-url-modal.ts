import { $insertNodes } from 'lexical';
import { $createImageNode } from './image-node';

export function setupImageURLModal(editor: any) {
    // Create modal HTML
    const modalHTML = `
        <div id="image-url-modal" class="image-url-modal hidden">
            <div class="image-url-modal-content">
                <div class="image-url-modal-header">
                    <h3>🖼️ Insert Image from URL</h3>
                </div>
                <div class="image-url-modal-body">
                    <div class="image-url-input-group">
                        <label for="image-url-input-field">Image URL</label>
                        <input 
                            type="url" 
                            id="image-url-input-field" 
                            placeholder="https://example.com/image.jpg"
                            autocomplete="off"
                        />
                    </div>
                    <div class="image-url-input-group">
                        <label for="image-alt-input-field">Alt Text (Optional)</label>
                        <input 
                            type="text" 
                            id="image-alt-input-field" 
                            placeholder="Describe the image..."
                            autocomplete="off"
                        />
                    </div>
                    <div class="image-url-preview" id="image-url-preview">
                        <div class="image-url-preview-placeholder">
                            Enter a URL above to preview the image
                        </div>
                    </div>
                </div>
                <div class="image-url-modal-footer">
                    <button class="btn-cancel" id="image-url-cancel-btn">Cancel</button>
                    <button class="btn-insert" id="image-url-insert-btn" disabled>Insert Image</button>
                </div>
            </div>
        </div>
    `;

    // Inject modal into DOM
    const wrapper = document.getElementById('editor-wrapper');
    if (wrapper && !document.getElementById('image-url-modal')) {
        wrapper.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('image-url-modal')!;
    const urlInput = document.getElementById('image-url-input-field') as HTMLInputElement;
    const altInput = document.getElementById('image-alt-input-field') as HTMLInputElement;
    const preview = document.getElementById('image-url-preview')!;
    const insertBtn = document.getElementById('image-url-insert-btn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('image-url-cancel-btn')!;

    let previewImg: HTMLImageElement | null = null;

    // Show modal
    const showModal = () => {
        modal.classList.remove('hidden');
        urlInput.value = '';
        altInput.value = '';
        preview.innerHTML = '<div class="image-url-preview-placeholder">Enter a URL above to preview the image</div>';
        insertBtn.disabled = true;
        previewImg = null;
        setTimeout(() => urlInput.focus(), 100);
    };

    // Hide modal
    const hideModal = () => {
        modal.classList.add('hidden');
    };

    // Update preview
    const updatePreview = () => {
        const url = urlInput.value.trim();

        if (!url) {
            preview.innerHTML = '<div class="image-url-preview-placeholder">Enter a URL above to preview the image</div>';
            insertBtn.disabled = true;
            previewImg = null;
            return;
        }

        // Create preview image
        preview.innerHTML = '<div class="image-url-preview-placeholder">Loading preview...</div>';

        const img = new Image();
        img.onload = () => {
            preview.innerHTML = '';
            preview.appendChild(img);
            insertBtn.disabled = false;
            previewImg = img;
        };
        img.onerror = () => {
            preview.innerHTML = '<div class="image-url-preview-placeholder" style="color: #dc2626;">❌ Failed to load image. Check the URL.</div>';
            insertBtn.disabled = true;
            previewImg = null;
        };
        img.src = url;
    };

    // Event listeners
    urlInput.addEventListener('input', updatePreview);

    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !insertBtn.disabled) {
            insertImage();
        } else if (e.key === 'Escape') {
            hideModal();
        }
    });

    altInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !insertBtn.disabled) {
            insertImage();
        } else if (e.key === 'Escape') {
            hideModal();
        }
    });

    cancelBtn.addEventListener('click', hideModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Insert image
    const insertImage = () => {
        const url = urlInput.value.trim();
        const altText = altInput.value.trim() || 'Image';

        if (url && previewImg) {
            editor.getInternalEditor().update(() => {
                const imageNode = $createImageNode(url, altText, 500);
                $insertNodes([imageNode]);
            });
            hideModal();
        }
    };

    insertBtn.addEventListener('click', insertImage);

    // Return show function for external use
    return { showModal };
}
