import { MyUniversalEditor } from '../../core/engine';
import { insertImage } from '../../plugins/media/images';
import { insertTable, tableHandlers } from '../../plugins/layout/tables';
import { MediaEmbedPlugin } from '../../plugins/advanced/media-embed';
import { INSERT_CODE_BLOCK_COMMAND } from '../../plugins/advanced/code-blocks';
import { INSERT_PLACEHOLDER_COMMAND } from '../../plugins/advanced/placeholder';
import { toggleTracking } from '../../plugins/collaboration/track-changes';
import { SourceViewPlugin } from '../../plugins/advanced/source-view';
import { FormatPainter } from '../../plugins/productivity/format-painter';
import { CaseChange } from '../../plugins/productivity/case-change';

export function setupAdvancedLogic(editor: MyUniversalEditor, internalEditor: any) {
    let isSourceMode = false;

    // Media & Tables
    document.getElementById('image-btn')?.addEventListener('click', () => insertImage());
    document.getElementById('table-btn')?.addEventListener('click', () => insertTable(editor));
    document.getElementById('add-row-btn')?.addEventListener('click', () => tableHandlers.insertRow(editor));
    document.getElementById('add-col-btn')?.addEventListener('click', () => tableHandlers.insertColumn(editor));
    document.getElementById('del-row-btn')?.addEventListener('click', () => tableHandlers.deleteRow(editor));
    document.getElementById('del-col-btn')?.addEventListener('click', () => tableHandlers.deleteColumn(editor));

    // Advanced & Plugins
    document.getElementById('video-btn')?.addEventListener('click', () => {
        MediaEmbedPlugin.insertYouTube(editor);
    });
    document.getElementById('html-snippet-btn')?.addEventListener('click', () => {
        MediaEmbedPlugin.insertHTMLSnippet(editor);
    });

    // Placeholders
    const placeholderSelect = document.getElementById('placeholder-select') as HTMLSelectElement;
    placeholderSelect?.addEventListener('change', () => {
        let val = placeholderSelect.value;
        if (val === '__custom__') {
            const customVal = prompt("Enter custom placeholder field name:", "CustomField");
            if (customVal) {
                val = customVal.replace(/[^a-zA-Z0-9_]/g, ''); // Simple sanitation
            } else {
                val = ''; // Cancelled
            }
        }

        if (val) {
            editor.getInternalEditor().dispatchCommand(INSERT_PLACEHOLDER_COMMAND, val);
            placeholderSelect.value = ""; // Reset
        }
    });

    document.getElementById('code-block-btn')?.addEventListener('click', () => {
        editor.getInternalEditor().dispatchCommand(INSERT_CODE_BLOCK_COMMAND, undefined);
    });

    document.getElementById('track-changes-btn')?.addEventListener('click', (e) => {
        const isTracking = toggleTracking();
        const btn = e.target as HTMLButtonElement;
        if (isTracking) {
            btn.innerText = "👁️ Track Changes: ON";
            btn.classList.remove('off');
            btn.classList.add('on');
        } else {
            btn.innerText = "👁️ Track Changes: OFF";
            btn.classList.remove('on');
            btn.classList.add('off');
        }
    });

    // Format Painter
    document.getElementById('format-painter-btn')?.addEventListener('click', () => {
        FormatPainter.copyFormat(internalEditor);
    });

    // Case Change
    document.getElementById('uppercase-btn')?.addEventListener('click', () => CaseChange.toUpperCase(internalEditor));
    document.getElementById('lowercase-btn')?.addEventListener('click', () => CaseChange.toLowerCase(internalEditor));
    document.getElementById('titlecase-btn')?.addEventListener('click', () => CaseChange.toTitleCase(internalEditor));

    // Source Toggle
    document.getElementById('source-toggle-btn')?.addEventListener('click', () => {
        const canvas = document.getElementById('editor-canvas') as HTMLElement;
        const sourceArea = document.getElementById('source-editor') as HTMLTextAreaElement;
        const btn = document.getElementById('source-toggle-btn') as HTMLButtonElement;

        if (!isSourceMode) {
            const html = SourceViewPlugin.getHtml(editor);
            sourceArea.value = html;
            canvas.style.display = 'none';
            sourceArea.style.display = 'block';
            btn.innerText = '✔ Apply Changes';
            isSourceMode = true;
        } else {
            SourceViewPlugin.setHtml(editor, sourceArea.value);
            canvas.style.display = 'block';
            sourceArea.style.display = 'none';
            btn.innerText = 'HTML Source';
            isSourceMode = false;
        }
    });
}
