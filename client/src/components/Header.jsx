import React, { useState } from 'react';
import { api } from '../api.js';
import { setIdentity, clearIdentity, setActiveGroup, renameGroupInHistory, removeGroupFromHistory } from '../storage.js';
import { toast } from '../toast.js';
import { useOnline } from '../net-status.js';
import { useFestival } from '../festival-context.jsx';
import { hasFestivalEnded } from '../../../shared/festival.js';
import FestivalSwitcher from './FestivalSwitcher.jsx';
import GroupSwitcher from './GroupSwitcher.jsx';
import Button from './Button.jsx';

function initials(name) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function ChevronIcon() {
  return (
    <svg className="profile-chevron" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M2 4l4 4 4-4z" />
    </svg>
  );
}

// Square-with-arrow "share" glyph.
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export default function Header({
  groupId, member, groupName, setGroupName,
  memberDisplayName, setMemberDisplayName,
  mutedMembers, setMutedMembers, memberVoteCounts = {}, onLeave, onEditingChange,
  // When given, a share icon sits beside the profile badge and calls this —
  // GroupView uses it to open the invite box in a dialog (a party event, see
  // shared/festivals/lucky-13.js) instead of showing it inline.
  onShare,
}) {
  const festival = useFestival();
  const [editing, setEditing] = useState(false);
  // Editing means renaming/removing members or the group itself — all
  // network writes, so the whole panel (including "Leave Group", which
  // lives inside it) is unreachable while offline rather than partially
  // disabled. Once the festival has ended it's unreachable outright — there's
  // no group left to manage, only its final picks to look back on.
  const online = useOnline();
  const ended = hasFestivalEnded(festival);
  // At a party (userSets event, see shared/festivals/lucky-13.js) the profile
  // badge is just a name tag: it doesn't open the edit panel.
  const badgeLocked = editing || !online || ended || Boolean(festival.userSets);

  function applyEditing(val) {
    setEditing(val);
    onEditingChange?.(val);
  }
  const [groupInput, setGroupInput]     = useState(groupName);
  const [nameInput, setNameInput]       = useState(memberDisplayName);
  const [removingKey, setRemovingKey]   = useState(null);
  const [renamingKey, setRenamingKey]   = useState(null);
  const [renameInput, setRenameInput]   = useState('');

  function openEdit() {
    setGroupInput(groupName);
    setNameInput(memberDisplayName);
    setRemovingKey(null);
    setRenamingKey(null);
    applyEditing(true);
  }

  function closeEdit() {
    setRemovingKey(null);
    setRenamingKey(null);
    applyEditing(false);
  }

  async function save() {
    const newGroup = groupInput.trim() || groupName;
    const newName  = nameInput.trim()  || memberDisplayName;
    const prevGroup = groupName;
    const prevName  = memberDisplayName;

    // If the typed name collides with an existing member, recover their session.
    const collision = mutedMembers.find(
      (m) => m.displayName.trim().toLowerCase() === newName.trim().toLowerCase() && m.key !== member.key
    );
    if (collision) {
      try {
        const { member: recovered } = await api.join(groupId, newName);
        setIdentity(groupId, recovered);
        setActiveGroup(groupId);
        await api.removeMember(groupId, member.key).catch(() => {});
        location.reload();
      } catch (e) {
        toast(e.offline ? "You're offline \u2014 can't recover that account right now." : `Couldn\u2019t recover account: ${e.message}`);
      }
      return;
    }

    setGroupName(newGroup);
    setMemberDisplayName(newName);
    setIdentity(groupId, { ...member, displayName: newName });
    applyEditing(false);
    setRemovingKey(null);

    try {
      await Promise.all([
        newGroup !== prevGroup ? api.updateGroup(groupId, newGroup) : Promise.resolve(),
        newName  !== prevName  ? api.updateMember(groupId, member.key, newName) : Promise.resolve(),
      ]);
      if (newGroup !== prevGroup) renameGroupInHistory(festival.slug, groupId, newGroup);
    } catch (e) {
      setGroupName(prevGroup);
      setMemberDisplayName(prevName);
      setIdentity(groupId, { ...member, displayName: prevName });
      toast(e.offline ? "You're offline \u2014 can't save changes right now." : `Couldn\u2019t save: ${e.message}`);
    }
  }

  async function doRemoveMember(memberKey) {
    try {
      await api.removeMember(groupId, memberKey);
      setMutedMembers((prev) => prev.filter((m) => m.key !== memberKey));
    } catch (e) {
      toast(e.offline ? "You're offline \u2014 can't remove members right now." : `Couldn\u2019t remove: ${e.message}`);
    }
    setRemovingKey(null);
  }

  async function doRenameMember(memberKey, newName) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      await api.updateMember(groupId, memberKey, trimmed);
      setMutedMembers((prev) => prev.map((m) => m.key === memberKey ? { ...m, displayName: trimmed } : m));
      if (memberKey === member.key) {
        setMemberDisplayName(trimmed);
        setNameInput(trimmed);
        setIdentity(groupId, { ...member, displayName: trimmed });
      }
    } catch (e) {
      toast(e.offline ? "You're offline \u2014 can't rename members right now." : `Couldn\u2019t rename: ${e.message}`);
    }
    setRenamingKey(null);
  }

  async function doLeave() {
    try { await api.removeMember(groupId, member.key); } catch {}
    clearIdentity(groupId);
    removeGroupFromHistory(festival.slug, groupId);
    onLeave();
  }

  function MemberRow({ m }) {
    const isYou = m.key === member.key;
    const voteCount = memberVoteCounts[m.key] || 0;
    const inactive = voteCount === 0;

    const avatar = (
      <span className={`chip-avatar${isYou ? ' is-you' : ''}${inactive && !isYou ? ' is-inactive' : ''}`}>
        {initials(m.displayName)}
      </span>
    );

    const picksBadge = voteCount > 0 ? (
      <span className="member-row-picks">
        {voteCount} pick{voteCount !== 1 ? 's' : ''}
      </span>
    ) : (
      <span className="member-row-picks is-empty">
        no picks yet
      </span>
    );

    const nameEl = (
      <span className={`member-row-name${inactive && !isYou ? ' is-inactive' : ''}`}>
        {m.displayName}{isYou && <span className="chip-you"> (you)</span>}
      </span>
    );

    // ── Rename mode ───────────────────────────────────────────────────────────
    if (renamingKey === m.key) {
      return (
        <div className="member-row">
          {avatar}
          <input
            type="text"
            className="is-tight"
            value={renameInput}
            maxLength={64}
            autoFocus
            onChange={(e) => setRenameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doRenameMember(m.key, renameInput);
              if (e.key === 'Escape') setRenamingKey(null);
            }}
          />
          <Button size="small" onClick={() => doRenameMember(m.key, renameInput)}>Save</Button>
          <button className="link-button dim" onClick={() => setRenamingKey(null)}>cancel</button>
        </div>
      );
    }

    // ── Remove confirmation ───────────────────────────────────────────────────
    if (removingKey === m.key) {
      if (isYou) {
        return (
          <div className="callout danger">
            <div className="member-row">{avatar}{nameEl}</div>
            <div className="callout-title">
              ⚠️ Caution&mdash;you&rsquo;re removing yourself!
            </div>
            <p className="callout-body">
              You&rsquo;ll leave the group and your picks will be removed. If you&rsquo;re the last one here, the group itself goes with them.
            </p>
            <div className="member-row-actions">
              <Button variant="danger" size="small" onClick={() => doLeave()}>Leave group</Button>
              <button className="link-button dim" onClick={() => setRemovingKey(null)}>Never mind</button>
            </div>
          </div>
        );
      }
      return (
        <div className="member-row">
          {avatar}{nameEl}
          <Button variant="danger" size="small" onClick={() => doRemoveMember(m.key)}>Remove</Button>
          <button className="link-button dim" onClick={() => setRemovingKey(null)}>cancel</button>
        </div>
      );
    }

    // ── Default row ───────────────────────────────────────────────────────────
    return (
      <div className="member-row">
        {avatar}{nameEl}
        {picksBadge}
        <button className="link-button soft" onClick={() => { setRenamingKey(m.key); setRenameInput(m.displayName); setRemovingKey(null); }}>rename</button>
        <button className="link-button soft" onClick={() => { setRemovingKey(m.key); setRenamingKey(null); }}>remove</button>
      </div>
    );
  }

  const memberCount = mutedMembers.length;

  // Live-preview values: when editing, reflect what's typed; otherwise show saved state
  const displayGroupName = editing ? (groupInput || groupName) : groupName;
  const displayMemberName = editing ? (nameInput || memberDisplayName) : memberDisplayName;

  const brandRow = (
    <div className="brand">
      <FestivalSwitcher />
      <div className="brand-info">
        {/* Member count rides beside the name; editing is reached from the
            profile badge, so there's no separate "edit" link here. */}
        <GroupSwitcher groupId={groupId} groupName={displayGroupName} memberCount={memberCount} disabled={editing} />
      </div>{/* .brand-info */}
      {onShare && !editing && (
        <button className="share-icon-btn" onClick={onShare} aria-label="Invite guests" title="Invite guests">
          <ShareIcon />
        </button>
      )}
      <button className={`profile-badge${badgeLocked ? ' is-static' : ''}`}
        onClick={badgeLocked ? undefined : openEdit}
        disabled={Boolean(festival.userSets)}
        title={badgeLocked ? undefined : 'Edit your name & crew'}>
        <span className="profile-avatar">{initials(displayMemberName)}</span>
        <span className="profile-name">{displayMemberName}</span>
        {!badgeLocked && <ChevronIcon />}
      </button>
    </div>
  );

  if (editing) {
    const membersSection = mutedMembers.length > 0 && (
      <div className="edit-section">
        <label className="field-label">Members</label>
        {mutedMembers.map((m) => <MemberRow key={m.key} m={m} />)}
      </div>
    );

    return (
      <div className="edit-panel">
        {brandRow}
        <div className="edit-fields">
          <label className="field-label">Group name</label>
          <input type="text" className="is-compact" value={groupInput} maxLength={64}
            placeholder="Crew name"
            onChange={(e) => setGroupInput(e.target.value)} />
          <label className="field-label">Your name</label>
          <input type="text" className="is-compact" value={nameInput} maxLength={64}
            placeholder="Your name"
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()} />
          {(() => {
            const editMatch = mutedMembers.find(m =>
              m.displayName.trim().toLowerCase() === nameInput.trim().toLowerCase() && m.key !== member.key
            );
            return editMatch ? (
              <div className="callout">
                <strong>{editMatch.displayName}</strong> is already in this group &mdash; saving
                will recover their picks on this device and drop your current ones.
              </div>
            ) : null;
          })()}
          {membersSection}
          <div className="edit-actions">
            <Button onClick={save}>{
              mutedMembers.find(m => m.displayName.trim().toLowerCase() === nameInput.trim().toLowerCase() && m.key !== member.key)
                ? 'Recover Account' : 'Save'
            }</Button>
            <Button variant="ghost" onClick={closeEdit}>Cancel</Button>
            {removingKey !== member.key && (
              <Button variant="leave" onClick={() => setRemovingKey(member.key)}>
                Leave Group
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return brandRow;
}
