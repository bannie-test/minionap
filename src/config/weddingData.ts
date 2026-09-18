import { WeddingConfig, TimelineEvent, WeddingScheduleItem, GalleryImage, WishRecord, Puzzle, Collectible, SeasonInfo } from '../types';
import { checkSpecialGuestInDb, getSpecialGuestsTable } from '../services/guestDatabase';

export const fourSeasons: SeasonInfo[] = [
  {
    id: 1,
    name: "Winter Wonderland",
    season: "winter",
    icon: "❄️",
    subtitle: "World 1 • Frosty Snowscape",
    description: "Gentle falling snow, crystalline ice platforms, and cozy warm memories.",
    accentColor: "#38bdf8",
    gateName: "Spring Flower Gate"
  },
  {
    id: 2,
    name: "Spring Blossom Meadow",
    season: "spring",
    icon: "🌸",
    subtitle: "World 2 • Blooming Sakura",
    description: "Floating cherry blossom petals, lush green fields, and playful garden snails.",
    accentColor: "#ec4899",
    gateName: "Summer Sun Gate"
  },
  {
    id: 3,
    name: "Summer Golden Coast",
    season: "summer",
    icon: "☀️",
    subtitle: "World 3 • Radiant Sunbeams",
    description: "Warm golden sands, sunflower jump pads, and memories of seaside road trips.",
    accentColor: "#f59e0b",
    gateName: "Autumn Amber Gate"
  },
  {
    id: 4,
    name: "Autumn Harvest Woods",
    season: "autumn",
    icon: "🍂",
    subtitle: "World 4 • Path to Matrimony",
    description: "Swirling golden maple leaves, cozy timber bridges, leading straight to the Grand Wedding Gate!",
    accentColor: "#ea580c",
    gateName: "Grand Wedding Gate"
  }
];

// Special Member VIP Guest List
// Loaded dynamically from the database table ('special_guest_roster')
export const getDynamicSpecialGuestList = (): string[] => {
  return getSpecialGuestsTable().map(g => g.name);
};

export const specialGuestList: string[] = [
  'Banbanus',
  'banbanus911',
  'Julian',
  'Sophia',
  'Julian Alexander',
  'Sophia Claire',
  'Maya',
  'Marcus',
  'Eleanor',
  'Waffles',
  'VIP Guest'
];

export const isSpecialGuest = (name: string): boolean => {
  if (!name) return false;
  return checkSpecialGuestInDb(name);
};

export const weddingConfig: WeddingConfig = {
  couple: {
    groom: "Julian Alexander",
    bride: "Sophia Claire",
    hashtag: "#JulianAndSophia2026",
    tagline: "Two hearts, one wondrous journey",
    weddingDate: "2026-10-24T15:30:00",
    weddingDateDisplay: "Saturday, October 24, 2026",
    locationDisplay: "Sonoma Valley & Villa Bella Vista, California"
  },
  ceremony: {
    title: "The Holy Matrimony Ceremony",
    venue: "St. Francis of Assisi Garden Chapel",
    time: "3:30 PM PST",
    address: "420 Sonoma Highway, Sonoma, CA 95476",
    mapUrl: "https://maps.google.com/?q=Sonoma+Valley+California",
    details: "An open-air garden courtyard surrounded by ancient olive trees and fragrant lavender. Please arrive 20 minutes early for seating and welcome music."
  },
  reception: {
    title: "Dinner, Dancing & Celebration",
    venue: "Villa Bella Vista Estate Vineyard",
    time: "5:30 PM – Midnight PST",
    address: "780 Vineyard Terrace Lane, Sonoma, CA 95476",
    mapUrl: "https://maps.google.com/?q=Villa+Bella+Vista+Sonoma",
    details: "Cocktails and appetizers at sunset overlooking the rolling vineyards, followed by a seasonal Tuscan-Californian feast and dancing under the stars."
  },
  dressCode: {
    theme: "Garden Formal / Warm Tuscan Elegance",
    description: "Think effortless elegance suitable for a coastal California sunset. Midi or floor-length dresses, suits or linen blends.",
    colors: [
      { name: "Olive Sage", hex: "#7A8B7B", desc: "Earthy botanical tones" },
      { name: "Dusty Rose", hex: "#D4A5A5", desc: "Soft romantic blush" },
      { name: "Tuscan Ochre", hex: "#D4A373", desc: "Warm golden sunlight" },
      { name: "Champagne", hex: "#F3E9DC", desc: "Refined neutral shimmer" },
      { name: "Midnight Navy", hex: "#1D2D44", desc: "Classic formal depth" }
    ],
    notes: "Heel note: The ceremony and cocktail hour are lawn-friendly; block heels or flats are encouraged. Stilettos may sink into the garden turf!"
  }
};

