import { isOnline, reportNetworkFailure, reportNetworkSuccess } from './net-status.js';
import { isCacheableUrl, getCachedJson, putResponse } from './offline-cache.js';

function offlineError() {
  const e = new Error('offline');
  e.offline = true;
  return e;
}

async function req(method, url, body) {
  // Only the read-only group/votes endpoints are cacheable — a write always
  // fails fast offline, exactly as before, since there's nothing to fall
  // back to and voting/joining while offline is out of scope.
  const cacheable = method === 'GET' && isCacheableUrl(url);

  if (!isOnline()) {
    if (cacheable) {
      const cached = await getCachedJson(url);
      if (cached) return cached;
    }
    throw offlineError();
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    reportNetworkFailure();
    if (cacheable) {
      const cached = await getCachedJson(url);
      if (cached) return cached;
    }
    throw offlineError();
  }
  reportNetworkSuccess();

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.error || `HTTP ${res.status}`);
    e.status = res.status;
    e.data = err;
    throw e;
  }
  // Write-through: every successful read refreshes the offline cache, which
  // is what makes "invalidate and update to the latest version on load"
  // free — the next online GET simply overwrites the previous entry.
  if (cacheable) await putResponse(url, res.clone());
  return res.json();
}

// Member keys are lowercased display names and may contain spaces.
// Always encode them when embedding in URL path segments.
const encKey = (k) => encodeURIComponent(k);

export const api = {
  schedule: () => req('GET', '/api/schedule'),
  createGroup: (groupName, festivalSlug) =>
    req('POST', '/api/groups', { groupName, festivalSlug }),
  getGroup: (id) => req('GET', `/api/groups/${id}`),
  join: (id, displayName) => req('POST', `/api/groups/${id}/join`, { displayName }),
  myVotes: (id, memberKey) => req('GET', `/api/groups/${id}/votes/${encKey(memberKey)}`),
  setVote: (id, memberKey, artistId, score) =>
    req('POST', `/api/groups/${id}/votes/${encKey(memberKey)}`, { artistId, score }),
  allVotes: (id) => req('GET', `/api/groups/${id}/votes`),
  updateGroup: (id, name) => req('PATCH', `/api/groups/${id}`, { name }),
  updateMember: (id, memberKey, displayName) =>
    req('PATCH', `/api/groups/${id}/members/${encKey(memberKey)}`, { displayName }),
  removeMember: (id, memberKey) =>
    req('DELETE', `/api/groups/${id}/members/${encKey(memberKey)}`),
};
