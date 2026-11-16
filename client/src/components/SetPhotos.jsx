import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFestival } from '../festival-context.jsx';
import { toast } from '../toast.js';

/*
 * Photos of one set, for a festival with photos: true (Lucky 13's cocktails —
 * see shared/festivals/lucky-13.js). Rendered inside the long-press popup:
 * CameraButton sits beside the name, PhotoGrid below.
 *
 * A picture is shrunk in the browser before it's sent (longest side 1600px,
 * JPEG), which turns a 4–8 MB phone photo into a few hundred KB and drops its
 * EXIF data — location included — on the way.
 */

const MAX_SIDE = 1600;

async function shrink(file) {
  try {
    // Modern browsers apply the photo's EXIF rotation here by default.
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (blob) return blob;
  } catch { /* fall through to the original */ }
  return file;
}

const ERRORS = {
  too_large: 'That photo is too big.',
  not_an_image: 'That doesn’t look like a photo.',
  too_many_photos: 'You’ve hit the photo limit.',
  festival_ended: 'The party’s over — no more photos.',
};

// A set's photos, this guest's own first. `viewer` lets the server mark which
// one is theirs (it never sends anyone's member key back).
export function usePhotos(setId, { groupId, memberKey } = {}) {
  const festival = useFestival();
  const [photos, setPhotos] = useState([]);
  const load = async () => {
    if (!festival.photos) return; // nothing to fetch for any other festival
    try {
      const qs = new URLSearchParams({ groupId: groupId ?? '', memberKey: memberKey ?? '' });
      const res = await fetch(`/api/festivals/${encodeURIComponent(festival.slug)}/sets/${encodeURIComponent(setId)}/photos?${qs}`);
      if (!res.ok) return;
      const list = (await res.json()).photos;
      setPhotos([...list.filter((p) => p.mine), ...list.filter((p) => !p.mine)]);
    } catch { /* offline — keep what we have */ }
  };
  useEffect(() => { load(); }, [festival.slug, setId, groupId, memberKey]); // eslint-disable-line
  return { photos, reload: load };
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

// Send one (already shrunk) image to a set. Resolves true on success; shows
// its own toast on failure.
async function uploadPhoto({ groupId, setId, memberKey }, body) {
  try {
    const res = await fetch(
      `/api/groups/${encodeURIComponent(groupId)}/sets/${encodeURIComponent(setId)}/photos?memberKey=${encodeURIComponent(memberKey)}`,
      { method: 'POST', headers: { 'content-type': body.type || 'application/octet-stream' }, body },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast(ERRORS[err.error] ?? 'Couldn’t upload that photo — try again.');
      return false;
    }
    return true;
  } catch {
    toast("You're offline — photos can't be uploaded right now.");
    return false;
  }
}

// Whether this browser can show a live camera at all (it also needs a secure
// page — https, or localhost in development).
export const canUseLiveCamera = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && window.isSecureContext;

/*
 * The fallback when there's no live camera: a hidden file input. On a phone,
 * `capture` still opens the camera app; elsewhere it's a photo picker.
 * Returns the element to render and a function that opens it.
 */
function usePhotoPicker(target, onUploaded) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  async function onChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // so the same photo can be picked again
    if (!file) return;
    setBusy(true);
    const ok = await uploadPhoto(target, await shrink(file));
    setBusy(false);
    if (ok) onUploaded?.();
  }
  const input = (
    <input ref={inputRef} type="file" accept="image/*" capture="environment"
      className="photo-input" onChange={onChange} />
  );
  return { input, busy, pick: () => inputRef.current?.click() };
}

// The camera icon beside the name. Opens the live viewfinder (onOpenCamera)
// where the browser can show one, otherwise the photo picker.
// One photo per guest per set, so once they have one this retakes it.
export function CameraButton({ setId, groupId, memberKey, onUploaded, onOpenCamera, hasPhoto = false }) {
  const picker = usePhotoPicker({ setId, groupId, memberKey }, onUploaded);
  const label = hasPhoto ? 'Retake your photo' : 'Take a photo';
  return (
    <>
      <button type="button" className={`photo-camera-btn${picker.busy ? ' is-busy' : ''}`}
        onClick={() => (canUseLiveCamera() && onOpenCamera ? onOpenCamera() : picker.pick())}
        disabled={picker.busy} aria-label={label} title={label}>
        <CameraIcon />
      </button>
      {picker.input}
    </>
  );
}

/*
 * Live viewfinder, shown in the popup in place of the photos. Asks for the
 * camera (the browser prompts the first time), shows the feed, and on Snap
 * grabs the current frame — shrunk the same way as a picked photo — and
 * uploads it. The camera is released the moment this closes.
 */
