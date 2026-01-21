const announcer = document.getElementById('announcer');

export const AccessibilityManager = {
    /**
     * Announces a message to screen readers via aria-live region.
     */
    announce: (message: string) => {
        if (announcer) {
            announcer.textContent = message;
            // Clear after announcement to allow repeat messages
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    },

    /**
     * Setup keyboard shortcuts overview (can be extended to a modal later)
     */
    setupKeyboardListeners: () => {
        window.addEventListener('keydown', (e) => {
            // Example: Alt + 0 for accessibility help (if we implement a help modal)
            if (e.altKey && e.key === '0') {
                AccessibilityManager.announce("Accessibility Help: Use Tab to navigate toolbar, Ctrl + B for bold, Ctrl + I for italic.");
            }
        });
    },

    init: () => {
        AccessibilityManager.setupKeyboardListeners();
        console.log("Accessibility Manager initialized (WCAG)");
    }
};
