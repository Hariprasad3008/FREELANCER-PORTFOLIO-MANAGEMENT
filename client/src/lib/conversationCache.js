const STORAGE_KEY = "conversation-cache";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCache() {
  if (!isBrowser()) return { byPair: {}, byConversation: {} };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { byPair: {}, byConversation: {} };
    const parsed = JSON.parse(raw);
    return {
      byPair: parsed.byPair || {},
      byConversation: parsed.byConversation || {},
    };
  } catch (err) {
    console.warn("Failed to parse conversation cache", err);
    return { byPair: {}, byConversation: {} };
  }
}

function writeCache(cache) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn("Failed to persist conversation cache", err);
  }
}

export function getCachedConversationId(userId, targetId) {
  if (!userId || !targetId) return null;
  const cache = readCache();
  return cache.byPair?.[userId]?.[targetId]?.conversationId || null;
}

export function cacheConversationPair(userId, targetId, conversationId, meta = {}) {
  if (!userId || !targetId || !conversationId) return;
  const cache = readCache();
  cache.byPair[userId] = cache.byPair[userId] || {};
  cache.byPair[userId][targetId] = {
    conversationId,
    targetId,
    targetName: meta.full_name || meta.name || null,
    updatedAt: Date.now(),
  };

  cache.byConversation[conversationId] = {
    targetId,
    targetName: meta.full_name || meta.name || null,
    updatedAt: Date.now(),
  };

  writeCache(cache);
}

export function clearCachedConversation(userId, targetId, conversationId) {
  const cache = readCache();

  if (userId && targetId && cache.byPair?.[userId]?.[targetId]) {
    delete cache.byPair[userId][targetId];
  }

  if (conversationId && cache.byConversation?.[conversationId]) {
    delete cache.byConversation[conversationId];
  }

  writeCache(cache);
}

export function getCachedParticipantMeta(conversationId) {
  if (!conversationId) return null;
  const cache = readCache();
  return cache.byConversation?.[conversationId] || null;
}

