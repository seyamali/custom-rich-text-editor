# Code Blocks Feature - Implementation Documentation

## Overview

The Code Blocks feature provides comprehensive support for inserting, editing, and formatting programming code within the editor. This implementation includes both **block-level code blocks** and **inline code** formatting.

## Features Implemented

### ✅ 1. Block-Level Code Blocks

- **Multi-line code support** with preserved indentation and line breaks
- **Language-specific syntax highlighting** (23+ languages supported)
- **Visual code block wrapper** with distinct styling
- **Copy to clipboard** functionality with visual feedback
- **Language badge** displaying the selected programming language
- **Scrollable content** for long code snippets

### ✅ 2. Inline Code

- **Inline code formatting** using `<code>` tags
- **Keyboard shortcut support** (Ctrl+Shift+C or Cmd+Shift+C)
- **Distinct visual styling** with background highlight
- **Preserved within normal text flow**

### ✅ 3. Language Support

The following programming languages are supported:

- JavaScript, TypeScript
- Python, Java, C++, C#
- PHP, Ruby, Go, Rust
- Swift, Kotlin
- HTML, CSS, SCSS
- JSON, XML, YAML
- Markdown, SQL
- Bash, PowerShell
- Plain Text

### ✅ 4. Keyboard Navigation & Editing

| Action | Behavior |
|--------|----------|
| **Tab** | Inserts tab character (indentation) |
| **Shift+Tab** | Removes leading tab/spaces (dedentation) |
| **Enter** | Creates new line with auto-indentation |
| **Enter** (on empty line) | Exits code block and creates paragraph below |
| **Shift+Enter** (on empty line) | Exits code block and creates paragraph below |
| **Esc** | Exits code block and creates paragraph below |
| **Arrow keys** | Normal navigation within code block |

### ✅ 5. Clipboard Support

- **Copy/Paste preserves formatting** (line breaks, indentation)
- **Paste detection** automatically converts to plain text within code blocks
- **Copy button** for easy code snippet copying
- **Visual feedback** when code is copied

### ✅ 6. UI Components

#### Code Block Popover
- **Language selector** dropdown
- **Delete code block** button
- **Auto-positioning** (appears below or above code block)
- **Click-outside to dismiss**

#### Toolbar Integration
- **"Code Block" button** in the toolbar
- **Language selection prompt** on insertion
- **Visual state indicators**

### ✅ 7. Undo/Redo Support

- **Code block insertion** = 1 undo step
- **Editing within code block** = incremental undo steps
- **Language change** = 1 undo step
- **Deletion** = 1 undo step

### ✅ 8. Security & Sanitization

- **XSS prevention** - HTML tags are escaped and displayed as text
- **Safe clipboard operations** - no script execution
- **Content validation** - all pasted content is sanitized

## File Structure

```
src/
├── plugins/advanced/
│   ├── code-block-node.ts          # Custom CodeBlockNode with language support
│   └── code-blocks.ts               # Plugin with commands and keyboard handlers
├── ui/
│   ├── code-block-popover-ui.ts    # Language selector popover
│   └── css/
│       ├── code-blocks.css          # Code block wrapper and styling
│       ├── code-block-popover.css   # Popover styling
│       └── code-syntax.css          # Syntax highlighting colors
└── core/
    └── engine.ts                    # CodeBlockNode registration
```

## Usage

### Inserting a Code Block

1. **Via Toolbar**: Click the "Code Block" button
2. **Via Keyboard**: Use the keyboard shortcut (if configured)
3. **Via Command**: Dispatch `INSERT_CODE_BLOCK_COMMAND` with optional language

```typescript
editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, 'javascript');
```

### Changing Language

1. **Click on the code block** to show the popover
2. **Select language** from the dropdown
3. **Language badge** updates automatically

### Copying Code

1. **Click the "Copy" button** in the top-right corner
2. **Visual feedback** shows "Copied!" for 2 seconds
3. **Code is copied** to clipboard as plain text

### Keyboard Shortcuts

- **Tab**: Indent (insert tab character)
- **Shift+Tab**: Dedent (remove leading whitespace)
- **Enter**: New line with auto-indentation
- **Esc**: Exit code block

## Styling Customization

### Code Block Colors

The code blocks use a dark theme by default (One Dark inspired):

- **Background**: `#282c34`
- **Text**: `#abb2bf`
- **Keywords**: `#c678dd` (purple)
- **Functions**: `#61afef` (blue)
- **Strings**: `#98c379` (green)
- **Comments**: `#5c6370` (gray, italic)
- **Numbers**: `#d19a66` (orange)

### Customizing Styles

Edit `src/ui/css/code-blocks.css` to customize:

```css
.code-block-wrapper {
    background: #your-color;
    border-radius: 8px;
    /* ... */
}
```

## API Reference

### Commands

#### INSERT_CODE_BLOCK_COMMAND
```typescript
type Payload = string | null; // Language or null for plain text
editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, 'python');
```

#### SET_CODE_LANGUAGE_COMMAND
```typescript
type Payload = { nodeKey: string; language: string };
editor.dispatchCommand(SET_CODE_LANGUAGE_COMMAND, {
    nodeKey: 'abc123',
    language: 'typescript'
});
```

#### TOGGLE_LINE_NUMBERS_COMMAND
```typescript
type Payload = string; // Node key
editor.dispatchCommand(TOGGLE_LINE_NUMBERS_COMMAND, 'abc123');
```

### Node Methods

#### CodeBlockNode

```typescript
// Get/Set language
node.getLanguage(): string | null
node.setLanguage(language: string | null): this

// Get/Set line numbers
node.getShowLineNumbers(): boolean
node.setShowLineNumbers(show: boolean): void

// Check if node can be indented
node.canIndent(): false
node.canInsertTab(): boolean
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (with touch support)

## Known Limitations

1. **Line numbers** are optional and not yet fully implemented in the UI
2. **Syntax highlighting** uses CSS classes (no runtime parser like Prism.js)
3. **Auto-completion** is not included (can be added as enhancement)
4. **Code folding** is not supported

## Future Enhancements

- [ ] Add Prism.js or Highlight.js for advanced syntax highlighting
- [ ] Implement line numbers toggle in UI
- [ ] Add code formatting/beautification
- [ ] Support for code themes (light/dark mode)
- [ ] Export code blocks to separate files
- [ ] Code diff visualization
- [ ] Collaborative code editing with cursors

## Testing Checklist

- [x] Insert code block via toolbar
- [x] Tab/Shift+Tab indentation works
- [x] Enter maintains indentation
- [x] Esc exits code block
- [x] Copy button copies code
- [x] Language selector changes language
- [x] Delete button removes code block
- [x] Paste preserves formatting
- [x] Undo/Redo works correctly
- [x] Inline code formatting works
- [x] XSS protection (HTML is escaped)

## Troubleshooting

### Code block not appearing?
- Check that `CodeBlockNode` is registered in `engine.ts`
- Verify CSS files are imported in `style.css`

### Copy button not working?
- Ensure browser has clipboard permissions
- Check browser console for errors

### Language selector not showing?
- Verify `setupCodeBlockPopover` is called in `toolbar-setup.ts`
- Check that popover CSS is loaded

### Syntax highlighting not working?
- Verify theme classes are defined in `engine.ts`
- Check that `registerCodeHighlighting` is called in plugin

## Credits

- **Lexical Framework**: Meta (Facebook)
- **Color Scheme**: One Dark (Atom Editor)
- **Icons**: Unicode emoji

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
