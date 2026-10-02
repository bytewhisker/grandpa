# Transform Callback / Promise Hell to Async Pipeline

Write an exported function `processPipeline(initialValue, steps = [])` that:
1. Runs sequential async operations `steps = [async (val) => nextVal, ...]`.
2. Passes accumulated value from each step to the next.
3. If any step fails, catches the error and returns `{ success: false, error: err.message, stepIndex }`.
4. Returns `{ success: true, value: finalValue }` on completion.
