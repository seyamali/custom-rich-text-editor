import { type LexicalEditor, $getNodeByKey } from 'lexical';
import { ImageNode } from './image-node';

export function setupImageResizer(editor: LexicalEditor) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let aspectRatio = 1;
    let activeNodeKey: string | null = null;
    let activeDirection: string | null = null;

    const onMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('resizer-handle')) {
            e.preventDefault();
            e.stopPropagation();

            const imageWrapper = target.closest('.image-wrapper') as HTMLElement;
            if (!imageWrapper) return;

            const img = imageWrapper.querySelector('img');
            if (!img) return;

            activeNodeKey = imageWrapper.getAttribute('data-node-key');
            if (!activeNodeKey) return;

            isResizing = true;
            startX = e.clientX;
            startWidth = img.clientWidth;
            aspectRatio = startWidth / img.clientHeight;

            activeDirection = target.className.split(' ').find(c => c.startsWith('handle-'))?.replace('handle-', '') || 'se';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isResizing || !activeNodeKey) return;

        const diffX = e.clientX - startX;
        let nextWidth = startWidth;

        if (activeDirection?.includes('e')) nextWidth = startWidth + diffX;
        if (activeDirection?.includes('w')) nextWidth = startWidth - diffX;

        // Boundaries
        if (nextWidth < 20) nextWidth = 20;

        const nextHeight = nextWidth / aspectRatio;

        // Visual update only during drag
        const selectedImg = document.querySelector(`.image-wrapper[data-node-key="${activeNodeKey}"] img`) as HTMLImageElement;
        if (selectedImg) {
            selectedImg.style.width = `${nextWidth}px`;
            selectedImg.style.height = `${nextHeight}px`;
        }
    };

    const onMouseUp = () => {
        if (!isResizing || !activeNodeKey) return;
        isResizing = false;

        const img = document.querySelector(`.image-wrapper[data-node-key="${activeNodeKey}"] img`) as HTMLImageElement;
        if (img) {
            const finalWidth = img.clientWidth;
            const finalHeight = img.clientHeight;
            const key = activeNodeKey;

            editor.update(() => {
                const node = $getNodeByKey(key);
                if (node instanceof ImageNode) {
                    node.setWidthAndHeight(finalWidth, finalHeight);
                }
            });
        }

        activeNodeKey = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousedown', onMouseDown);
}
