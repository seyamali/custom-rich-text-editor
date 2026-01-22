# Code Blocks Feature - Quick Start Guide

## 🚀 What's New

You now have a **fully-featured Code Blocks system** in your editor! This includes:

✅ **Block-level code blocks** with syntax highlighting  
✅ **Inline code** formatting  
✅ **23+ programming languages** supported  
✅ **Copy to clipboard** button  
✅ **Language selector** popover  
✅ **Tab/Shift+Tab** indentation  
✅ **Auto-indentation** on Enter  
✅ **Paste formatting** preservation  

---

## 🎯 How to Use

### 1. Insert a Code Block

**Method 1: Toolbar Button**
1. Click the **"Code Block"** button in the toolbar
2. Enter a language (e.g., `javascript`, `python`) or leave empty
3. Start typing your code!

**Method 2: Programmatically**
```typescript
editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, 'typescript');
```

### 2. Edit Code

Once inside a code block:
- **Tab** → Indent (adds tab character)
- **Shift+Tab** → Dedent (removes leading whitespace)
- **Enter** → New line with auto-indentation

**To exit the code block and add plain text:**
- **Press Enter twice** on an empty line, OR
- **Press Shift+Enter** on an empty line, OR
- **Press Esc** key

This will create a new paragraph below the code block where you can type normal text!

### 3. Change Language

1. **Click inside the code block**
2. A **popover appears** with language selector
3. **Choose your language** from the dropdown
4. The **language badge** updates automatically

### 4. Copy Code

1. **Hover over the code block**
2. Click the **"📋 Copy"** button in the top-right
3. Code is **copied to clipboard**
4. Button shows **"✓ Copied!"** feedback

### 5. Delete Code Block

1. **Click inside the code block**
2. Click the **"🗑️ Delete"** button in the popover
3. Code block is **removed**

---

## 🎨 Example

Try inserting this JavaScript code:

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
    return true;
}

greet('World');
```

You should see:
- **Dark background** (#282c34)
- **Syntax highlighting** (purple keywords, blue functions, green strings)
- **Copy button** in top-right
- **Language badge** showing "JAVASCRIPT"

---

## 🔧 Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| JavaScript | `javascript` | TypeScript | `typescript` |
| Python | `python` | Java | `java` |
| C++ | `cpp` | C# | `csharp` |
| PHP | `php` | Ruby | `ruby` |
| Go | `go` | Rust | `rust` |
| Swift | `swift` | Kotlin | `kotlin` |
| HTML | `html` | CSS | `css` |
| SCSS | `scss` | JSON | `json` |
| XML | `xml` | YAML | `yaml` |
| Markdown | `markdown` | SQL | `sql` |
| Bash | `bash` | PowerShell | `powershell` |
| Plain Text | `plaintext` | | |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Tab** | Indent code |
| **Shift+Tab** | Dedent code |
| **Enter** | New line with auto-indent |
| **Enter** (on empty line) | Exit code block |
| **Shift+Enter** (on empty line) | Exit code block |
| **Esc** | Exit code block |
| **Ctrl/Cmd+Shift+C** | Format as inline code |

---

## 🎨 Inline Code

For short code snippets within text, select text and press:
- **Windows/Linux**: `Ctrl+Shift+C`
- **Mac**: `Cmd+Shift+C`

Or use the **"<code>&lt;/&gt;</code>"** button in the toolbar.

Example: `const x = 42;` ← This is inline code!

---

## 🔍 Testing Checklist

Try these to verify everything works:

- [ ] Insert a code block via toolbar
- [ ] Type some code with indentation
- [ ] Press Tab to indent
- [ ] Press Shift+Tab to dedent
- [ ] Press Enter to see auto-indentation
- [ ] Click the Copy button
- [ ] Change the language via popover
- [ ] Delete the code block
- [ ] Paste code from another source
- [ ] Use Undo/Redo
- [ ] Format inline code

---

## 🐛 Troubleshooting

**Q: Code block button doesn't appear?**  
A: Refresh the page. The plugin should auto-load.

**Q: Copy button doesn't work?**  
A: Check browser clipboard permissions. Some browsers require HTTPS.

**Q: Syntax highlighting not showing?**  
A: Make sure you selected a language from the popover.

**Q: Can't exit code block?**  
A: Press **Esc** or click outside the code block.

---

## 📚 More Info

See **[CODE_BLOCKS.md](./CODE_BLOCKS.md)** for:
- Complete API reference
- Customization guide
- Advanced features
- Architecture details

---

**Enjoy coding! 🎉**
