import React, { createContext, useContext } from 'react';

/*
 * The festival currently being viewed. Components used to import SCHEDULE,
 * DAYS and the grid bounds straight from a module, which hardcoded exactly one
 * festival per build; they now read whichever one the route resolved to.
 *
 * The value is a frozen object built once per slug, so it is referentially
 * stable and consumers never re-render because of the context itself.
 */
const FestivalContext = createContext(null);

export function FestivalProvider({ festival, children }) {
  return (
    <FestivalContext.Provider value={festival}>
      {children}
    </FestivalContext.Provider>
  );
}

export function useFestival() {
  const festival = useContext(FestivalContext);
  if (!festival) {
    throw new Error('useFestival() must be used inside <FestivalProvider>');
  }
  return festival;
}
