export function createAuthClient({ getAccessToken, refreshAccessToken, fetchFn = globalThis.fetch }) {
  return {
    async request(url, options = {}) {
      // TODO: implement
    }
  };
}