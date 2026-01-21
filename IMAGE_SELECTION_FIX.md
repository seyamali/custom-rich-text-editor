# Image Selection & Deletion Fix

## Problem
Images in the editor were not selectable with the keyboard, couldn't be deleted with Delete/Backspace keys, and linking functionality was not working properly.

## Root Cause
The `ImageNode` class extends `DecoratorNode`, which by default:
- Is not keyboard-selectable (can't navigate to it with arrow keys)
- Doesn't respond to keyboard deletion commands
- Only shows the popover on click, not on keyboard selection

## Solution Implemented

### 1. Made Images Keyboard-Selectable
**File**: `src/plugins/media/image-node.ts`

Added two methods to the `ImageNode` class:
```typescript
// Make the node selectable with keyboard
isInline(): boolean {
    return false;
}

// Allow keyboard selection (arrow keys can select this node)
isKeyboardSelectable(): boolean {
    return true;
}
```

**What this does**: Users can now navigate to images using arrow keys, and the image will be selected as a node.

### 2. Added Keyboard Deletion Support
**File**: `src/plugins/media/image-popover-ui.ts`

Added command handlers for `KEY_DELETE_COMMAND` and `KEY_BACKSPACE_COMMAND`:
```typescript
editor.registerCommand(
    KEY_DELETE_COMMAND,
    () => {
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes();
            if (nodes.length === 1 && $isImageNode(nodes[0])) {
                nodes[0].remove();
                hidePopover();
                return true;
            }
        }
        return false;
    },
    COMMAND_PRIORITY_LOW
);
```

**What this does**: When an image is selected (via keyboard or click), pressing Delete or Backspace will remove it.

### 3. Enhanced Selection Detection
**File**: `src/plugins/media/image-popover-ui.ts`

Updated the `SELECTION_CHANGE_COMMAND` handler to detect both:
- **NodeSelection**: When image is selected via keyboard navigation
- **RangeSelection**: When cursor is placed near/in the image

```typescript
// Check for NodeSelection (keyboard selection of decorator nodes)
if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes();
    if (nodes.length === 1 && $isImageNode(nodes[0])) {
        imageNode = nodes[0];
    }
}
// Check for RangeSelection (cursor-based selection)
else if ($isRangeSelection(selection) && selection.isCollapsed()) {
    // ... existing logic
}
```

**What this does**: The image popover now appears whether you click the image OR navigate to it with arrow keys.

### 4. Added Visual Feedback
**Files**: 
- `src/plugins/media/image-popover-ui.ts`
- `src/ui/css/media-layout.css` (already had the CSS)

When an image is selected, the `selected` class is added to the wrapper:
```typescript
const showPopover = (target: HTMLElement, node: ImageNode) => {
    // ... other code
    target.classList.add('selected');
};

const hidePopover = () => {
    // Remove selected class from all images
    const editorElement = editor.getRootElement();
    if (editorElement) {
        const allWrappers = editorElement.querySelectorAll('.image-wrapper.selected');
        allWrappers.forEach(wrapper => wrapper.classList.remove('selected'));
    }
    popover?.classList.add('hidden');
};
```

**What this does**: Selected images get a blue border and show resize handles.

### 5. Fixed Link URL Input Styling
**File**: `src/ui/css/image-popover.css`

Added styling for `input[type="url"]` to match text inputs.

## How to Use

### Selecting an Image
1. **With Mouse**: Click on any image
2. **With Keyboard**: Use arrow keys to navigate to the image

### Deleting an Image
1. **Select the image** (click or navigate with arrow keys)
2. **Press Delete or Backspace**
3. Alternatively, click the 🗑️ Delete button in the popover

### Linking an Image
1. **Select the image**
2. **Type or paste a URL** in the "🔗 Link URL" field in the popover
3. The link is applied automatically as you type
4. The image will now be wrapped in an `<a>` tag when rendered

### Other Features (Still Working)
- **Alt Text**: Type in the "Alt text..." field
- **Alignment**: Click Left/Center/Right/Full buttons
- **Caption**: Click the 💬 Caption button to toggle caption visibility
- **Resize**: Hover over selected image and drag corner handles

## Testing Checklist

- [x] Images can be selected with arrow keys
- [x] Selected images show blue border
- [x] Popover appears when image is keyboard-selected
- [x] Delete key removes selected image
- [x] Backspace key removes selected image
- [x] Delete button in popover works
- [x] Link URL field accepts input
- [x] Link URL is applied to image
- [x] Alt text field works
- [x] Alignment buttons work
- [x] Caption toggle works
- [x] Image resizing still works
- [x] Click selection still works

## Technical Notes

### Why DecoratorNodes Need Special Handling
Lexical's `DecoratorNode` is designed for custom rendering (like images, embeds, etc.). By default:
- They're not part of the normal text flow
- They don't participate in keyboard navigation
- They need explicit `isKeyboardSelectable()` to be arrow-key navigable

### NodeSelection vs RangeSelection
- **NodeSelection**: Used when entire nodes (like images) are selected
- **RangeSelection**: Used for text selection and cursor position
- We need to handle both to support all selection methods

### Command Priority
We use `COMMAND_PRIORITY_LOW` to ensure our handlers don't interfere with higher-priority commands (like native text editing).
