import { type LexicalEditor } from 'lexical';

export interface SlashCommand {
    label: string;
    description?: string;
    icon: string;
    execute: (editor: LexicalEditor) => void;
}

export class SlashMenuUI {
    menuElement: HTMLElement;
    items: SlashCommand[] = [];
    selectedIndex: number = 0;
    isVisible: boolean = false;
    currentQuery: string = '';

    private editor: LexicalEditor;
    private commands: SlashCommand[];

    constructor(editor: LexicalEditor, commands: SlashCommand[]) {
        this.editor = editor;
        this.commands = commands;
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'slash-menu';
        document.body.appendChild(this.menuElement);
    }

    show(rect: DOMRect, query: string) {
        this.isVisible = true;
        this.currentQuery = query;
        this.selectedIndex = 0;

        // Filter commands
        const filtered = this.commands.filter(cmd =>
            cmd.label.toLowerCase().includes(query.toLowerCase())
        );

        this.renderItems(filtered);

        if (filtered.length === 0) {
            this.hide();
            return;
        }

        // Position menu
        this.menuElement.classList.add('visible');
        this.menuElement.style.top = `${rect.bottom + window.scrollY}px`;
        this.menuElement.style.left = `${rect.left + window.scrollX}px`;
    }

    hide() {
        this.isVisible = false;
        this.menuElement.classList.remove('visible');
    }

    renderItems(commands: SlashCommand[]) {
        this.menuElement.innerHTML = '';
        this.items = commands;

        commands.forEach((cmd, index) => {
            const el = document.createElement('div');
            el.className = `slash-item ${index === this.selectedIndex ? 'selected' : ''}`;
            el.innerHTML = `
                <span class="slash-item-icon">${cmd.icon}</span>
                <span class="slash-item-label">${cmd.label}</span>
            `;
            el.addEventListener('click', () => {
                this.executeCommand(cmd);
            });
            el.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
            this.menuElement.appendChild(el);
        });
    }

    updateSelection() {
        const children = this.menuElement.children;
        for (let i = 0; i < children.length; i++) {
            if (i === this.selectedIndex) {
                children[i].classList.add('selected');
                children[i].scrollIntoView({ block: 'nearest' });
            } else {
                children[i].classList.remove('selected');
            }
        }
    }

    executeCommand(cmd: SlashCommand) {
        // We assume the caller handles deleting the slash text
        cmd.execute(this.editor);
        this.hide();
    }

    moveUp() {
        if (!this.isVisible) return;
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.updateSelection();
    }

    moveDown() {
        if (!this.isVisible) return;
        this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
        this.updateSelection();
    }

    selectAction(): SlashCommand | null {
        if (!this.isVisible || this.items.length === 0) return null;
        return this.items[this.selectedIndex];
    }
}