export const storyMilestones: TimelineEvent[] = [
  {
    year: "Autumn 2019",
    title: "When Coffee Met Rain",
    subtitle: "San Francisco, CA",
    description: "A sudden October downpour drove Julian under the striped awning of a cozy North Beach café. Sophia was there with a sketchbook and almond latte. What started as sharing a dry corner turned into a three-hour conversation about cinema, old vinyl, and childhood dreams.",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
    tag: "First Encounter"
  },
  {
    year: "Summer 2021",
    title: "The Lost Highway & Wildflowers",
    subtitle: "Pacific Coast Highway & Big Sur",
    description: "Their very first road trip together in a vintage station wagon. The alternator sputtered in Big Sur with zero cellphone reception. Instead of panicking, they set up camp by the cliffs, baked s'mores, and watched meteor showers over the Pacific. That weekend, both realized this was forever.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
    tag: "First Big Adventure"
  },
  {
    year: "Spring 2023",
    title: "A Home Filled with Plants & Laughter",
    subtitle: "Berkeley Hills, CA",
    description: "They adopted a goofy golden retriever pup named 'Waffles' and moved into a sunlit Craftsman home. Julian learned to bake artisanal sourdough, Sophia painted the sunroom, and their home became the bustling headquarters for family Sunday dinners.",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
    tag: "Building A Life"
  },
  {
    year: "Winter 2025",
    title: "The Cliffside Promise",
    subtitle: "Lake Como, Italy",
    description: "At sunrise beside the quiet waters of Lake Como, during a mist-covered private boat ride, Julian knelt down with a vintage heirloom diamond ring. Through tears of immense joy, Sophia whispered 'Yes, a million times yes!'",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    tag: "The Proposal"
  }
];

export const weddingSchedule: WeddingScheduleItem[] = [
  {
    time: "3:00 PM",
    icon: "Music",
    title: "Guest Arrival & Welcome Music",
    location: "Garden Chapel Grounds",
    description: "Chilled lavender lemonade, sparkling water, and acoustic string quartet."
  },
  {
    time: "3:30 PM",
    icon: "Heart",
    title: "The Wedding Ceremony",
    location: "St. Francis Open Courtyard",
    description: "Exchange of heartfelt personal vows, ring blessing, and unity ceremony."
  },
  {
    time: "4:30 PM",
    icon: "Wine",
    title: "Sunset Aperitivo & Cocktail Hour",
    location: "Vineyard Overlook Terrace",
    description: "Signature cocktails, artisanal charcuterie, and sunset golden-hour photos."
  },
  {
    time: "6:00 PM",
    icon: "Utensils",
    title: "Dinner Banquet & Toasts",
    location: "The Grand Pavilion",
    description: "Four-course family-style dinner paired with local Sonoma Valley reserve wines."
  },
  {
    time: "8:00 PM",
    icon: "Sparkles",
    title: "First Dance & Cake Cutting",
    location: "Fairylit Courtyard",
    description: "The sweetest tradition followed by dessert bar and champagne toast."
  },
  {
    time: "8:30 PM – Late",
    icon: "PartyPopper",
    title: "Dance Floor Celebration",
    location: "The Barrel Room & Terrace",
    description: "Live 8-piece funk & soul band, late-night gourmet pizza truck, and sparkler send-off."
  }
];

export const galleryImages: GalleryImage[] = [
  {
    id: "g1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
    caption: "Laughter in the lavender fields of Sonoma",
    category: "engagement",
    aspect: "landscape"
  },
  {
    id: "g2",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    caption: "Golden hour glow along the Pacific coastline",
    category: "memories",
    aspect: "portrait"
  },
  {
    id: "g3",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80",
    caption: "That quiet morning after the proposal in Lake Como",
    category: "travel",
    aspect: "landscape"
  },
  {
    id: "g4",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    caption: "Sunday coffee, sketches, and lazy mornings",
    category: "casual",
    aspect: "square"
  },
  {
    id: "g5",
    url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1000&q=80",
    caption: "Hand in hand beneath the giant redwoods",
    category: "memories",
    aspect: "landscape"
  },
  {
    id: "g6",
    url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
    caption: "Sharing gelato under the Venetian lantern lights",
    category: "travel",
    aspect: "portrait"
  }
];