export function CameraView({ setId, groupId, memberKey, onDone, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facing, setFacing] = useState('environment');
  const [status, setStatus] = useState('starting'); // starting | live | error | sending
  const [canFlip, setCanFlip] = useState(false);
  const picker = usePhotoPicker({ setId, groupId, memberKey }, onDone);

  useEffect(() => {
    let cancelled = false;
    setStatus('starting');
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play().catch(() => {});
        setStatus('live');
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        if (!cancelled) setCanFlip(devices.filter((d) => d.kind === 'videoinput').length > 1);
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  async function snap() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    setStatus('sending');
    const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (blob && await uploadPhoto({ setId, groupId, memberKey }, blob)) onDone?.();
    else setStatus('live');
  }

  if (status === 'error') {
    return (
      <div className="camera-view">
        <p className="picks-empty">Couldn’t open the camera — check that this site is allowed to use it.</p>
        <div className="camera-actions">
          <button type="button" className="btn small" onClick={picker.pick} disabled={picker.busy}>Choose a photo</button>
          <button type="button" className="link-button" onClick={onCancel}>Cancel</button>
        </div>
        {picker.input}
      </div>
    );
  }

  return (
    <div className="camera-view">
      <div className="camera-frame">
        {/* muted + playsInline: what iOS needs to play a live feed inline. */}
        <video ref={videoRef} className={facing === 'user' ? 'is-mirrored' : ''} muted playsInline autoPlay />
        {status === 'starting' && <span className="camera-status">Starting camera…</span>}
      </div>
      <div className="camera-actions">
        <button type="button" className="btn small" onClick={snap} disabled={status !== 'live'}>
          {status === 'sending' ? 'Saving…' : 'Snap'}
        </button>
        {canFlip && (
          <button type="button" className="btn small ghost"
            onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
            disabled={status !== 'live'}>Flip</button>
        )}
        <button type="button" className="link-button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// Take back your own photo of a set. Resolves true on success.
export async function deleteMyPhoto({ groupId, setId, memberKey }) {
  try {
    const res = await fetch(
      `/api/groups/${encodeURIComponent(groupId)}/sets/${encodeURIComponent(setId)}/photos?memberKey=${encodeURIComponent(memberKey)}`,
      { method: 'DELETE' },
    );
    if (res.ok) return true;
  } catch { /* offline */ }
  toast('Couldn’t delete that photo — try again.');
  return false;
}

/*
 * A photo filling the screen, over the popup it was opened from. Tap
 * anywhere or press Escape to close. Its Escape is caught before the popup's
 * own handler sees it, so closing the photo leaves the popup open.
 */
function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const label = photo.mine ? 'Your photo' : `Photo by ${photo.uploadedBy}`;
  return createPortal(
    <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <figure className="photo-lightbox-figure">
        <img src={photo.url} alt={label} />
        <figcaption>{photo.mine ? 'you' : photo.uploadedBy}</figcaption>
      </figure>
      <button type="button" className="photo-lightbox-close" aria-label="Close" onClick={onClose}>×</button>
    </div>,
    document.body,
  );
}

const hasHover = () => typeof matchMedia !== 'undefined' && matchMedia('(hover: hover)').matches;

/*
 * Everyone's photos of a set. Tapping one opens it full size (PhotoLightbox).
 * Your own shows Delete and Retake over it on hover, where clicking it opens
 * it too; on a phone, with no hover, a tap shows those options instead (and a
 * second tap hides them).
 */
export function PhotoGrid({ photos, onDelete, onRetake }) {
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(null);
  if (!photos.length) return null;
  const tapMine = (p) => (hasHover() ? setExpanded(p) : setRevealed((v) => !v));
  return (
    <div className="photo-grid">
      {photos.map((p) => (p.mine ? (
        <figure key={p.id} className={`photo-item is-mine${revealed ? ' is-revealed' : ''}`}>
          <div className="photo-thumb" role="button" tabIndex={0} aria-label="Your photo — delete or retake"
            onClick={() => tapMine(p)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(p); } }}>
            <img src={p.url} alt="Your photo" loading="lazy" />
            <div className="photo-actions">
              <button type="button" onClick={(e) => { e.stopPropagation(); setRevealed(false); onRetake?.(); }}>Retake</button>
              <button type="button" className="is-danger" onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete your photo?')) onDelete?.(p);
              }}>Delete</button>
            </div>
          </div>
          <figcaption className="photo-by">you</figcaption>
        </figure>
      ) : (
        <figure key={p.id} className="photo-item">
          <button type="button" className="photo-thumb" title={`Photo by ${p.uploadedBy}`}
            onClick={() => setExpanded(p)}>
            <img src={p.url} alt={`Photo by ${p.uploadedBy}`} loading="lazy" />
          </button>
          <figcaption className="photo-by">{p.uploadedBy}</figcaption>
        </figure>
      )))}
      {expanded && <PhotoLightbox photo={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
