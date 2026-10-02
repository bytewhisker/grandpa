# Type-Safe Event Emitter

Write an exported class `TypedEventEmitter` that implements:
- `on(event, handler)`: registers listener, returns unsubscribe function.
- `emit(event, payload)`: calls all registered listeners with payload.
- `off(event, handler)`: unregisters handler.
