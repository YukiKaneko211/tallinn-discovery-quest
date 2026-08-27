/**
 * Master data seeded into PGlite on first launch.
 * Coordinates are the real locations in Tallinn's Old Town so the app can be
 * demoed with a spoofed GPS position; swap this file to ship other cities.
 */

export interface SeedSpot {
  id: string;
  name: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  spotImage: string;
  stampImage: string;
  rewardPoints: number;
}

export interface SeedQuiz {
  id: string;
  spotId: string;
  title: string;
  question: string;
  choices: string[];
  correctAnswerIndex: number;
  rewardPoints: number;
}

export interface SeedDeco {
  id: string;
  spotId: string | null;
  name: string;
  costPoints: number;
  imageUrl: string;
}

const spotImg = (slug: string) => `/assets/spots/spot_thumb_${slug}.svg`;
const stampImg = (slug: string) => `/assets/stamps/stamp_checkedin_${slug}.svg`;

export const EMPTY_STAMP_THUMB = '/assets/stamps/stamp_thumb_empty.svg';
export const UNCHECKED_STAMP = '/assets/stamps/stamp_uncheckedin.svg';

export const SEED_SPOTS: SeedSpot[] = [
  {
    id: 'tallinn-town-hall',
    name: 'Tallinn Town Hall',
    address: 'Raekoja plats 1, Tallinn',
    description:
      'First mentioned in 1322, the building history of Tallinn Town Hall goes back to the 13th century. It is the only surviving Gothic town hall in Northern Europe.',
    latitude: 59.4372,
    longitude: 24.7453,
    rewardPoints: 50,
    spotImage: spotImg('tallinn-town-hall'),
    stampImage: stampImg('tallinn-town-hall'),
  },
  {
    id: 'st-olafs-church',
    name: "St. Olaf's Church",
    address: 'Lai 50, Tallinn',
    description:
      "Once believed to be the tallest building in the world, St. Olaf's spire has been struck by lightning many times. The tower platform offers a sweeping view of the Old Town rooftops.",
    latitude: 59.4419,
    longitude: 24.7477,
    rewardPoints: 50,
    spotImage: spotImg('st-olafs-church'),
    stampImage: stampImg('st-olafs-church'),
  },
  {
    id: 'viru-gate',
    name: 'Viru Gate',
    address: 'Viru 2, Tallinn',
    description:
      'The twin towers of Viru Gate are the most photographed entrance to the Old Town, and all that remains of a much larger 14th-century gate complex.',
    latitude: 59.4368,
    longitude: 24.7513,
    rewardPoints: 50,
    spotImage: spotImg('viru-gate'),
    stampImage: stampImg('viru-gate'),
  },
  {
    id: 'toompea-castle',
    name: 'Toompea Castle',
    address: 'Lossi plats 1a, Tallinn',
    description:
      'Seat of power in Estonia for centuries and home of the Riigikogu today. The pink Baroque facade hides medieval walls and the Tall Hermann tower.',
    latitude: 59.4358,
    longitude: 24.7376,
    rewardPoints: 50,
    spotImage: spotImg('toompea-castle'),
    stampImage: stampImg('toompea-castle'),
  },
  {
    id: 'alexander-nevsky',
    name: 'Alexander Nevsky Cathedral',
    address: 'Lossi plats 10, Tallinn',
    description:
      'A Russian Orthodox cathedral completed in 1900, famous for its onion domes and the most powerful ensemble of church bells in Tallinn.',
    latitude: 59.436,
    longitude: 24.7395,
    rewardPoints: 50,
    spotImage: spotImg('alexander-nevsky'),
    stampImage: stampImg('alexander-nevsky'),
  },
  {
    id: 'niguliste-church',
    name: 'Niguliste Church',
    address: 'Niguliste 3, Tallinn',
    description:
      "A medieval church dedicated to St. Nicholas, patron saint of sailors. Today it is a museum holding Bernt Notke's famous Danse Macabre painting.",
    latitude: 59.436,
    longitude: 24.7434,
    rewardPoints: 50,
    spotImage: spotImg('niguliste-church'),
    stampImage: stampImg('niguliste-church'),
  },
  {
    id: 'kiek-in-de-kok',
    name: 'Kiek in de Kok',
    address: 'Komandandi tee 2, Tallinn',
    description:
      'A 38-metre artillery tower from 1475 whose Low German name means "peep into the kitchen" — from the top, guards could see into townspeople\'s kitchens.',
    latitude: 59.4344,
    longitude: 24.7391,
    rewardPoints: 50,
    spotImage: spotImg('kiek-in-de-kok'),
    stampImage: stampImg('kiek-in-de-kok'),
  },
  {
    id: 'fat-margaret',
    name: 'Fat Margaret Tower',
    address: 'Pikk 70, Tallinn',
    description:
      'A stout cannon tower guarding the Great Coastal Gate, with walls up to 5 metres thick. It now houses the Estonian Maritime Museum.',
    latitude: 59.4432,
    longitude: 24.749,
    rewardPoints: 50,
    spotImage: spotImg('fat-margaret'),
    stampImage: stampImg('fat-margaret'),
  },
  {
    id: 'kohtuotsa-platform',
    name: 'Kohtuotsa Platform',
    address: 'Kohtu 12, Tallinn',
    description:
      'The classic postcard viewpoint on Toompea hill, looking over red rooftops towards the harbour. A wall here reads "The Times We Had".',
    latitude: 59.4374,
    longitude: 24.7402,
    rewardPoints: 50,
    spotImage: spotImg('kohtuotsa-platform'),
    stampImage: stampImg('kohtuotsa-platform'),
  },
  {
    id: 'great-guild-hall',
    name: 'Great Guild Hall',
    address: 'Pikk 17, Tallinn',
    description:
      'Built in 1410 for the merchants of the Great Guild, whose members effectively ran the medieval town. It is now the Estonian History Museum.',
    latitude: 59.4381,
    longitude: 24.7452,
    rewardPoints: 50,
    spotImage: spotImg('great-guild-hall'),
    stampImage: stampImg('great-guild-hall'),
  },
  {
    id: 'holy-spirit-church',
    name: 'Holy Spirit Church',
    address: 'Puhavaimu 2, Tallinn',
    description:
      "Home to Tallinn's oldest public clock, carved in 1684, and the first church where sermons were preached in the Estonian language.",
    latitude: 59.4377,
    longitude: 24.745,
    rewardPoints: 50,
    spotImage: spotImg('holy-spirit-church'),
    stampImage: stampImg('holy-spirit-church'),
  },
  {
    id: 'katariina-kaik',
    name: "St. Catherine's Passage",
    address: 'Vene 12, Tallinn',
    description:
      'A narrow medieval lane lined with craft workshops, where glassblowers, hatters and potters still work behind the old stone arches.',
    latitude: 59.4373,
    longitude: 24.748,
    rewardPoints: 50,
    spotImage: spotImg('katariina-kaik'),
    stampImage: stampImg('katariina-kaik'),
  },
];

