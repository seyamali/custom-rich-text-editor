import './style.css';
import './spare.css';
import { initSpareLogic } from './spare';
import { MyUniversalEditor } from './core/engine';
import { EDITOR_LAYOUT_HTML } from './ui/layout';
import { setupToolbar } from './ui/toolbar-setup';

// --- PLUGINS ---
import { BasicStylesPlugin } from './plugins/formatting/basic-styles';
import { HistoryPlugin } from './plugins/essentials/history';
import { ClipboardPlugin } from './plugins/essentials/clipboard';
import { ListsPlugin } from './plugins/layout/lists';
import { HeadingsPlugin } from './plugins/layout/headings';
import { LinksPlugin } from './plugins/media/links';
import { ImagesPlugin } from './plugins/media/images';
import { TablesPlugin } from './plugins/layout/tables';
import { CodeBlockPlugin } from './plugins/advanced/code-blocks';
import { TrackChangesPlugin } from './plugins/collaboration/track-changes';
import { AutosavePlugin, hasAutosavedState, loadAutosavedState } from './plugins/productivity/autosave';
import { FormatPainterPlugin } from './plugins/productivity/format-painter';
import { PlaceholderPlugin } from './plugins/advanced/placeholder';
import { SlashCommandPlugin } from './plugins/productivity/slash-commands';
import { PageBreakPlugin } from './plugins/page-layout/page-break';
import { DocumentOutlinePlugin } from './plugins/productivity/document-outline';
import { FootnotePlugin } from './plugins/advanced/footnote';
import { TableOfContentsPlugin } from './plugins/page-layout/toc-plugin';
import { HelloWorldPlugin } from './plugins/custom-plugin-demo';
import { ProductivityPlugin } from './plugins/productivity/productivity-pack';
import { ToolbarCustomization } from './plugins/configuration/toolbar-customization';
import { setupToolbarSettingsUI } from './plugins/configuration/toolbar-ui';
import { I18nManager } from './plugins/configuration/i18n';
import { AccessibilityManager } from './plugins/configuration/accessibility';
import { UploadManager } from './plugins/upload/upload-manager';
import { Base64UploadAdapter, CKBoxUploadAdapter, CustomUploadAdapter } from './plugins/upload/adapters';

// --- UI SETUP IMPORTS ---
import { setupRevisionHistoryUI } from './plugins/collaboration/revision-ui';
import { setupFindReplaceUI } from './plugins/productivity/find-replace-ui';
import { EmojiPlugin } from './plugins/productivity/emoji';
import { setupEmojiUI } from './plugins/productivity/emoji-ui';

const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement) {
  initSpareLogic();
  appElement.innerHTML = EDITOR_LAYOUT_HTML;

  const canvas = document.querySelector<HTMLDivElement>('#editor-canvas');
  if (canvas) {
    const editor = new MyUniversalEditor(canvas);

    // 1. Load Plugins
    editor.use(BasicStylesPlugin);
    editor.use(HistoryPlugin);
    editor.use(ClipboardPlugin);
    editor.use(ListsPlugin);
    editor.use(HeadingsPlugin);
    editor.use(LinksPlugin);
    editor.use(ImagesPlugin);
    editor.use(TablesPlugin);
    editor.use(CodeBlockPlugin);
    editor.use(TrackChangesPlugin);
    editor.use(AutosavePlugin);
    editor.use(FormatPainterPlugin);
    editor.use(EmojiPlugin);
    editor.use(PlaceholderPlugin);
    editor.use(SlashCommandPlugin);
    editor.use(PageBreakPlugin);
    editor.use(DocumentOutlinePlugin);
    editor.use(FootnotePlugin);
    editor.use(TableOfContentsPlugin);
    editor.use(HelloWorldPlugin);
    editor.use(ProductivityPlugin);

    const internalEditor = editor.getInternalEditor();

    // 2. Setup UI Handlers
    setupToolbar(editor, internalEditor);
    setupRevisionHistoryUI(internalEditor);
    setupFindReplaceUI(internalEditor);
    setupEmojiUI(internalEditor);
    setupToolbarSettingsUI();
    ToolbarCustomization.init();
    I18nManager.init();
    AccessibilityManager.init();

    // 3. Initialize File Management
    UploadManager.register(Base64UploadAdapter);
    UploadManager.register(CKBoxUploadAdapter);
    UploadManager.register(CustomUploadAdapter);
    UploadManager.setAdapter('base64');

    // 4. Autosave Logic (Restore Check)
    if (hasAutosavedState()) {
      setTimeout(() => {
        if (confirm("An unsaved draft was found. Do you want to restore it?")) {
          loadAutosavedState(internalEditor);
        }
      }, 500);
    }
  }
}