import {
    $getSelection,
    $isRangeSelection,
    type LexicalEditor,
    COMMAND_PRIORITY_LOW,
    CLICK_COMMAND
} from 'lexical';
import type { EditorPlugin } from '../../core/registry';
import { EditorSDK } from '../../core/sdk';

// Store the copied format style
let copiedFormat: number | null = null;
let isPainting = false;

export const FormatPainterPlugin: EditorPlugin = {
    name: 'format-painter',
    init: (sdk: EditorSDK) => {
        // Register click listener to apply format
        sdk.registerCommand(
            CLICK_COMMAND,
            () => {
                if (isPainting && copiedFormat !== null) {
                    // We need to wait for the selection to update after the click
                    setTimeout(() => {
                        sdk.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                selection.format = copiedFormat!;
                            }
                        });
                        // Turn off painting after one use (single-shot)
                        togglePainting(false);
                    }, 50);
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }
};

export const FormatPainter = {
    /**
     * Copies the format of the current selection.
     */
    copyFormat: (editor: LexicalEditor) => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                copiedFormat = selection.format;
                console.log("Format copied:", copiedFormat);
                togglePainting(true);
            } else {
                alert("Select some text to copy its format first.");
            }
        });
    },

    isPainting: () => isPainting
};

function togglePainting(active: boolean) {
    isPainting = active;
    const btn = document.getElementById('format-painter-btn');
    if (btn) {
        if (active) {
            btn.classList.add('active');
            btn.style.backgroundColor = '#ffc107'; // Yellow to indicate active tool
            document.body.style.cursor = 'copy'; // Change cursor
        } else {
            btn.classList.remove('active');
            btn.style.backgroundColor = '';
            document.body.style.cursor = 'default';
        }
    }
}
