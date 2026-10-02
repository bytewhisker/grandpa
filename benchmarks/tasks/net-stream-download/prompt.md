# Consume ReadableStream to Buffer/String

Write an exported function `consumeStream(readableStream, encoding = 'utf-8')` that:
1. Reads all chunks from a `ReadableStream` using a reader.
2. Concatenates string or Uint8Array chunks.
3. Returns the complete accumulated string.
4. Cleans up reader on error or completion.
