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

export default function UserSetSignup({ groupId, memberKey, memberDisplayName }) {
  const festival = useFestival();
  const noun = festival.entryNoun ?? 'entry';
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

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
        </>
      )}
      {mine.map((s) => <p key={s.id} className="user-set-name">{s.artist}</p>)}
    </div>
  );
}
