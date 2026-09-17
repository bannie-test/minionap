import { WeddingConfig, TimelineEvent, WeddingScheduleItem, GalleryImage, WishRecord, Puzzle, Collectible } from '../types';

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

export const gamePuzzles: Record<number, Puzzle> = {
  1: {
    id: "puz_world1",
    category: "logic",
    question: "Where did Julian & Sophia have their very first rainy afternoon conversation?",
    options: [
      "In a sunlit North Beach café over coffee",
      "At a noisy subway station",
      "During a marathon race"
    ],
    correctAnswer: 0,
    explanation: "October 2019 under the striped awning of a cozy North Beach coffee shop in SF!",
    funnyReactionWrong: "Brrr! Cold! Not quite subway tracks — think warm roasted coffee beans and rain!",
    difficulty: "easy",
    rewardCollectibleId: "col_photo1"
  },
  2: {
    id: "puz_world2",
    category: "couple",
    question: "Who takes significantly longer to get ready before date night?",
    options: [
      "Julian (obsessed with his shoes & hair)",
      "Sophia (trying on three scarves)",
      "Waffles the golden retriever!"
    ],
    correctAnswer: 0,
    explanation: "True story: Julian spends 40 minutes finding the 'perfect' jacket while Sophia is already waiting at the door with keys in hand!",
    funnyReactionWrong: "Sophia wishes! Julian's hair grooming routine is a legendary scientific event!",
    difficulty: "easy",
    rewardCollectibleId: "col_ring"
  },
  3: {
    id: "puz_world3",
    category: "wedding_trivia",
    question: "What is waiting behind the Grand Golden Wedding Gate ahead?",
    options: [
      "A fierce fire dragon guarding pizza",
      "The Official Wedding Invitation & RSVP of Julian & Sophia!",
      "A blank 404 page"
    ],
    correctAnswer: 1,
    explanation: "Yes! The grand gates lead to their interactive wedding invitation, stories, schedule, and wishing wall!",
    funnyReactionWrong: "No dragons here (though late-night pizza is planned!). Try again!",
    difficulty: "easy",
    rewardCollectibleId: "col_invitation"
  }
};

export const gameCollectibles: Collectible[] = [
  {
    id: "col_gift1",
    type: "gift",
    title: "The Golden Memory Box",
    description: "A mysterious gift box tied with a blush silk ribbon.",
    world: 1,
    icon: "🎁",
    rewardContent: {
      type: "memory",
      title: "Memory #1: The Rainy Day Coffee",
      text: "Julian offered Sophia his dry coat, while Sophia sketched a funny cartoon of them dodging raindrops. The start of an adventure!",
      date: "October 2019"
    }
  },
  {
    id: "col_photo1",
    type: "photo",
    title: "Road Trip Polaroid",
    description: "A snapshot of the Pacific Coast Highway breakdown adventure.",
    world: 1,
    icon: "📷",
    rewardContent: {
      type: "photo",
      title: "Big Sur Memories",
      text: "Even when the car broke down, the laughter never stopped. True love is having fun stranded on the Pacific cliffside."
    }
  },
  {
    id: "col_ring",
    type: "ring",
    title: "Heirloom Promise Ring",
    description: "A sparkling band blessed with eternal devotion.",
    world: 2,
    icon: "💍",
    rewardContent: {
      type: "quote",
      title: "The Vow",
      text: "'In every lifetime, in every universe, I would always find my way back to your heart.'"
    }
  },
  {
    id: "col_star",
    type: "star",
    title: "Star of Romance",
    description: "Radiant starlight collected from the twilight sky.",
    world: 2,
    icon: "⭐",
    rewardContent: {
      type: "message",
      title: "A Wish Granted",
      text: "Two adventurers traveling together, discovering wonder in the smallest everyday moments."
    }
  },
  {
    id: "col_flower",
    type: "flower",
    title: "Sonoma Lavender Bouquet",
    description: "Fragrant purple blossoms picked fresh from the chapel garden.",
    world: 3,
    icon: "🌹",
    rewardContent: {
      type: "memory",
      title: "Fragrance of the Day",
      text: "The exact lavender and white garden roses that will line the aisle when Sophia walks to Julian."
    }
  },
  {
    id: "col_invitation",
    type: "card",
    title: "Golden Gate Key & Royal Scroll",
    description: "The enchanted key that unlocks the Grand Wedding Gates!",
    world: 3,
    icon: "💌",
    rewardContent: {
      type: "message",
      title: "You Have Arrived!",
      text: "With this key, the gates swing open. Welcome to our wedding celebration!"
    }
  }
];
