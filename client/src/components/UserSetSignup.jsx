import React, { useState } from 'react';
import { useFestival } from '../festival-context.jsx';
import { api } from '../api.js';
import { notifyUserSetsChanged } from '../user-sets.js';
import Button from './Button.jsx';

/*
 * "Add your cocktail" — the sign-up half of a userSets event (see
 * shared/festivals/lucky-13.js). What a guest enters becomes a set everyone
 * can vote on. Lists the guest's own entries so they can take one back.
 */
const ERRORS = {
  duplicate: 'Someone already entered one by that name.',
  too_many: 'That’s the limit — three each.',
  invalid_name: 'Give it a name first.',
  festival_ended: 'Voting has closed.',
};

export default function UserSetSignup({ groupId, memberKey, memberDisplayName }) {
  const festival = useFestival();
  const noun = festival.entryNoun ?? 'entry';
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // Matched by name: the server decides ownership by member key when one is
  // removed, so a stale match here can only show a button that gets refused.
  const mine = festival.SCHEDULE.filter((s) => s.submittedBy && s.submittedBy === memberDisplayName);
  const total = festival.SCHEDULE.length;

  async function add(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const { set } = await api.addUserSet(groupId, memberKey, name);
      setName('');
      setMessage({ ok: true, text: `“${set.artist}” is in. Everyone can vote on it now.` });
      notifyUserSetsChanged();
    } catch (err) {
      setMessage({ ok: false, text: ERRORS[err.data?.error] ?? 'Couldn’t add that — try again.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(set) {
    if (!confirm(`Take “${set.artist}” off the menu? Any votes for it are lost.`)) return;
    try {
      await api.removeUserSet(groupId, memberKey, set.id.split('-user-')[1]);
      notifyUserSetsChanged();
    } catch {
      setMessage({ ok: false, text: 'Couldn’t remove that one.' });
    }
  }

  return (
    <div className="card stack user-set-signup">
      <div className="card-title">Bringing a {noun}?</div>
      <p className="user-set-hint">
        Add it and everyone can vote on it.{' '}
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
      {message && (
        <p className={`user-set-message ${message.ok ? 'is-ok' : 'is-error'}`} role="status">{message.text}</p>
      )}
      {mine.length > 0 && (
        <ul className="user-set-mine">
          {mine.map((s) => (
            <li key={s.id}>
              <span>{s.artist}</span>
              <Button variant="ghost" size="small" onClick={() => remove(s)}>Remove</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
