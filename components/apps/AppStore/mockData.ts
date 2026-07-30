export type AppCategory =
  | "All"
  | "Development"
  | "Games"
  | "Media"
  | "Productivity"
  | "Social"
  | "Utilities";

export type AppReview = {
  comment: string;
  date: string;
  id: string;
  rating: number;
  userName: string;
};

export type SystemRequirements = {
  architecture: string;
  graphics: string;
  memory: string;
  os: string;
};

export type AppStoreApp = {
  ageRating?: string;
  badges?: string[];
  category: AppCategory;
  changelog?: string;
  description: string;
  developer: string;
  downloadUrl: string;
  heroImage?: string;
  iconUrl: string;
  id: string;
  isDiscoverMore?: boolean;
  isFeaturedGrid?: boolean;
  isHero?: boolean;
  isTrendingApp?: boolean;
  isTrendingGame?: boolean;
  name: string;
  price: number;
  rating?: number;
  ratingCount?: number;
  reviews?: AppReview[];
  screenshots?: string[];
  size?: string;
  sysReqs?: SystemRequirements;
  tagline?: string;
  version: string;
};

export type AppStoreUser = {
  purchasedAppIds: string[];
  username: string;
  walletBalance: number;
};

export const CATEGORIES: AppCategory[] = [
  "All",
  "Games",
  "Utilities",
  "Productivity",
  "Media",
  "Social",
  "Development",
];

