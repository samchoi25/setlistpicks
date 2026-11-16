import React from 'react';

/*
 * The app's button. A thin wrapper over the .btn classes in styles.css, so the
 * variants live in one place and a typo'd variant fails loudly in dev instead
 * of rendering an unstyled primary button.
 *
 *   <Button onClick={save}>Save</Button>
 *   <Button variant="ghost" size="small">Cancel</Button>
 *
 * variant: primary (default) | secondary | ghost | danger | leave
 *   leave — outlined danger that fills on hover; for leaving a group.
 * size:    default | small
 */
const VARIANTS = new Set(['primary', 'secondary', 'ghost', 'danger', 'leave']);

export default function Button({ variant = 'primary', size, className = '', type = 'button', ...rest }) {
  if (import.meta.env?.DEV && !VARIANTS.has(variant)) {
    console.warn(`<Button>: unknown variant "${variant}"`);
  }
  const classes = [
    'btn',
    variant !== 'primary' && variant,
    size === 'small' && 'small',
    className,
  ].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...rest} />;
}