type QuizSeed = [title: string, question: string, choices: string[], correct: number, pts: number];

const QUIZZES_BY_SPOT: Record<string, QuizSeed[]> = {
  'tallinn-town-hall': [
    [
      'Where is Original Old Thomas?',
      'The original Old Thomas weather vane was taken down in 1944. Where is he kept right now?',
      ['Above the entrance door', 'In the cellar', 'Top room of the tower'],
      1,
      20,
    ],
    [
      'How Many Steps in the Tower?',
      'How many steps do you climb to reach the top of the Town Hall tower?',
      ['64 steps', '115 steps', '208 steps'],
      1,
      10,
    ],
    [
      'What Guards the Gutters?',
      'What creatures are carved on the water spouts of the Town Hall roof?',
      ['Dragons', 'Lions', 'Eagles'],
      0,
      10,
    ],
  ],
  'st-olafs-church': [
    [
      'How Tall Was the Spire?',
      "St. Olaf's spire once reached a record height. How tall was it at its peak?",
      ['124 metres', '159 metres', '182 metres'],
      1,
      20,
    ],
    [
      'Struck by Lightning',
      'How many times has the church been struck by lightning through its history?',
      ['At least 3 times', 'At least 10 times', 'Never'],
      1,
      10,
    ],
    [
      'Who Was Olaf?',
      'The church is named after Olaf II, a king of which country?',
      ['Norway', 'Denmark', 'Sweden'],
      0,
      10,
    ],
  ],
  'viru-gate': [
    [
      'How Many Towers?',
      'How many towers of the original Viru Gate complex are still standing today?',
      ['Two', 'Four', 'Six'],
      0,
      20,
    ],
    [
      'Why Was It Demolished?',
      'Most of the gate was pulled down in the 1880s. Why?',
      ['A great fire', 'To make room for traffic', 'It collapsed'],
      1,
      10,
    ],
    [
      'What Grows on the Wall?',
      'What is famously sold by the flower sellers right beside Viru Gate?',
      ['Fresh flowers', 'Amber', 'Wool socks'],
      0,
      10,
    ],
  ],
  'toompea-castle': [
    [
      'What Flies on Tall Hermann?',
      'What is raised on Tall Hermann tower every morning at sunrise?',
      ['The Estonian flag', 'A weather vane', 'A lantern'],
      0,
      20,
    ],
    [
      'Who Works Here Now?',
      'Which institution sits inside Toompea Castle today?',
      ['The Riigikogu (parliament)', 'The city museum', 'The national library'],
      0,
      10,
    ],
    [
      'What Colour Is the Facade?',
      'What colour is the Baroque facade facing Lossi plats?',
      ['Pale pink', 'Bright yellow', 'Sea green'],
      0,
      10,
    ],
  ],
  'alexander-nevsky': [
    [
      'How Many Domes?',
      'How many onion domes crown the cathedral?',
      ['Three', 'Five', 'Seven'],
      1,
      20,
    ],
    [
      'When Was It Finished?',
      'In which year was the cathedral completed?',
      ['1858', '1900', '1927'],
      1,
      10,
    ],
    [
      'What Hangs in the Belfry?',
      'The belfry holds the most powerful bell ensemble in Tallinn. How many bells?',
      ['Five', 'Eleven', 'Twenty'],
      1,
      10,
    ],
  ],
  'niguliste-church': [
    [
      'Who Is the Patron Saint?',
      'Niguliste church is dedicated to a saint who protects which group of people?',
      ['Sailors', 'Bakers', 'Blacksmiths'],
      0,
      20,
    ],
    [
      'What Is Danse Macabre?',
      'The church holds a famous medieval painting. What does it depict?',
      ['A dance of death', 'A royal wedding', 'A sea battle'],
      0,
      10,
    ],
    [
      'What Is It Used For Now?',
      'What is the building used for today?',
      ['A museum and concert hall', 'A working parish church', 'A library'],
      0,
      10,
    ],
  ],
  'kiek-in-de-kok': [
    [
      'What Does the Name Mean?',
      'The Low German name "Kiek in de Kok" translates to what?',
      ['Peep into the kitchen', 'Guard of the gate', 'Look at the sea'],
      0,
      20,
    ],
    [
      'How Thick Are the Walls?',
      'How thick are the walls of this artillery tower at the base?',
      ['About 1 metre', 'About 4 metres', 'About 9 metres'],
      1,
      10,
    ],
    [
      'What Is Hidden Below?',
      'What can visitors explore underneath the tower?',
      ['Bastion tunnels', 'A flooded well', 'A royal crypt'],
      0,
      10,
    ],
  ],
  'fat-margaret': [
    [
      'Why "Fat"?',
      'Why is this tower nicknamed "Fat" Margaret?',
      ['Its huge diameter', 'A legendary cook', 'A rounded roof'],
      0,
      20,
    ],
    [
      'What Is Inside Today?',
      'Which museum occupies Fat Margaret now?',
      ['Estonian Maritime Museum', 'Museum of Occupations', 'Art Museum'],
      0,
      10,
    ],
    [
      'Which Gate Does It Guard?',
      'Fat Margaret protected which entrance to the town?',
      ['The Great Coastal Gate', 'The Viru Gate', 'The Karja Gate'],
      0,
      10,
    ],
  ],
  'kohtuotsa-platform': [
    [
      'What Does the Wall Say?',
      'A well-known phrase is painted on the wall by the viewing platform. What is it?',
      ['The Times We Had', 'Welcome to Tallinn', 'Look Up'],
      0,
      20,
    ],
    [
      'Which Hill Is This?',
      'Kohtuotsa platform stands on which hill?',
      ['Toompea', 'Lasnamae', 'Mustamae'],
      0,
      10,
    ],
    [
      'What Can You See?',
      'Beyond the red rooftops, what is visible from the platform on a clear day?',
      ['The harbour and the sea', 'The airport', 'Lake Peipus'],
      0,
      10,
    ],
  ],
  'great-guild-hall': [
    [
      'Who Built It?',
      'The Great Guild Hall was built in 1410 for which group?',
      ['Wealthy merchants', 'The bishop', 'The ship carpenters'],
      0,
      20,
    ],
    [
      'What Is It Now?',
      'Which museum is housed in the Great Guild Hall today?',
      ['Estonian History Museum', 'Natural History Museum', 'Design Museum'],
      0,
      10,
    ],
    [
      'What Is on the Door?',
      'What decorates the medieval door knockers of the hall?',
      ['Lion heads', 'Ship anchors', 'Grape vines'],
      0,
      10,
    ],
  ],
  'holy-spirit-church': [
    [
      'How Old Is the Clock?',
      'The carved clock on the facade is the oldest public clock in Tallinn. From which year?',
      ['1531', '1684', '1802'],
      1,
      20,
    ],
    [
      'A First in Estonian',
      'What happened here for the first time in the Estonian language?',
      ['A church sermon', 'A printed newspaper', 'A theatre play'],
      0,
      10,
    ],
    [
      'What Shape Is the Steeple?',
      'What is unusual about the church steeple?',
      ['It is octagonal', 'It leans sideways', 'It has two spires'],
      0,
      10,
    ],
  ],
  'katariina-kaik': [
    [
      'What Do the Craftspeople Make?',
      'Which craft is NOT practised in the workshops along the passage?',
      ['Glassblowing', 'Hat making', 'Shipbuilding'],
      2,
      20,
    ],
    [
      'What Leans on the Wall?',
      'What medieval objects are mounted along the passage wall?',
      ['Tombstones', 'Anchors', 'Millstones'],
      0,
      10,
    ],
    [
      'Which Church Gives the Name?',
      "The passage is named after the church of St. Catherine, belonging to which order?",
      ['The Dominicans', 'The Franciscans', 'The Templars'],
      0,
      10,
    ],
  ],
};

