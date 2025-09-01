const { getStore } = require('@netlify/blobs');

let __store;
function ensureStore() {
  if (!__store) __store = getStore({ name: 'pcs-senior-assassin' });
  return __store;
}

// wherever you used `store` before:
await ensureStore().get(key, { type: 'json' });
await ensureStore().set(key, JSON.stringify(value), { contentType: 'application/json' });
