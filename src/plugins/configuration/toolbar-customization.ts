export type ToolbarItemConfig = {
    id: string;
    label: string;
    visible: boolean;
};

const STORAGE_KEY = 'editor-toolbar-config';

export const ToolbarCustomization = {
    // Default configuration based on IDs in layout.ts
    getDefaultConfig: (): ToolbarItemConfig[] => [
        { id: 'undo-btn', label: 'Undo', visible: true },
        { id: 'redo-btn', label: 'Redo', visible: true },
        { id: 'clear-btn', label: 'Clear Formatting', visible: true },
        { id: 'bold-btn', label: 'Bold', visible: true },
        { id: 'italic-btn', label: 'Italic', visible: true },
        { id: 'underline-btn', label: 'Underline', visible: true },
        { id: 'strike-btn', label: 'Strikethrough', visible: true },
        { id: 'sub-btn', label: 'Subscript', visible: true },
        { id: 'sup-btn', label: 'Superscript', visible: true },
        { id: 'code-btn', label: 'Inline Code', visible: true },
        { id: 'h1-btn', label: 'Heading 1', visible: true },
        { id: 'h2-btn', label: 'Heading 2', visible: true },
        { id: 'p-btn', label: 'Paragraph', visible: true },
        { id: 'bullet-btn', label: 'Bullets', visible: true },
        { id: 'number-btn', label: 'Numbers', visible: true },
        { id: 'link-btn', label: 'Link', visible: true },
        { id: 'image-btn', label: 'Image', visible: true },
        { id: 'table-btn', label: 'Table', visible: true },
        { id: 'video-btn', label: 'YouTube', visible: true },
        { id: 'html-snippet-btn', label: 'HTML Snippet', visible: true },
        { id: 'placeholder-select', label: 'Merge Fields', visible: true },
        { id: 'code-block-btn', label: 'Code Block', visible: true },
        { id: 'export-pdf-btn', label: 'Export PDF', visible: true },
        { id: 'export-word-btn', label: 'Export Word', visible: true },
        { id: 'import-word-btn', label: 'Import Word', visible: true },
        { id: 'page-break-btn', label: 'Page Break', visible: true },
        { id: 'footnote-btn', label: 'Footnote', visible: true },
        { id: 'toc-btn', label: 'Table of Contents', visible: true },
        { id: 'outline-toggle-btn', label: 'Outline Sidebar', visible: true },
        { id: 'track-changes-btn', label: 'Track Changes', visible: true },
    ],

    getConfig: (): ToolbarItemConfig[] => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse toolbar config", e);
            }
        }
        return ToolbarCustomization.getDefaultConfig();
    },

    saveConfig: (config: ToolbarItemConfig[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        ToolbarCustomization.applyConfig(config);
    },

    applyConfig: (config: ToolbarItemConfig[]) => {
        config.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                el.style.display = item.visible ? 'inline-block' : 'none';
            }
        });
    },

    init: () => {
        const config = ToolbarCustomization.getConfig();
        ToolbarCustomization.applyConfig(config);
    }
};
