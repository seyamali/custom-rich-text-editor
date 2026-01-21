import { $insertNodes } from 'lexical';
import { $createYouTubeNode } from './youtube-node.ts';
import { $createHTMLSnippetNode } from './html-snippet-node.ts';

export const MediaEmbedPlugin = {
    insertYouTube: (editor: any) => {
        const url = window.prompt("Enter YouTube URL:", "https://www.youtube.com/watch?v=");

        if (url) {
            // Regex to extract the 11-character YouTube ID
            const match = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/.exec(url);
            const videoId = (match && match[2].length === 11) ? match[2] : null;

            if (videoId) {
                editor.getInternalEditor().update(() => {
                    const node = $createYouTubeNode(videoId);
                    $insertNodes([node]);
                });
            } else {
                alert("Invalid YouTube URL. Please try again.");
            }
        }
    },

    insertHTMLSnippet: (editor: any) => {
        const html = window.prompt("Paste your HTML snippet here:");
        if (html) {
            editor.getInternalEditor().update(() => {
                $insertNodes([$createHTMLSnippetNode(html)]);
            });
        }
    }
};