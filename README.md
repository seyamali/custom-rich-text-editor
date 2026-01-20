# My Universal Editor

A powerful, customizable rich text editor built with [Lexical](https://lexical.dev/), designed content creation with a clean, modern interface.

![Editor Preview](https://via.placeholder.com/800x400?text=My+Universal+Editor+Preview)

## 🚀 Features

This editor comes packed with essential features for web content editing:

### 📝 Text Formatting
- **Basic Styles**: Bold, Italic, Underline, Strikethrough
- **Advanced Styles**: Subscript, Superscript, Inline Code
- **Clear Formatting**: Quickly reset text styles

### 📐 Layout & Structure
- **Headings**: Support for H1 and H2 headers
- **Lists**: Ordered (numbered) and Unordered (bulleted) lists
- **Indentation**: Increase or decrease indent levels
- **Dividers**: Insert horizontal rules to separate content

### 🖼️ Media & Rich Content
- **Images**: Upload and embed local images directly into the editor
- **Links**: Insert and manage hyperlinks (with auto-link detection)

### 🛠️ Essentials
- **History**: Robust Undo/Redo stack
- **Clipboard**: Seamless copy/paste handling

## 🛠️ Tech Stack

- **Core Engine**: [Meta Lexical](https://lexical.dev/)
- **Language**: TypeScript
- **Bundler**: Vite
- **Styling**: Vanilla CSS (Custom extensible theme)

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd my-universal-editor
npm install
```

## 🏃‍♂️ Usage

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## 📂 Project Structure

```
src/
├── core/           # Core editor engine and plugin registry
├── plugins/        # Feature modules
│   ├── essentials/ # History, Clipboard
│   ├── formatting/ # Bold, Italic, etc.
│   ├── layout/     # Lists, Headings
│   └── media/      # Images, Links
├── style.css       # Editor themes and UI styling
└── main.ts         # Application entry point
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
