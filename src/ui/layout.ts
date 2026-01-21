import { TOOLBAR_HTML } from './components/toolbar-html';
import { EDITOR_MAIN_HTML } from './components/editor-main-html';
import { STATUS_BAR_HTML } from './components/status-bar-html';
import { MODALS_HTML } from './components/modals-html';

export const EDITOR_LAYOUT_HTML = `
    <div id="editor-wrapper" class="editor-wrapper" role="application" aria-label="Rich Text Editor Container">
      ${TOOLBAR_HTML}
      ${EDITOR_MAIN_HTML}
      ${STATUS_BAR_HTML}
      ${MODALS_HTML}
      <!-- Visually Hidden Announcer -->
      <div id="announcer" class="sr-only" aria-live="assertive"></div>
    </div>
`;
