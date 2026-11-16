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
//   photos       — guests can snap a photo of a cocktail from its long-press
//                  popup; everyone sees the photos there. They're deleted
//                  from the server within a few hours of the event's date
//                  ending (server/photos.js), so set the real date below.
//   logo         — image shown top-left in place of the "Lucky 13" wordmark
//                  (client/public/logos/lucky-13.png, served from /logos/).
//   snow         — gently falling CSS snow over the page (.is-snowing).
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
  snow: true,
  logo: '/logos/lucky-13.png',
  photos: true,
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
  // Palette supplied for the party, light to dark: lavender #C7D1E9,
  // periwinkle #98AED3, slate #607582, spruce #415A51, near-black olive
  // #222F19. Cards sit on lavender over a periwinkle page; the darkest shade
  // is all the text; the cocktail blocks and primary buttons are spruce with
  // white text, and secondary buttons (Copy Link) slate. The "liked"
  // highlighter is crimson #C33149 instead of the site's yellow — it
  // multiplies, so it reads as a deep wine on the page and darkens a liked
  // block — with white text on it in the legend.
  theme: {
    tokens: {
      '--bg': '#98AED3',
      '--paper': '#C7D1E9',
      '--ink': '#222F19',
      '--btn-primary': '#415A51',
      '--btn-secondary': '#607582',
      '--on-btn-secondary': '#FFFFFF',
      '--block-ink': '#FFFFFF',
      '--want-wash': '#C33149',
      '--want-ink': '#FFFFFF',
    },
  },
  groupNames: [
    'Lucky Thirteen', 'Shaken Not Stirred', 'Top Shelf', 'Last Call',
    'Bitters End', 'Happy Hour Heroes', 'Twist of Lime', 'On the Rocks',
  ],
};
