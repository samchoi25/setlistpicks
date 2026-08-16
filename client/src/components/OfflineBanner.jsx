import React from 'react';
import { useOnline } from '../net-status.js';

// Non-dismissible — reappears automatically if connectivity drops again,
// since there's nothing for the user to do about being offline other than
// reconnect.
export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="offline-banner">
      Offline — showing your last saved picks. Voting is paused until you're back online.
    </div>
  );
}
