# Pub-Sub Hub with Leak-Proof Disposer

Write an exported class `SubscriptionHub` that provides:
- `subscribe(topic, handler)`: returns disposer object with `dispose()`.
- `publish(topic, data)`: sends data to active handlers.
- `getListenerCount(topic)`: returns count of active listeners. Calling `dispose()` must decrement count and prevent listener leaks.