export const weddingFAQ = [
  {
    q: "Is there transportation provided?",
    a: "Yes! Complimentary luxury shuttles will run continuously between the designated Sonoma Valley partner hotels and both venues from 2:00 PM until 1:00 AM."
  },
  {
    q: "Are children invited?",
    a: "While we adore your little ones, our wedding ceremony and reception are adult-only celebrations so everyone can relax and enjoy the night. We appreciate your understanding!"
  },
  {
    q: "What is the parking situation?",
    a: "Complimentary valet parking will be available at both the Chapel and the Villa estate. Vehicles may safely remain overnight until 11:00 AM Sunday morning."
  },
  {
    q: "Can I bring a plus one?",
    a: "Please refer to your RSVP card or digital RSVP search. If your invitation includes a guest, you will see their slot when submitting your response."
  },
  {
    q: "What should I gift the couple?",
    a: "Your presence and joyous energy are the greatest gifts of all! Should you wish to bless us further, we have created a Honeymoon & Future Home Adventure fund."
  }
];

export const initialWishes: WishRecord[] = [
  {
    id: "w1",
    guestName: "Eleanor & Marcus Vance",
    isPrivateName: false,
    message: "Watching your love story unfold over these years has been pure poetry. May every chapter ahead be sweeter than the last! See you on the dance floor!",
    createdAt: "2026-09-12T14:22:00",
    isApproved: true,
    likes: 18
  },
  {
    id: "w2",
    guestName: "Auntie Claire",
    isPrivateName: false,
    message: "Sophia my darling, your grandfather and I are weeping tears of joy. Julian is already family to all of us. Wishing you both a lifetime of laughter and peace.",
    createdAt: "2026-09-14T09:15:00",
    isApproved: true,
    likes: 24
  },
  {
    id: "w3",
    guestName: "David 'The Best Man' Miller",
    isPrivateName: false,
    message: "Julian, you officially punched way above your weight class! Sophia, you are an angel for keeping him in line. Can't wait to celebrate the greatest couple alive!",
    createdAt: "2026-09-15T19:40:00",
    isApproved: true,
    likes: 31
  },
  {
    id: "w4",
    guestName: "A Happy Well-Wisher",
    isPrivateName: true,
    message: "May your home always be filled with warmth, endless pots of coffee, and dog cuddles. Huge congratulations to both of you!",
    createdAt: "2026-09-16T11:05:00",
    isApproved: true,
    likes: 12
  }
];

