import { type LexicalEditor } from 'lexical';
import { FindReplace } from './find-replace';

export function setupFindReplaceUI(internalEditor: LexicalEditor) {
    const findDialog = document.getElementById('find-replace-dialog');
    const findInput = document.getElementById('find-input') as HTMLInputElement;
    const replaceInput = document.getElementById('replace-input') as HTMLInputElement;

    if (!findDialog) return;

    document.getElementById('find-btn')?.addEventListener('click', () => {
        findDialog.classList.toggle('hidden');
        findInput.focus();
    });

    document.getElementById('close-find-btn')?.addEventListener('click', () => {
        findDialog.classList.add('hidden');
    });

    document.getElementById('find-next-btn')?.addEventListener('click', () => {
        FindReplace.findNext(internalEditor, findInput.value);
    });

    document.getElementById('replace-btn')?.addEventListener('click', () => {
        FindReplace.replace(internalEditor, findInput.value, replaceInput.value);
    });

    document.getElementById('replace-all-btn')?.addEventListener('click', () => {
        if (confirm(`Replace all occurrences of "${findInput.value}" with "${replaceInput.value}"?`)) {
            FindReplace.replaceAll(internalEditor, findInput.value, replaceInput.value);
        }
    });
}
