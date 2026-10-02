# Modal Dialog State & Escape Key Controller

Write an exported function `createDialogController(initialOpen = false)` that returns:
- `isOpen()`: returns boolean.
- `open()`: opens dialog.
- `close()`: closes dialog.
- `handleKeyDown(event)`: closes dialog if `event.key === 'Escape'` and dialog is open.
