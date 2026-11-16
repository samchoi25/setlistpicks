// Sam and Sara's Lucky 13 — a private party, not a music festival.
//
// Guests vote on cocktails instead of sets, using the same Skip / 👍 / 🔥
// picks. There is no lineup to hardcode: each cocktail is entered by a guest
// in the app and stored as a set (see `userSets` below and the user_sets
// table in server/db.js), then merged into the schedule at runtime as an
// untimed, stageless set — so the grid shows one flowing list of cocktails.
//
// Flags only this event uses:
//   userSets     — guests add the sets themselves; `sets` starts empty.
//   secretVotes  — nobody sees anyone else's picks or any count. The running
//                  tally is only on the admin page (/admin/:secret/tally/lucky-13).
//   unlisted     — never the default page, never in search, the switcher or
//                  the sitemap, and its pages are noindex.
//   entryNoun    — what one set is called in copy ("Add a cocktail").
//   maxPicks     — voting is a plain yes/no per cocktail (no Want/Must See),
//                  and each guest can vote for at most this many.
//   memberNameWords — holiday words for the placeholder name a new guest
//                  gets before typing their own ("Jolly Snowflake 42").
//
// The date is deliberately far out so voting never closes early; set the
// real party date here once it's known (voting closes when that day ends).

const slug = 'lucky-13';

const days = [
  { id: 'party', name: 'Cocktail Vote', date: 'Dec 31' },
];

export default {
  slug,
  name: "Sam and Sara's Lucky 13",
  shortName: 'Lucky 13',
  year: 2026,
  venue: 'Private party',
  place: { name: 'Private party', addressCountry: 'US' },
  utcOffset: '-08:00',
  dateRange: 'Private party',
  officialUrl: 'https://setlistpicks.com/lucky-13',
  headliners: [],
  stages: [],
  days,
  sets: {},
  userSets: true,
  secretVotes: true,
  unlisted: true,
  entryNoun: 'cocktail',
  maxPicks: 3,
  memberNameWords: {
    adjectives: [
      'Jolly', 'Merry', 'Festive', 'Frosty', 'Snowy', 'Twinkly', 'Cozy', 'Sparkly',
      'Glittery', 'Toasty', 'Cheery', 'Mistletoed', 'Tinseled', 'Candlelit',
      'Gingerbread', 'Peppermint', 'Wintry', 'Starry', 'Spiced', 'Sugarplum',
      'Velvet', 'Golden', 'Midnight', 'Bubbly',
    ],
    nouns: [
      'Snowflake', 'Reindeer', 'Elf', 'Snowman', 'Nutcracker', 'Candy Cane',
      'Mistletoe', 'Ornament', 'Stocking', 'Sleigh', 'Snowball', 'Garland',
      'Wreath', 'Tinsel', 'Eggnog', 'Cocoa', 'Chestnut', 'Icicle', 'Mitten',
      'Penguin', 'Pinecone', 'Confetti', 'Countdown', 'Toast',
    ],
  },
  groupNames: [
    'Lucky Thirteen', 'Shaken Not Stirred', 'Top Shelf', 'Last Call',
    'Bitters End', 'Happy Hour Heroes', 'Twist of Lime', 'On the Rocks',
  ],
};
