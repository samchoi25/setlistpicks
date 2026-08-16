import { isOnline, reportNetworkFailure, reportNetworkSuccess } from './net-status.js';

function offlineError() {
  const e = new Error('offline');
  e.offline = true;
  return e;
}

async function req(method, url, body) {
  if (!isOnline()) throw offlineError();

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    reportNetworkFailure();
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
  removeMember: (id, memberKey, { keepVotes = false } = {}) =>
    req('DELETE', `/api/groups/${id}/members/${encKey(memberKey)}?keepVotes=${keepVotes}`),
};