export const allGamePuzzles: Puzzle[] = [
  // --- WORLD 1: WINTER WONDERLAND ---
  {
    id: "puz_winter_1",
    world: 1,
    title: "The Rainy Day Mystery",
    category: "logic",
    question: "Where did Julian & Sophia have their very first rainy afternoon conversation?",
    options: [
      "In a sunlit North Beach café over warm almond lattes",
      "Trapped at a noisy airport baggage claim",
      "During a muddy 10k marathon run"
    ],
    correctAnswer: 0,
    explanation: "October 2019 under the striped awning of a cozy North Beach coffee shop in SF!",
    funnyReactionWrong: "Brrr! Cold! Not quite baggage claim — think warm roasted espresso beans and autumn rain!",
    difficulty: "easy",
    rewardCollectibleId: "col_winter_cocoa"
  },
  {
    id: "puz_winter_2",
    world: 1,
    title: "The Frosty Morning Conundrum",
    category: "couple",
    question: "On freezing winter mornings, who is historically guilty of stealing all the blankets?",
    options: [
      "Sophia (wraps herself like a cozy cinnamon roll)",
      "Julian (claims he was just testing duvet tension)",
      "Waffles the dog (claims the middle pillow territory)"
    ],
    correctAnswer: 0,
    explanation: "Sophia has an Olympic gold medal in blanket burrito wrapping! Julian accepts his fate in the cold.",
    funnyReactionWrong: "Julian tried once, but Sophia's blanket-swaddle technique is unbeatable!",
    difficulty: "easy",
    rewardCollectibleId: "col_winter_crystal"
  },

  // --- WORLD 2: SPRING BLOSSOM MEADOW ---
  {
    id: "puz_spring_1",
    world: 2,
    title: "Waffles' Big Debut",
    category: "couple",
    question: "When they brought home their golden retriever pup Waffles in spring, what was his very first act?",
    options: [
      "Zoomed in 10 hyper circles and fell asleep snoring on Julian's shoe",
      "Chewed up Sophia's vintage watercolor brushes",
      "Politely requested an organic puppuccino"
    ],
    correctAnswer: 0,
    explanation: "Puppy zoomies followed by immediate dead-asleep snoring on Julian's favorite sneakers!",
    funnyReactionWrong: "Close, but his little paws couldn't resist doing 10 rapid victory laps around the living room first!",
    difficulty: "easy",
    rewardCollectibleId: "col_spring_blossom"
  },
  {
    id: "puz_spring_2",
    world: 2,
    title: "The Great Date Night Debate",
    category: "funny_choice",
    question: "Who takes significantly longer to get ready before a romantic date night?",
    options: [
      "Julian (obsessed with hair styling & trying on 4 jackets)",
      "Sophia (already waiting at the door with car keys)",
      "Both leave exactly on time with zero drama"
    ],
    correctAnswer: 0,
    explanation: "Legendary truth: Julian spends 40 minutes finding the 'ideal' collar while Sophia waits patiently!",
    funnyReactionWrong: "Sophia wishes! Julian's styling process is an exact aerospace engineering project!",
    difficulty: "easy",
    rewardCollectibleId: "col_spring_polaroid"
  },

  // --- WORLD 3: SUMMER GOLDEN COAST ---
  {
    id: "puz_summer_1",
    world: 3,
    title: "The Big Sur Breakdown",
    category: "memory",
    question: "When their vintage station wagon stalled on the Pacific Coast Highway in summer, what did they do?",
    options: [
      "Baked cliffside s'mores and watched meteor showers all night",
      "Panicked and started hitchhiking with sea otters",
      "Pushed the car 30 miles uphill back to Monterey"
    ],
    correctAnswer: 0,
    explanation: "With zero cellphone reception, they pitched camp by the cliffs, shared s'mores, and realized this love was forever.",
    funnyReactionWrong: "No sea otters harmed! They made it their most romantic impromptu stargazing night ever!",
    difficulty: "easy",
    rewardCollectibleId: "col_summer_shades"
  },
  {
    id: "puz_summer_2",
    world: 3,
    title: "The Sunset Toast",
    category: "wedding_trivia",
    question: "Which signature summer cocktail will be served at the sunset vineyard reception?",
    options: [
      "Lavender Limoncello Spritz & Sonoma Sunset Sangria",
      "Warm lukewarm tap water in a mug",
      "Spicy wasabi milk shake"
    ],
    correctAnswer: 0,
    explanation: "Crafted with local Sonoma lavender, crisp prosecco, and estate vineyard wine!",
    funnyReactionWrong: "Wasabi milk?! Absolutely not! Think fragrant lavender, sparkling bubbles, and sunshine!",
    difficulty: "easy",
    rewardCollectibleId: "col_summer_ring"
  },

  // --- WORLD 4: AUTUMN HARVEST WOODS ---
  {
    id: "puz_autumn_1",
    world: 4,
    title: "The Lake Como Promise",
    category: "couple",
    question: "Where did Julian drop to one knee with the vintage heirloom diamond ring?",
    options: [
      "Beside the mist-kissed sunrise waters of Lake Como, Italy",
      "In the drive-thru lane at Taco Bell",
      "While trying to assemble flat-pack IKEA bookshelves"
    ],
    correctAnswer: 0,
    explanation: "During a private wooden boat ride on Lake Como at sunrise, Sophia whispered 'Yes, a million times yes!'",
    funnyReactionWrong: "While Julian does love tacos, Lake Como was infinitely more breathtaking!",
    difficulty: "easy",
    rewardCollectibleId: "col_autumn_wine"
  },
  {
    id: "puz_autumn_2",
    world: 4,
    title: "The Grand Gate Mystery",
    category: "wedding_trivia",
    question: "What wondrous celebration is waiting right beyond the Grand Wedding Gate ahead?",
    options: [
      "The Official Wedding Invitation, RSVP, Schedule & Wishes of Julian & Sophia!",
      "A fierce fire dragon asking for tolls",
      "A mysterious portal into another dimension of homework"
    ],
    correctAnswer: 0,
    explanation: "You have arrived! The Grand Wedding Gate leads directly to the wedding feast, schedule, and guest blessings!",
    funnyReactionWrong: "No homework or dragons here! You're only moments away from our digital wedding celebration!",
    difficulty: "easy",
    rewardCollectibleId: "col_autumn_scroll"
  }
];