export const SEED_QUIZZES: SeedQuiz[] = SEED_SPOTS.flatMap((spot) =>
  (QUIZZES_BY_SPOT[spot.id] ?? []).map(([title, question, choices, correct, pts], i) => ({
    id: `${spot.id}-q${i + 1}`,
    spotId: spot.id,
    title,
    question,
    choices,
    correctAnswerIndex: correct,
    rewardPoints: pts,
  })),
);

/** Deco names follow the artwork produced by scripts/gen-assets.py (same order). */
const DECO_NAMES = [
  'Old Thomas',
  'Dragon Gutter',
  'Tallinn Coat of Arms',
  'Tower Charm',
  'Marzipan Treat',
  'Estonian Flag',
  'Old Town Star',
  'Tallinn Heart',
  'Tallinn Ribbon',
];
const DECO_COSTS = [20, 30, 50];

export const SEED_DECOS: SeedDeco[] = [
  ...SEED_SPOTS.flatMap((spot, si) =>
    [0, 1, 2].map((j) => {
      const idx = si * 3 + j;
      return {
        id: `${spot.id}-${j + 1}`,
        spotId: spot.id,
        name: `${DECO_NAMES[idx % DECO_NAMES.length]} (${spot.name})`,
        costPoints: DECO_COSTS[j],
        imageUrl: `/assets/decos/deco_${spot.id}-${j + 1}.svg`,
      };
    }),
  ),
  // General Decos, not tagged to a Spot. Free so that a brand-new user always
  // has something to decorate with before earning any points.
  ...['Starter Star', 'Starter Heart', 'Starter Ribbon', 'Starter Flag'].map((name, i) => ({
    id: `general-${i + 1}`,
    spotId: null,
    name,
    costPoints: 0,
    imageUrl: `/assets/decos/deco_general-${i + 1}.svg`,
  })),
];
