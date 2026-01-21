import { MyUniversalEditor } from '../../core/engine';
import { ExportPDF } from '../../plugins/export/pdf-export';
import { ExportWord } from '../../plugins/export/word-export';
import { ImportWord } from '../../plugins/import/word-import';
import { DocumentOutlinePlugin } from '../../plugins/productivity/document-outline';
import { INSERT_PAGE_BREAK_COMMAND } from '../../plugins/page-layout/page-break';
import { INSERT_FOOTNOTE_COMMAND } from '../../plugins/advanced/footnote';
import { INSERT_TOC_COMMAND } from '../../plugins/page-layout/toc-plugin';
import { I18nManager, type LanguageCode } from '../../plugins/configuration/i18n';

export function setupDocumentLogic(editor: MyUniversalEditor, internalEditor: any) {
    // PDF Export
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
        ExportPDF.exportToPdf(internalEditor);
    });

    // Word Export
    document.getElementById('export-word-btn')?.addEventListener('click', () => {
        ExportWord.exportToDoc(internalEditor);
    });

    // Word Import
    document.getElementById('import-word-btn')?.addEventListener('click', () => {
        ImportWord.triggerImport(internalEditor);
    });

    // Page Break
    document.getElementById('page-break-btn')?.addEventListener('click', () => {
        editor.getInternalEditor().dispatchCommand(INSERT_PAGE_BREAK_COMMAND, undefined);
    });

    // Footnote
    document.getElementById('footnote-btn')?.addEventListener('click', () => {
        const content = prompt("Enter footnote content:");
        if (content) {
            editor.getInternalEditor().dispatchCommand(INSERT_FOOTNOTE_COMMAND, content);
        }
    });

    // TOC
    document.getElementById('toc-btn')?.addEventListener('click', () => {
        editor.getInternalEditor().dispatchCommand(INSERT_TOC_COMMAND, undefined);
    });

    // Outline Toggle
    document.getElementById('outline-toggle-btn')?.addEventListener('click', (e) => {
        DocumentOutlinePlugin.toggleVisibility();
        (e.target as HTMLElement).classList.toggle('active');
    });

    // Language Selector
    const langSelect = document.getElementById('language-select') as HTMLSelectElement;
    if (langSelect) {
        langSelect.value = I18nManager.getLanguage();
        langSelect.addEventListener('change', (e) => {
            const newLang = (e.target as HTMLSelectElement).value as LanguageCode;
            I18nManager.setLanguage(newLang);
        });
    }
}
