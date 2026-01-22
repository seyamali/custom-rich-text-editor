
import {
    type LexicalCommand,
    createCommand,
    COMMAND_PRIORITY_EDITOR,
    $insertNodes,
    PASTE_COMMAND
} from 'lexical';
import { type EditorPlugin } from '../../core/registry';
import { type EditorSDK } from '../../core/sdk';
import { $createYouTubeNode } from '../advanced/youtube-node';
import { $createHTMLSnippetNode } from '../advanced/html-snippet-node';
import { setupImageResizer } from './image-resizer';

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
    'INSERT_YOUTUBE_COMMAND'
);

export const INSERT_HTML_SNIPPET_COMMAND: LexicalCommand<string> = createCommand(
    'INSERT_HTML_SNIPPET_COMMAND'
);

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

export class EmbedPlugin implements EditorPlugin {
    name = 'EmbedPlugin';

    init(sdk: EditorSDK) {
        const editor = sdk.getLexicalEditor();

        // 1. Register YouTube Command
        sdk.registerCommand(
            INSERT_YOUTUBE_COMMAND,
            (videoID: string) => {
                editor.update(() => {
                    const node = $createYouTubeNode(videoID);
                    $insertNodes([node]);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 2. Register HTML Snippet Command
        sdk.registerCommand(
            INSERT_HTML_SNIPPET_COMMAND,
            (html: string) => {
                editor.update(() => {
                    const node = $createHTMLSnippetNode(html);
                    $insertNodes([node]);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // 3. Setup Universal Resizer
        setupImageResizer(editor);

        // 4. Toolbar Button (Smart "Embed" that handles URL or HTML)
        sdk.addToolbarButton({
            id: 'embed-media-btn',
            label: 'Embed',
            icon: '📺',
            tooltip: 'Embed Video, HTML, or Iframe',
            onClick: () => {
                const input = window.prompt('Enter YouTube URL or Paste HTML Code:');
                if (input) {
                    const trimmed = input.trim();
                    const youtubeMatch = trimmed.match(YOUTUBE_REGEX);

                    if (youtubeMatch && youtubeMatch[1]) {
                        // It's a YouTube URL
                        sdk.dispatchCommand(INSERT_YOUTUBE_COMMAND, youtubeMatch[1]);
                    } else if (trimmed.startsWith('<')) {
                        // It's likely HTML
                        sdk.dispatchCommand(INSERT_HTML_SNIPPET_COMMAND, trimmed);
                    } else {
                        alert('Unrecognized format. Please enter a valid YouTube URL or HTML code (starting with <).');
                    }
                }
            }
        });

        // 5. Auto-Embed on Paste
        sdk.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const text = event.clipboardData?.getData('text/plain');
                if (text) {
                    const match = text.match(YOUTUBE_REGEX);
                    if (match && match[1]) {
                        // Check if it's JUST the link (trimmed)
                        if (text.trim() === match[0]) {
                            event.preventDefault();
                            sdk.dispatchCommand(INSERT_YOUTUBE_COMMAND, match[1]);
                            return true;
                        }
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }
}
