export type TranslationKeys = {
    undo: string;
    redo: string;
    clearFormatting: string;
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    subscript: string;
    superscript: string;
    code: string;
    h1: string;
    h2: string;
    paragraph: string;
    bullets: string;
    numbers: string;
    link: string;
    image: string;
    table: string;
    youtube: string;
    htmlSnippet: string;
    placeholders: string;
    codeBlock: string;
    pdf: string;
    word: string;
    importWord: string;
    pageBreak: string;
    footnote: string;
    toc: string;
    outline: string;
    settings: string;
    trackChanges: string;
};

export type LanguageCode = 'en' | 'ar' | 'es' | 'fr';

const translations: Record<LanguageCode, TranslationKeys & { dir: 'ltr' | 'rtl' }> = {
    en: {
        dir: 'ltr',
        undo: 'Undo',
        redo: 'Redo',
        clearFormatting: 'Clear',
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline',
        strikethrough: 'Strikethrough',
        subscript: 'Subscript',
        superscript: 'Superscript',
        code: 'Code',
        h1: 'H1',
        h2: 'H2',
        paragraph: 'P',
        bullets: 'List',
        numbers: 'Number',
        link: 'Link',
        image: 'Image',
        table: 'Table',
        youtube: 'YouTube',
        htmlSnippet: 'Snippet',
        placeholders: 'Merge',
        codeBlock: 'Code Block',
        pdf: 'PDF',
        word: 'Word',
        importWord: 'Import Word',
        pageBreak: 'Break',
        footnote: 'Footnote',
        toc: 'TOC',
        outline: 'Outline',
        settings: 'Settings',
        trackChanges: 'Track Changes'
    },
    ar: {
        dir: 'rtl',
        undo: 'تراجع',
        redo: 'إعادة',
        clearFormatting: 'مسح',
        bold: 'عريض',
        italic: 'مائل',
        underline: 'تحته خط',
        strikethrough: 'يتوسطه خط',
        subscript: 'منخفض',
        superscript: 'مرتفع',
        code: 'برمجة',
        h1: 'عنوان 1',
        h2: 'عنوان 2',
        paragraph: 'فقرة',
        bullets: 'قائمة',
        numbers: 'ترقيم',
        link: 'رابط',
        image: 'صورة',
        table: 'جدول',
        youtube: 'يوتيوب',
        htmlSnippet: 'قصاصة',
        placeholders: 'دمج',
        codeBlock: 'كتلة كود',
        pdf: 'PDF',
        word: 'Word',
        importWord: 'استيراد وورد',
        pageBreak: 'فاصل',
        footnote: 'حاشية',
        toc: 'فهرس',
        outline: 'مخطط',
        settings: 'إعدادات',
        trackChanges: 'تتبع التغييرات'
    },
    es: {
        dir: 'ltr',
        undo: 'Deshacer',
        redo: 'Rehacer',
        clearFormatting: 'Limpiar',
        bold: 'Negrita',
        italic: 'Cursiva',
        underline: 'Subrayado',
        strikethrough: 'Tachado',
        subscript: 'Subíndice',
        superscript: 'Superíndice',
        code: 'Código',
        h1: 'H1',
        h2: 'H2',
        paragraph: 'P',
        bullets: 'Lista',
        numbers: 'Números',
        link: 'Enlace',
        image: 'Imagen',
        table: 'Tabla',
        youtube: 'YouTube',
        htmlSnippet: 'Snippet',
        placeholders: 'Campos',
        codeBlock: 'Bloque Código',
        pdf: 'PDF',
        word: 'Word',
        importWord: 'Importar Word',
        pageBreak: 'Salto',
        footnote: 'Nota',
        toc: 'Índice',
        outline: 'Esquema',
        settings: 'Ajustes',
        trackChanges: 'Seguimiento'
    },
    fr: {
        dir: 'ltr',
        undo: 'Annuler',
        redo: 'Rétablir',
        clearFormatting: 'Effacer',
        bold: 'Gras',
        italic: 'Italique',
        underline: 'Souligné',
        strikethrough: 'Barré',
        subscript: 'Indice',
        superscript: 'Exposant',
        code: 'Code',
        h1: 'H1',
        h2: 'H2',
        paragraph: 'P',
        bullets: 'Liste',
        numbers: 'Chiffres',
        link: 'Lien',
        image: 'Image',
        table: 'Tableau',
        youtube: 'YouTube',
        htmlSnippet: 'Extrait',
        placeholders: 'Champs',
        codeBlock: 'Code',
        pdf: 'PDF',
        word: 'Word',
        importWord: 'Importer Word',
        pageBreak: 'Saut',
        footnote: 'Note',
        toc: 'Sommaire',
        outline: 'Aperçu',
        settings: 'Réglages',
        trackChanges: 'Suivi'
    }
};

const STORAGE_KEY = 'editor-language';

export const I18nManager = {
    getLanguage: (): LanguageCode => {
        return (localStorage.getItem(STORAGE_KEY) as LanguageCode) || 'en';
    },

    setLanguage: (lang: LanguageCode) => {
        localStorage.setItem(STORAGE_KEY, lang);
        I18nManager.applyLanguage(lang);
    },

    applyLanguage: (lang: LanguageCode) => {
        const trans = translations[lang];
        const root = document.getElementById('editor-wrapper');
        if (root) {
            root.setAttribute('dir', trans.dir);
            root.classList.toggle('rtl', trans.dir === 'rtl');
        }

        // Update UI elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n') as keyof TranslationKeys;
            if (key && trans[key]) {
                if (el.tagName === 'BUTTON' || el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'H3') {
                    // Filter icons if they are part of the text, but usually we swap the whole text
                    // For buttons with icons, we might need a more selective update
                    // But for now, we'll replace the text or handle specific icon-based buttons
                    const icon = el.getAttribute('data-i18n-icon');
                    el.innerHTML = (icon ? icon + ' ' : '') + trans[key];
                }
            }
        });

        // Update select options if any (like placeholders)
        const placeholderSelect = document.getElementById('placeholder-select');
        if (placeholderSelect) {
            const firstOption = placeholderSelect.querySelector('option[value=""]');
            if (firstOption) firstOption.textContent = trans.placeholders;
        }
    },

    init: () => {
        I18nManager.applyLanguage(I18nManager.getLanguage());
    }
};
