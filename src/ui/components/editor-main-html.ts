export const EDITOR_MAIN_HTML = `
      <div class="editor-main-area">
          <div id="editor-canvas" class="editor-container" role="textbox" aria-multiline="true" aria-label="Rich Text Content"></div>
          <div id="document-outline" class="document-outline hidden" role="complementary" aria-label="Document Outline">
              <h3 data-i18n="outline">Outline</h3>
              <div id="outline-list" role="list"></div>
          </div>
      </div>
      <textarea id="source-editor" class="source-view-area" style="display: none;"></textarea>
`;