export const mockApps: AppStoreApp[] = [
  {
    ageRating: "12+ Horror In-App Purchases",
    badges: ["Built for Copilot+ PC", "Uses AI features"],
    category: "Media",
    changelog:
      "v3.8.0: Added smart AI background remover, 4K multi-track timeline rendering, speed curve controls, and 50+ new trending music tracks.",
    description:
      "CapCut is an all-in-one, feature-rich video editing software designed for desktop creators. With intuitive timeline editing, multi-track video overlay, AI auto-captions, keyframe animation, background removal, and thousands of trending effects and sound tracks, CapCut makes high quality video production effortless for social media, YouTube, and personal projects.",
    developer: "BYTEDANCE PTE. LTD",
    downloadUrl: "",
    heroImage: "/System/Icons/48x48/photo.png",
    iconUrl: "/System/Icons/48x48/photo.png",
    id: "capcut",
    isDiscoverMore: false,
    isTrendingApp: true,
    name: "CapCut",
    price: 0,
    rating: 4.8,
    ratingCount: 913,
    reviews: [
      {
        comment:
          "Best desktop video editor by far! AI auto-captions save hours of manual typing.",
        date: "2026-07-20",
        id: "rev-1",
        rating: 5,
        userName: "Alex R.",
      },
      {
        comment:
          "Smooth performance even on 4K video timelines. Keyframes work flawlessly.",
        date: "2026-07-15",
        id: "rev-2",
        rating: 5,
        userName: "Devon M.",
      },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    ],
    size: "420.5 MB",
    tagline:
      "Try out CapCut desktop version! CapCut offers easy-to-use video and photos editing tools, free in-app fonts and effects...",
    version: "3.8.0",
  },
  {
    ageRating: "3+ In-App Purchases, Users Interact",
    badges: ["Top Free Productivity"],
    category: "Productivity",
    changelog:
      "v4.1.2: Improved OCR text recognition speed by 40%, added dark mode reader theme, and support for multi-page batch digital signatures.",
    description:
      "PDF X is a powerful, user-friendly PDF viewer and editor for Windows. Edit text, annotate documents, fill forms, merge PDFs, convert files to Office formats, and protect sensitive data with digital signatures.",
    developer: "PDFX Software",
    downloadUrl: "",
    heroImage: "/System/Icons/48x48/pdf.png",
    iconUrl: "/System/Icons/48x48/pdf.png",
    id: "pdf-x",
    isHero: true,
    name: "PDF X: PDF Editor & PDF Reader",
    price: 0,
    rating: 4.7,
    ratingCount: 3420,
    reviews: [
      {
        comment:
          "Fast PDF loader and annotation tools. Works great for school textbooks and business contracts.",
        date: "2026-06-30",
        id: "rev-3",
        rating: 5,
        userName: "Sarah T.",
      },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80",
    ],
    size: "85.4 MB",
    tagline: "PDF Editor at Your Fingertips",
    version: "4.1.2",
  },
  {
    ageRating: "3+ In-Game Purchases, Users Interact",
    badges: ["Casual", "Match-3"],
    category: "Games",
    changelog: "v6.2.0: New Secret Conservatory area with 50 brand-new match-3 levels!",
    description:
      "Welcome to Gardenscapes! Embark on an adventurous journey: beat match-3 levels, restore and decorate different areas in the garden, get to the bottom of the secrets it holds, and enjoy the company of amusing in-game characters!",
    developer: "Playrix",
    downloadUrl: "",
    heroImage: "/System/Icons/48x48/dino.png",
    iconUrl: "/System/Icons/48x48/dino.png",
    id: "gardenscapes",
    isFeaturedGrid: true,
    name: "Gardenscapes",
    price: 0,
    rating: 4.6,
    ratingCount: 15400,
    screenshots: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    ],
    size: "245.0 MB",
    tagline: "Restore a wonderful garden to its former glory!",
    version: "6.2.0",
  },
  {
    ageRating: "12+ Violence, In-Game Purchases",
    badges: ["RPG", "Strategy"],
    category: "Games",
    changelog: "v7.10.1: Added 4 Mythic Champions and expanded Clan Boss rewards.",
    description:
      "RAID: Shadow Legends is a turn-based dark fantasy RPG. Collect hundreds of Champions from 14 playable factions, customize skill sets and masteries, defeat epic bosses, and climb the PvP arena rankings.",
    developer: "Plarium Global Ltd",
    downloadUrl: "",
    heroImage: "/System/Icons/48x48/quake3.png",
    iconUrl: "/System/Icons/48x48/quake3.png",
    id: "raid-shadow-legends",
    isFeaturedGrid: true,
    name: "RAID: Shadow Legends",
    price: 0,
    rating: 4.5,
    ratingCount: 22100,
    screenshots: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    ],
    size: "1.2 GB",
    tagline: "Battle your way through a visually-stunning realistic RPG!",
    version: "7.10.1",
  },
  {
    ageRating: "3+ In-Game Purchases",
    badges: ["Casual", "Simulation"],
    category: "Games",
    changelog: "v14.0.2: Opened the new French Bakery restaurant location!",
    description:
      "Cook delicious meals and desserts from all over the world in this free addictive time-management game! With a choice of unique locations from Desserts and Fast Food to Sea Food and Oriental Restaurants, practice your skills in a variety of settings and cooking techniques.",
    developer: "Nordcurrent",
    downloadUrl: "",
    heroImage: "/System/Icons/48x48/pinball.png",
    iconUrl: "/System/Icons/48x48/pinball.png",
    id: "cooking-fever",
    isFeaturedGrid: true,
    name: "Cooking Fever",
    price: 0,
    rating: 4.4,
    ratingCount: 8900,
    screenshots: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    ],
    size: "180.0 MB",
    tagline: "Cook delicious meals and desserts from all over the world!",
    version: "14.0.2",
  },
  {
    ageRating: "7+",
    badges: ["Owned", "Arcade"],
    category: "Games",
    description:
      "Drive high-performance cars and bikes in an arcade racing game. Take off from ramps into aerial stunt action with stunning 3D graphics.",
    developer: "Gameloft SE",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/dxball.png",
    id: "asphalt-8",
    isTrendingGame: true,
    name: "Asphalt 8: Airborne",
    price: 0,
    rating: 4.7,
    ratingCount: 18900,
    size: "1.8 GB",
    tagline: "Gravity-defying arcade racing experience!",
    version: "6.5.0",
  },
  {
    ageRating: "7+ Fantasy Violence",
    badges: ["Game Pass", "Free"],
    category: "Games",
    description:
      "The official launcher for Minecraft on Windows. Access Minecraft Java Edition, Bedrock Edition, Minecraft Dungeons and Legends from one central location.",
    developer: "Mojang Studios",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/classicube.png",
    id: "minecraft-launcher",
    isTrendingGame: true,
    name: "Minecraft Launcher",
    price: 0,
    rating: 4.9,
    ratingCount: 45200,
    size: "52.0 MB",
    tagline: "Create, explore and survive!",
    version: "1.2.5",
  },
  {
    ageRating: "3+",
    badges: ["Free"],
    category: "Games",
    description:
      "Drive into an action-packed, surprise-filled world of off-road kart racing mayhem. Race against a field of rival drivers with unique personalities and special abilities.",
    developer: "Vector Unit",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/pinball.png",
    id: "beach-buggy-racing",
    isTrendingGame: true,
    name: "Beach Buggy Racing",
    price: 0,
    rating: 4.5,
    ratingCount: 6700,
    size: "115.0 MB",
    tagline: "Off-road kart racing mayhem!",
    version: "2.1.0",
  },
  {
    ageRating: "7+",
    badges: ["Free"],
    category: "Games",
    description:
      "Experience thrilling high-speed city racing with customizable sports cars, real physics, nitro boosts, and global multiplayer leaderboards.",
    developer: "3D Wild Games",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/quake3.png",
    id: "city-racing-2",
    isTrendingGame: true,
    name: "City Racing 2",
    price: 0,
    rating: 4.3,
    ratingCount: 3200,
    size: "340.0 MB",
    tagline: "Real 3D Street Racing!",
    version: "1.0.8",
  },
  {
    ageRating: "12+",
    badges: ["Owned"],
    category: "Social",
    description:
      "WhatsApp from Meta is a messaging app available worldwide. Send text messages, voice notes, photos, videos, and make end-to-end encrypted audio and video calls on Windows.",
    developer: "Meta Inc.",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/messenger.png",
    id: "whatsapp",
    isTrendingApp: true,
    name: "WhatsApp",
    price: 0,
    rating: 4.6,
    ratingCount: 67400,
    size: "145.0 MB",
    tagline: "Simple. Reliable. Private.",
    version: "2.2410.5",
  },
  {
    ageRating: "12+",
    badges: ["Owned"],
    category: "Media",
    description:
      "Play millions of songs, playlists, and podcasts for free. Stream your favorite music, discover new tracks, and create personal playlists on your desktop.",
    developer: "Spotify AB",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/webamp.png",
    id: "spotify",
    isTrendingApp: true,
    name: "Spotify - Music and Podcasts",
    price: 0,
    rating: 4.7,
    ratingCount: 88100,
    size: "110.0 MB",
    tagline: "Music for everyone.",
    version: "1.2.32",
  },
  {
    ageRating: "12+",
    badges: ["Free"],
    category: "Social",
    description:
      "Get early access to new messaging features, multi-device speed improvements, and updated dark theme customization before public release.",
    developer: "Meta Inc.",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/messenger.png",
    id: "whatsapp-beta",
    isTrendingApp: true,
    name: "WhatsApp Beta",
    price: 0,
    rating: 4.4,
    ratingCount: 12000,
    size: "148.0 MB",
    tagline: "Preview upcoming WhatsApp desktop features.",
    version: "2.2412.1-beta",
  },
  {
    ageRating: "12+",
    badges: ["Free"],
    category: "Media",
    description:
      "Stream award-winning Netflix originals, movies, documentaries, and anime with offline downloads, 4K HDR support, and spatial audio on Windows.",
    developer: "Netflix, Inc.",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/vlc.png",
    id: "netflix",
    isTrendingApp: true,
    name: "Netflix",
    price: 0,
    rating: 4.5,
    ratingCount: 54000,
    size: "65.0 MB",
    tagline: "Watch TV shows & movies anytime, anywhere.",
    version: "6.98.1804",
  },
  {
    ageRating: "12+",
    badges: ["Owned"],
    category: "Social",
    description:
      "Discover short videos, live streams, trending sounds, and creative filter effects directly on your desktop.",
    developer: "TikTok Pte. Ltd.",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/photos.png",
    id: "tiktok",
    isDiscoverMore: true,
    name: "TikTok",
    price: 0,
    rating: 4.6,
    ratingCount: 92000,
    size: "190.0 MB",
    tagline: "Make Your Day — short-form mobile & desktop video.",
    version: "1.0.0",
  },
  {
    ageRating: "3+",
    badges: ["Free", "AI features"],
    category: "Media",
    description:
      "Edit videos faster with AI portrait cutouts, smart audio stretch, auto reframe, motion tracking, and thousands of templates.",
    developer: "Wondershare Technology",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/photo-mods.svg",
    id: "wondershare-filmora",
    isDiscoverMore: true,
    name: "Wondershare Filmora - AI Video Editor",
    price: 0,
    rating: 4.6,
    ratingCount: 14200,
    size: "510.0 MB",
    tagline: "Powerful AI video creation made easy.",
    version: "13.2.0",
  },
  {
    ageRating: "3+",
    badges: ["Free", "Open Source"],
    category: "Utilities",
    description:
      "High performance real-time video/audio capturing and mixing. Create scenes made up of multiple sources including window captures, images, text, browser windows, webcams, and capture cards.",
    developer: "OBS Project",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/vlc.png",
    id: "obs-studio",
    isDiscoverMore: true,
    name: "OBS Studio",
    price: 0,
    rating: 4.9,
    ratingCount: 31000,
    size: "128.0 MB",
    tagline: "Free and open source software for video recording and live streaming.",
    version: "30.1.2",
  },
  {
    ageRating: "3+",
    badges: ["Pyhdra OS Native"],
    category: "Media",
    description:
      "A lightweight pixel art editor with layers, palette management, and PNG export. Perfect for retro game sprites and icons.",
    developer: "Pyhdra Labs",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/paint.png",
    id: "pixel-painter",
    name: "Pixel Painter",
    price: 0,
    rating: 4.7,
    ratingCount: 412,
    size: "12.0 MB",
    tagline: "Lightweight pixel art editor.",
    version: "1.2.0",
  },
  {
    ageRating: "3+",
    badges: ["Paid"],
    category: "Games",
    description:
      "Test your programming knowledge across 15 languages. Timed challenges, leaderboards, and daily puzzles.",
    developer: "DevMinds",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/python.png",
    id: "code-quiz",
    name: "Code Quiz",
    price: 50,
    rating: 4.5,
    ratingCount: 180,
    size: "25.0 MB",
    tagline: "Test your programming knowledge.",
    version: "2.0.1",
  },
  {
    ageRating: "3+",
    badges: ["Free"],
    category: "Productivity",
    description:
      "A fast, distraction-free note-taking app with markdown support, tags, and instant search.",
    developer: "Pyhdra Labs",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/marked.png",
    id: "quick-notes",
    name: "Quick Notes",
    price: 0,
    rating: 4.8,
    ratingCount: 620,
    size: "15.0 MB",
    tagline: "Fast distraction-free note taking.",
    version: "3.1.0",
  },
  {
    ageRating: "3+",
    badges: ["Security"],
    category: "Utilities",
    description:
      "Securely delete files with multi-pass overwriting. Supports DoD 5220.22-M and Gutmann methods.",
    developer: "SecureSoft",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/executable.png",
    id: "file-shredder",
    name: "File Shredder",
    price: 75,
    rating: 4.3,
    ratingCount: 95,
    size: "8.5 MB",
    tagline: "Securely delete files with multi-pass overwriting.",
    version: "1.0.4",
  },
  {
    ageRating: "12+",
    badges: ["Free"],
    category: "Social",
    description:
      "All-in-one messaging client supporting IRC, XMPP, and Matrix protocols in a single unified interface.",
    developer: "Socialize Inc.",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/kiwiirc.png",
    id: "chat-hub",
    name: "Chat Hub",
    price: 0,
    rating: 4.4,
    ratingCount: 310,
    size: "45.0 MB",
    tagline: "All-in-one messaging client.",
    version: "0.9.8",
  },
  {
    ageRating: "3+",
    badges: ["Paid", "Pro Audio"],
    category: "Media",
    description:
      "A compact DAW with 8-track sequencing, built-in synthesizer, and WAV/MP3 export. Includes 200 royalty-free samples.",
    developer: "BeatWorks",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/audio.png",
    id: "music-studio",
    name: "Music Studio",
    price: 200,
    rating: 4.9,
    ratingCount: 540,
    size: "310.0 MB",
    tagline: "Compact DAW with 8-track sequencing.",
    version: "4.2.0",
  },
  {
    ageRating: "3+",
    badges: ["Paid"],
    category: "Productivity",
    description:
      "Kanban-style task manager with drag-and-drop boards, recurring tasks, and progress analytics.",
    developer: "Pyhdra Labs",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/documents.png",
    id: "task-flow",
    name: "Task Flow",
    price: 100,
    rating: 4.6,
    ratingCount: 230,
    size: "28.0 MB",
    tagline: "Kanban-style task manager.",
    version: "1.5.2",
  },
  {
    ageRating: "3+",
    badges: ["Developer Tool"],
    category: "Development",
    description:
      "Professional hex editor with checksum tools, pattern coloring, and binary templates for common file formats.",
    developer: "BitForge",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/monaco.png",
    id: "hex-editor",
    name: "Hex Editor Pro",
    price: 150,
    rating: 4.8,
    ratingCount: 410,
    size: "18.0 MB",
    tagline: "Professional hex editor.",
    version: "2.3.1",
  },
  {
    ageRating: "3+",
    badges: ["Free"],
    category: "Utilities",
    description:
      "Real-time system resource monitoring with CPU, memory, and disk usage graphs. Customizable alerts.",
    developer: "Pyhdra Labs",
    downloadUrl: "",
    iconUrl: "/System/Icons/48x48/pc.png",
    id: "system-monitor",
    name: "System Monitor",
    price: 0,
    rating: 4.7,
    ratingCount: 890,
    size: "14.0 MB",
    tagline: "Real-time system resource monitoring.",
    version: "1.3.0",
  },
];

export const mockUser: AppStoreUser = {
  purchasedAppIds: ["whatsapp", "spotify", "asphalt-8", "tiktok"],
  username: "Guest User",
  walletBalance: 1000,
};
