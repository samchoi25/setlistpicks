import React, { useState } from 'react';
import { useFestival } from '../festival-context.jsx';
import { api } from '../api.js';
import { notifyUserSetsChanged } from '../user-sets.js';
import Button from './Button.jsx';

/*
 * "Add your cocktail" — the sign-up half of a userSets event (see
 * shared/festivals/lucky-13.js). What a guest enters becomes a set everyone
 * can vote on. One each: once a guest has entered theirs, the form gives
 * way to just its name. The server enforces the same limit.
 */
const ERRORS = {
  duplicate: 'Someone already entered one by that name.',
  too_many: 'You’ve already added one.',
  invalid_name: 'Give it a name first.',
  festival_ended: 'Voting has closed.',
};

/*
 * "I'm not bringing one" folds the card to a single line. Remembered per
 * group in this browser so it stays folded across reloads; purely a display
 * preference, so a private window that can't store it just starts unfolded.
 */
const notBringingKey = (groupId, memberKey) => `brsp.notBringing.v1.${groupId}.${memberKey}`;

function readNotBringing(key) {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}

function writeNotBringing(key, value) {
  try {
    if (value) localStorage.setItem(key, '1');
    else localStorage.removeItem(key);
  } catch { /* not remembered — fine */ }
}

export default function UserSetSignup({ groupId, memberKey, memberDisplayName }) {
  const festival = useFestival();
  const noun = festival.entryNoun ?? 'entry';
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const storageKey = notBringingKey(groupId, memberKey);
  const [notBringing, setNotBringingState] = useState(() => readNotBringing(storageKey));
  const setNotBringing = (value) => {
    setNotBringingState(value);
    writeNotBringing(storageKey, value);
  };

  // Matched by name, which is only for display — the one-each limit itself is
  // enforced by member key on the server.
  const mine = festival.SCHEDULE.filter((s) => s.submittedBy && s.submittedBy === memberDisplayName);
  const total = festival.SCHEDULE.length;

  async function add(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await api.addUserSet(groupId, memberKey, name);
      setName('');
      notifyUserSetsChanged();
    } catch (err) {
      setMessage(ERRORS[err.data?.error] ?? 'Couldn’t add that — try again.');
    } finally {
      setBusy(false);
    }
  }

  // Folded: one line, with a way back.
  if (notBringing && mine.length === 0) {
    return (
      <div className="card user-set-signup is-collapsed">
        <span className="card-title">Bringing a {noun}?</span>
        <span className="user-set-collapsed-answer">I’m not.</span>
        <button type="button" className="link-button" onClick={() => setNotBringing(false)}>
          Actually, I am
        </button>
      </div>
    );
  }

  return (
    <div className="card stack user-set-signup">
      <div className="card-title">{mine.length ? `Your ${noun}` : `Bringing a ${noun}?`}</div>
      {mine.length === 0 && (
        <>
          <p className="user-set-hint">
            Add yours and everyone can vote on it — one each.{' '}
            Votes are secret — only the hosts see the count.
            {total === 0 && ` No ${noun}s yet — be the first.`}
          </p>
          <form className="user-set-form" onSubmit={add}>
            <input
              type="text"
              value={name}
              maxLength={60}
              placeholder={`Name your ${noun}`}
              aria-label={`${noun} name`}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" disabled={busy || !name.trim()}>Add</Button>
          </form>
          {message && <p className="user-set-message" role="status">{message}</p>}
          <button type="button" className="link-button user-set-decline" onClick={() => setNotBringing(true)}>
            I’m not bringing a {noun}
          </button>
        </>
      )}
      {mine.map((s) => <p key={s.id} className="user-set-name">{s.artist}</p>)}
    </div>
  );
}