export const gamePuzzles: Record<string, Puzzle> = allGamePuzzles.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, Puzzle>);

export const getPuzzlesForWorld = (worldNum: number): Puzzle[] => {
  return allGamePuzzles.filter(p => p.world === worldNum);
};

export const gameCollectibles: Collectible[] = [
  // World 1: Winter
  {
    id: "col_winter_cocoa",
    type: "gift",
    title: "Steaming Hot Cocoa Mug",
    description: "Rich dark chocolate with floating mini marshmallows.",
    world: 1,
    icon: "☕",
    rewardContent: {
      type: "memory",
      title: "Cozy Winter Evenings",
      text: "Julian mastered the secret ratio of cinnamon and dark chocolate to warm up chilly evenings together."
    }
  },
  {
    id: "col_winter_crystal",
    type: "star",
    title: "Everlasting Frost Crystal",
    description: "A glistening snowflake crystal that never melts.",
    world: 1,
    icon: "❄️",
    rewardContent: {
      type: "quote",
      title: "Clarity of Love",
      text: "'Like every snowflake is unique, my love for you is one in all eternity.'"
    }
  },

  // World 2: Spring
  {
    id: "col_spring_blossom",
    type: "flower",
    title: "First Sakura Blossom",
    description: "A delicate pink petal carrying the promise of spring.",
    world: 2,
    icon: "🌸",
    rewardContent: {
      type: "memory",
      title: "New Beginnings",
      text: "Every spring they plant new garden herbs and watch the cherry trees burst with life in Berkeley."
    }
  },
  {
    id: "col_spring_polaroid",
    type: "photo",
    title: "Puppy Waffles' First Polaroid",
    description: "A funny snapshot of little Waffles with one floppy ear.",
    world: 2,
    icon: "📷",
    rewardContent: {
      type: "photo",
      title: "Family of Three",
      text: "The moment Waffles joined their home, their world was forever filled with tail wags and joyful laughter."
    }
  },

  // World 3: Summer
  {
    id: "col_summer_shades",
    type: "gift",
    title: "Vintage Road Trip Sunglasses",
    description: "Classic tortoiseshell shades worn along Highway 1.",
    world: 3,
    icon: "🕶️",
    rewardContent: {
      type: "memory",
      title: "Golden Hour Coastlines",
      text: "Driving with windows rolled all the way down, ocean breeze in Sophia's hair and vintage tunes playing."
    }
  },
  {
    id: "col_summer_ring",
    type: "ring",
    title: "Heirloom Promise Ring",
    description: "A sparkling ring blessed with enduring devotion.",
    world: 3,
    icon: "💍",
    rewardContent: {
      type: "quote",
      title: "The Sacred Vow",
      text: "'In every lifetime, across every winding path, I would choose your hand to hold.'"
    }
  },

  // World 4: Autumn
  {
    id: "col_autumn_wine",
    type: "gift",
    title: "Sonoma Valley Reserve Vintage",
    description: "A bottle of aged red wine harvested under Tuscan-style autumn skies.",
    world: 4,
    icon: "🍷",
    rewardContent: {
      type: "memory",
      title: "Toast to Forever",
      text: "Aged to perfection, just like love that grows deeper, richer, and sweeter with each passing year."
    }
  },
  {
    id: "col_autumn_scroll",
    type: "card",
    title: "The Golden Wedding Gate Scroll",
    description: "An ornate royal invitation parchment sealed in burgundy wax.",
    world: 4,
    icon: "💌",
    rewardContent: {
      type: "message",
      title: "Welcome to Our Wedding Celebration!",
      text: "You have traversed the 4 seasons. The Grand Wedding Gates now swing wide open for you!"
    }
  }
];
