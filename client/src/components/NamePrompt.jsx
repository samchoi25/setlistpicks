import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';
import { setIdentity } from '../storage.js';
import { useFestival } from '../festival-context.jsx';
import { toast } from '../toast.js';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

const normalize = (s) => String(s || '').trim().toLowerCase();

export default function NamePrompt({ groupId, member, memberDisplayName, groupName, mutedMembers = [], onDismiss }) {
  const festival = useFestival();
  const autoName = memberDisplayName;
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const trimmed = name.trim();
  // Match on normalized display name, not key — keys are now opaque nanoids
  const existingMatch = trimmed ? mutedMembers.find(m => normalize(m.displayName) === normalize(trimmed)) : null;
  const isSelf = existingMatch?.key === member.key;
  const isRecovery = existingMatch && !isSelf;

  async function dismiss(chosenName) {
    const t = chosenName?.trim();
    if (!t || t === autoName) { onDismiss(null); return; }

    if (mutedMembers.find(m => normalize(m.displayName) === normalize(t) && m.key !== member.key)) {
      // Recover existing session. The member.key is about to change so we can't
      // just update a display label — we need a clean re-mount with the correct key.
      // Reload the page: localStorage is already set to the recovered identity,
      // so App.jsx will read it and mount GroupView as the real user.
      try {
        const { member: recovered } = await api.join(groupId, t);
        setIdentity(groupId, recovered);
        // Remove the auto-generated placeholder before reloading
        await api.removeMember(groupId, member.key).catch(() => {});
        location.reload();
      } catch (e) {
        if (e.offline) toast("You're offline — can't recover that account right now.");
        onDismiss(autoName);
      }
    } else {
      // New name — just rename the auto-generated placeholder user
      try {
        await api.updateMember(groupId, member.key, t);
        setIdentity(groupId, { ...member, displayName: t });
        onDismiss(t);
      } catch (e) {
        if (e.offline) toast("You're offline — using your default name for now.");
        onDismiss(autoName);
      }
    }
  }

  function submit() { dismiss(name.trim() || autoName); }

  return (
    <Modal onClose={() => dismiss(null)} label={`Plan ${festival.shortName}`} className="modal-card" backdropClassName="is-frosted">
      <div className="modal-title">{festival.secretVotes ? festival.name : `Plan ${festival.shortName}`}</div>
      {festival.secretVotes ? (
        // A secret party vote (see shared/festivals/lucky-13.js): nobody sees
        // the group's picks, so don't promise that.
        <ul className="modal-list">
          <li>Rate every {festival.entryNoun ?? 'entry'} 👍 or 🔥</li>
          <li>Bringing one? Add it to the list</li>
          <li>Votes are secret — only the hosts see the count</li>
        </ul>
      ) : (
        <ul className="modal-list">
          <li>Save the shows you want to see</li>
          <li>Share a link with your crew</li>
          <li>See what the group decides on</li>
        </ul>
      )}

      {/* Show existing members when joining an existing group so they know
          to type their name to recover their session */}
      {groupName && (() => {
        const others = mutedMembers.filter(m => m.key !== member.key);
        if (!others.length) return null;
        return (
          <div className="name-prompt-members">
            <span className="name-prompt-members-label">Already in this group:</span>{' '}
            {others.map((m, i) => (
              <span key={m.key}>
                {i > 0 && <span className="sep">, </span>}
                <button className="link-button dotted" onClick={() => setName(m.displayName)}>
                  {m.displayName}
                </button>
              </span>
            ))}
            <div className="name-prompt-members-hint">Tap a name to rejoin as them.</div>
          </div>
        );
      })()}

      <div className={`modal-subtitle${groupName ? ' is-spaced' : ''}`}>
        What&rsquo;s your name?
      </div>
      <p className="modal-lede">
        {festival.secretVotes
          ? 'Type the same name on another phone to pick up where you left off.'
          : 'Your group will see this next to your picks.'}
      </p>
      <input
        ref={inputRef}
        type="text"
        placeholder="Name"
        maxLength={64}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />

      {/* Per-keystroke collision hint */}
      {isRecovery && (
        <div className="callout">
          <strong>{existingMatch.displayName}</strong> is already in this group
          &mdash; you&rsquo;ll recover their picks on this device.
        </div>
      )}
      {isSelf && trimmed && (
        <div className="name-prompt-note">That&rsquo;s your current name.</div>
      )}

      <Button onClick={submit}>
        {isRecovery ? `Rejoin as ${existingMatch.displayName}` : "Let\u2019s go"}
      </Button>
      <div className="name-prompt-skip">
        <button className="link-button" onClick={() => dismiss(null)}>Skip</button>
        {' \u2014 use a random name'}
      </div>
    </Modal>
  );
}
