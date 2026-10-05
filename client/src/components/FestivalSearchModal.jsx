import React, { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { suggestFestivals } from '../../../shared/festival-search.js';

/*
 * Query state plus local suggestions, for any festival-lookup UI. No network:
 * suggestFestivals() searches the bundled registry in memory.
 */
export function useFestivalSuggestions(initialQuery = '', options) {
  const [query, setQuery] = useState(initialQuery);
  const { limit, includeEnded } = options ?? {};
  const results = useMemo(
    () => suggestFestivals(query, { limit, includeEnded }),
    [query, limit, includeEnded],
  );
  return { query, setQuery, results };
}

/*
 * Festival lookup modal — a container only. The UI is passed in as a render
 * function and gets the search state to wire up however it likes:
 *
 *   <FestivalSearchModal open={open} onClose={close}>
 *     {({ query, setQuery, results, close }) => (
 *       …input bound to query/setQuery, list of results…
 *     )}
 *   </FestivalSearchModal>
 *
 * Each result is a full festival object (slug, shortName, name, dateRange,
 * venue, …); festivalPath(result.slug) from shared/routes.js links to it.
 */
export default function FestivalSearchModal({
  open = true,
  onClose,
  limit,
  includeEnded,
  children,
}) {
  const search = useFestivalSuggestions('', { limit, includeEnded });
  return (
    <Modal open={open} onClose={onClose} label="Find a festival" className="festival-search-modal">
      {typeof children === 'function' ? children({ ...search, close: onClose }) : children}
    </Modal>
  );
}
