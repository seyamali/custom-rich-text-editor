import { ToolbarCustomization, type ToolbarItemConfig } from './toolbar-customization';

export function setupToolbarSettingsUI() {
    const modal = document.getElementById('toolbar-settings-modal');
    const openBtn = document.getElementById('toolbar-settings-btn');
    const closeBtn = document.getElementById('close-toolbar-settings');
    const saveBtn = document.getElementById('save-toolbar-settings');
    const resetBtn = document.getElementById('reset-toolbar-settings');
    const listContainer = document.getElementById('toolbar-items-list');

    if (!modal || !openBtn || !closeBtn || !saveBtn || !resetBtn || !listContainer) return;

    let currentConfig: ToolbarItemConfig[] = [];

    const renderItems = (config: ToolbarItemConfig[]) => {
        listContainer.innerHTML = '';
        config.forEach(item => {
            const div = document.createElement('div');
            div.className = 'settings-item';
            div.innerHTML = `
                <input type="checkbox" id="check-${item.id}" ${item.visible ? 'checked' : ''}>
                <label for="check-${item.id}">${item.label}</label>
            `;
            listContainer.appendChild(div);
        });
    };

    openBtn.addEventListener('click', () => {
        currentConfig = ToolbarCustomization.getConfig();
        renderItems(currentConfig);
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    saveBtn.addEventListener('click', () => {
        const config = ToolbarCustomization.getConfig();
        const newConfig = config.map(item => {
            const checkbox = document.getElementById(`check-${item.id}`) as HTMLInputElement;
            return {
                ...item,
                visible: checkbox ? checkbox.checked : item.visible
            };
        });
        ToolbarCustomization.saveConfig(newConfig);
        modal.classList.add('hidden');
    });

    resetBtn.addEventListener('click', () => {
        if (confirm("Reset toolbar to default?")) {
            const defaultConfig = ToolbarCustomization.getDefaultConfig();
            ToolbarCustomization.saveConfig(defaultConfig);
            renderItems(defaultConfig);
            modal.classList.add('hidden');
        }
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}
