import assert from 'node:assert';
import { consumeStream } from './candidate.js';

// Create a mock stream with 3 chunks
const chunks = ['Hello', ' ', 'World!'];
const stream = new ReadableStream({
  start(controller) {
    for (const c of chunks) {
      controller.enqueue(new TextEncoder().encode(c));
    }
    controller.close();
  }
});

const result = await consumeStream(stream);
assert.strictEqual(result, 'Hello World!');
