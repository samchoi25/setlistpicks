import React, { useState, useRef } from 'react';
import { groupPath } from '../../../shared/routes.js';
import { useFestival } from '../festival-context.jsx';
import Button from './Button.jsx';

// `inModal` drops the card frame and uses the dialog's title style, for when
// GroupView shows this inside a Modal opened from the header's share icon.
export default function ShareCard({ groupId, memberKey, mutedMembers, memberVoteCounts = {}, onMemberClick, inModal = false }) {
  // Share the canonical festival path. A bare code still resolves — the server
  // 301s it — but handing people a URL that immediately redirects is worse
  // than handing them the real one.
  const { slug, userSets } = useFestival();
  const path = groupPath(slug, groupId);
  const url = `${location.origin}${path}`;
  const displayUrl = `${location.host}${path}`;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  async function copy() {
    try { await navigator.clipboard.writeText(url); } catch { /* fallback: still show feedback */ }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={inModal ? 'stack share-card is-modal' : 'card stack share-card'}>
      <div className={inModal ? 'modal-title' : 'card-title'}>{userSets ? 'Invite guests' : 'Invite your crew'}</div>
      <div className="share-row">
        <div className="share-url" onClick={copy}>{displayUrl}</div>
        <Button variant="secondary" className={copied ? 'is-confirmed' : ''} onClick={copy}>
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
      {mutedMembers.length > 0 && (
        <div className="share-members">
          {mutedMembers.filter((m) => memberVoteCounts[m.key] > 0 || m.key === memberKey).map((m) => (
            <span key={m.key} className="share-member">
              <button className="link-button" onClick={() => onMemberClick?.(m)}>
                {m.displayName}
              </button>
              {memberVoteCounts[m.key] > 0 && (
                <span className="count-bubble">{memberVoteCounts[m.key]}</span>
              )}
              {m.key === memberKey && <span className="share-member-you">(you)</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
