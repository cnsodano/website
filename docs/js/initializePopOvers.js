document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
        const popover = new bootstrap.Popover(el, {
            popperConfig: {
                strategy: 'fixed',
                modifiers: [
                    { name: 'hide', enabled: false },
                    { name: 'preventOverflow', enabled: false },
                    { name: 'flip', enabled: false },
                    // Replace Popper's continuous repositioning with a one-time placement
                    {
                        name: 'lockPosition',
                        enabled: true,
                        phase: 'write',
                        fn: ({ state }) => {
                            // After Popper places it the first time, freeze x/y and disable updates
                            if (!state.elements.popper._locked) {
                                state.elements.popper._locked = true;
                                const { x, y } = state;
                                state.elements.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                                // Stop Popper from running again
                                state.elements.popper.style.position = 'fixed';
                            }
                        }
                    }
                ]
            }
        });

        // Freeze position on shown event
        el.addEventListener('shown.bs.popover', () => {
            const tip = popover.getTipElement();
            // Snapshot current fixed position and hardcode it
            const rect = tip.getBoundingClientRect();
            tip.style.position = 'fixed';
            tip.style.transform = 'none';
            tip.style.top = rect.top + 'px';
            tip.style.left = rect.left + 'px';
            tip.style.inset = 'auto';
        });
    });
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [ ...tooltipTriggerList ].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
});
