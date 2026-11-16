import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';
import { toast } from '../toast.js';
import { groupUrlPath } from '../../../shared/routes.js';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

// No React router and no navigate() reachable from here — App.jsx owns
// `path` as local state and only updates it via a real popstate event or
// its own pushState call. A synthetic popstate dispatch is the one way to
// hand it a new URL from outside the tree without a full page reload.
function navigateTo(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function CreateGroupModal({ festivalSlug, onClose }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const group = await api.createGroup(trimmed, festivalSlug);
      navigateTo(groupUrlPath(festivalSlug, group.id));
    } catch (e) {
      setSubmitting(false);
      toast(
        e.offline ? "You're offline — creating a group needs a connection."
        : e.status === 429 ? 'Too many groups created from this network. Try again later.'
        : e.data?.error === 'festival_ended' ? 'This festival has ended, so new groups can’t be created anymore.'
        : `Couldn’t create group: ${e.message}`
      );
    }
  }

  return (
    <Modal onClose={onClose} label="Start a new crew" className="modal-card" backdropClassName="is-frosted">
      <div className="modal-title">Start a new crew</div>
      <p className="modal-lede">
        Set up a second group for this festival, separate from your other crews.
      </p>
      <input
        ref={inputRef}
        type="text"
        placeholder="Crew name"
        maxLength={100}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <div className="modal-actions">
        <Button disabled={!name.trim() || submitting} onClick={submit}>
          {submitting ? 'Creating…' : 'Create group'}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
      </div>
    </Modal>
  );
}
