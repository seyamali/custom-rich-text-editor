export const MODALS_HTML = `
      <!-- Find & Replace Dialog -->
      <div id="find-replace-dialog" class="find-replace-dialog hidden">
          <input type="text" id="find-input" placeholder="Find..." />
          <input type="text" id="replace-input" placeholder="Replace with..." />
          <div class="find-replace-buttons">
              <button id="find-next-btn">Find Next</button>
              <button id="replace-btn">Replace</button>
              <button id="replace-all-btn">Replace All</button>
              <button id="close-find-btn">❌</button>
          </div>
      </div>
      
      <!-- Emoji Dialog -->
      <div id="emoji-dialog" class="emoji-picker hidden">
          <div class="emoji-header">
              <span>Pick an Emoji</span>
              <button id="close-emoji-btn">❌</button>
          </div>
          <div id="emoji-grid" class="emoji-grid"></div>
      </div>
      
      <!-- Revision History Panel -->
      <div class="revision-panel">
          <h3>Revision History</h3>
          <div class="revision-controls">
              <button id="save-revision-btn">💾 Save Version</button>
              <button id="clear-history-btn">❌ Clear All</button>
          </div>
          <div id="revision-list" class="revision-list">
              <!-- Revisions inserted here -->
          </div>
      </div>

      <!-- Toolbar Settings Modal -->
      <div id="toolbar-settings-modal" class="modal hidden">
          <div class="modal-content">
              <h3>Customize Toolbar</h3>
              <p>Show/Hide toolbar items:</p>
              <div id="toolbar-items-list" class="settings-grid"></div>
              <div class="modal-footer">
                  <button id="save-toolbar-settings" class="btn-primary">Save Changes</button>
                  <button id="reset-toolbar-settings" class="btn-secondary">Reset to Default</button>
                  <button id="close-toolbar-settings" class="btn-ghost" style="margin-top: 10px;">Cancel</button>
              </div>
          </div>
      </div>
      <!-- Link Popover -->
      <div id="link-popover" class="link-popover hidden">
          <div class="link-popover-main">
              <input type="text" id="link-url-input" placeholder="Paste or type a link..." />
              <button id="link-apply-btn" class="btn-primary-sm">Apply</button>
              <span class="divider-v"></span>
              <button id="link-open-btn" class="btn-icon-sm" title="Open Link">↗️</button>
              <button id="link-remove-btn" class="btn-icon-sm" title="Remove Link">🗑️</button>
          </div>
          <div class="link-popover-footer">
            <label><input type="checkbox" id="link-target-checkbox" /> Open in new tab</label>
          </div>
      </div>
`;
