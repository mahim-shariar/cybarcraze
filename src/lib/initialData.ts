import {
  DeviceCategory,
  Device,
  Booking,
  ActiveSession,
  Addon,
  Customer,
  PromoCode,
  PricingRule,
  OpeningHourDay,
  MaintenanceBlock,
  ActivityLog,
  CafeSettings
} from '../types';

export const initialCategories: DeviceCategory[] = [
  {
    id: 'cat-ps5',
    name: 'PlayStation 5',
    slug: 'playstation-5',
    description: 'Sony PS5 stations with 65" 4K 120Hz OLED displays, DualSense wireless controllers, and all games included free.',
    icon: 'Gamepad2',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    displayOrder: 1,
    active: true
  },
  {
    id: 'cat-pc',
    name: 'PC Gaming',
    slug: 'pc-gaming',
    description: 'High-FPS competitive rigs with RTX 4080/4070Ti GPUs, 240Hz displays, and esports mechanical gear.',
    icon: 'Monitor',
    image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
    displayOrder: 2,
    active: false
  },
  {
    id: 'cat-racing',
    name: 'Racing Simulator',
    slug: 'racing-simulator',
    description: 'Ultra-realistic cockpits with Fanatec direct-drive steering, load-cell pedals, and immersive curved displays.',
    icon: 'Gauge',
    image: '/src/assets/images/racing_simulator_rig_1790420141279.jpg',
    displayOrder: 3,
    active: false
  },
  {
    id: 'cat-xbox',
    name: 'Xbox Series X',
    slug: 'xbox-series-x',
    description: 'Xbox Series X with full Game Pass Ultimate library, Dolby Atmos headsets, and Elite series controllers.',
    icon: 'Boxes',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    displayOrder: 4,
    active: false
  },
  {
    id: 'cat-vr',
    name: 'VR Arena',
    slug: 'vr-arena',
    description: '6DoF high-fidelity Virtual Reality station with PCVR graphics, tracking sensors, and haptic feedback.',
    icon: 'Glasses',
    image: '/src/assets/images/hero_esports_lounge_1790420114656.jpg',
    displayOrder: 5,
    active: false
  },
  {
    id: 'cat-vip',
    name: 'VIP Gaming Lounge',
    slug: 'vip-gaming-lounge',
    description: 'Private soundproof luxury room with PS5, high-end PC, 85" 4K theater, plush recliners, and private service.',
    icon: 'Crown',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    displayOrder: 6,
    active: false
  }
];

export const initialDevices: Device[] = [
  {
    id: 'dev-pc-01',
    name: 'Titan-X Battle Station 01',
    code: 'PC-01',
    categoryId: 'cat-pc',
    description: 'Pro esports tournament setup. RTX 4080 16GB, Core i9-14900K, 32GB DDR5, 240Hz 0.03ms OLED.',
    hourlyPrice: 100,
    peakHourPrice: 120,
    weekendPrice: 120,
    memberPrice: 85,
    minCapacity: 1,
    maxCapacity: 1,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Alpha Battle Arena',
    specifications: {
      'GPU': 'NVIDIA GeForce RTX 4080 16GB',
      'CPU': 'Intel Core i9-14900K Liquid Cooled',
      'RAM': '32GB DDR5 6000MHz RGB',
      'Display': '27" OLED 240Hz 1440p (0.03ms)',
      'Keyboard': 'Wooting 60HE Hall-effect Rapid Trigger',
      'Mouse': 'Logitech G Pro X Superlight 2',
      'Headset': 'HyperX Cloud III Wireless DTS:X'
    },
    controllers: 0,
    accessories: ['Esports Mousepad', 'Headphone Stand', 'Webcam'],
    display: '27" OLED 240Hz',
    image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
    active: false
  },
  {
    id: 'dev-pc-02',
    name: 'Titan-X Battle Station 02',
    code: 'PC-02',
    categoryId: 'cat-pc',
    description: 'Pro esports tournament setup with lightning response time and tuned high-fidelity audio.',
    hourlyPrice: 100,
    peakHourPrice: 120,
    weekendPrice: 120,
    memberPrice: 85,
    minCapacity: 1,
    maxCapacity: 1,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Alpha Battle Arena',
    specifications: {
      'GPU': 'NVIDIA GeForce RTX 4080 16GB',
      'CPU': 'Intel Core i9-14900K Liquid Cooled',
      'RAM': '32GB DDR5 6000MHz',
      'Display': '27" OLED 240Hz 1440p',
      'Keyboard': 'Razer Huntsman V3 Pro',
      'Mouse': 'Razer Viper V3 Pro',
      'Headset': 'SteelSeries Arctis Nova Pro'
    },
    controllers: 0,
    accessories: ['Esports Mousepad', 'Headset Stand'],
    display: '27" OLED 240Hz',
    image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
    active: false
  },
  {
    id: 'dev-pc-03',
    name: 'Viper-Elite Station 03',
    code: 'PC-03',
    categoryId: 'cat-pc',
    description: 'High-performance competitive PC with RTX 4070Ti Super, AMD Ryzen 7 7800X3D, and 240Hz display.',
    hourlyPrice: 100,
    peakHourPrice: 120,
    weekendPrice: 120,
    memberPrice: 85,
    minCapacity: 1,
    maxCapacity: 1,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Alpha Battle Arena',
    specifications: {
      'GPU': 'RTX 4070Ti Super 16GB',
      'CPU': 'AMD Ryzen 7 7800X3D',
      'RAM': '32GB DDR5',
      'Display': '25" 240Hz Fast-IPS BenQ ZOWIE',
      'Keyboard': 'Corsair K70 RGB Pro',
      'Mouse': 'Logitech G502X',
      'Headset': 'HyperX Cloud Alpha'
    },
    controllers: 0,
    accessories: ['Zowie XL Mousepad', 'Bungee'],
    display: '25" BenQ 240Hz',
    image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
    active: false
  },
  {
    id: 'dev-pc-04',
    name: 'Viper-Elite Station 04',
    code: 'PC-04',
    categoryId: 'cat-pc',
    description: 'Ranked grinder battle rig optimized for Valorant, CS2, Apex Legends, and Warzone.',
    hourlyPrice: 100,
    peakHourPrice: 120,
    weekendPrice: 120,
    memberPrice: 85,
    minCapacity: 1,
    maxCapacity: 1,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Alpha Battle Arena',
    specifications: {
      'GPU': 'RTX 4070Ti Super 16GB',
      'CPU': 'AMD Ryzen 7 7800X3D',
      'RAM': '32GB DDR5',
      'Display': '25" 240Hz Fast-IPS',
      'Keyboard': 'SteelSeries Apex Pro TKL',
      'Mouse': 'Logitech G Pro X Superlight',
      'Headset': 'HyperX Cloud III'
    },
    controllers: 0,
    accessories: ['Large Deskpad'],
    display: '25" 240Hz Fast-IPS',
    image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
    active: false
  },
  {
    id: 'dev-race-01',
    name: 'Apex Motion Sim 01',
    code: 'RACE-01',
    categoryId: 'cat-racing',
    description: 'Direct-Drive Force Feedback cockpit with hydraulic load-cell pedals, Sparco racing seat, and 49" curved ultra-wide.',
    hourlyPrice: 250,
    peakHourPrice: 300,
    weekendPrice: 300,
    memberPrice: 200,
    minCapacity: 1,
    maxCapacity: 2,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Apex Velocity Bay',
    specifications: {
      'Wheel Base': 'Fanatec ClubSport DD+ (15Nm Direct Drive)',
      'Steering Wheel': 'Fanatec Formula V2.5 + GT3 Alcantara Rim',
      'Pedals': 'Heusinkveld Sprint Load-Cell (Hydraulic feel)',
      'Chassis': 'Sim-Lab P1X Pro Anodized Aluminum Profile',
      'Seat': 'Sparco Circuit II FIA-approved Racing Bucket',
      'Display': 'Samsung Odyssey Neo G9 49" 240Hz Dual-QHD 1000R',
      'Audio': '5.1 Surround Haptic Sound Transducer'
    },
    controllers: 1,
    accessories: ['Sim Racing Gloves', 'Sequential Shifter & Handbrake'],
    display: '49" Samsung Odyssey 240Hz 32:9',
    image: '/src/assets/images/racing_simulator_rig_1790420141279.jpg',
    active: false
  },
  {
    id: 'dev-race-02',
    name: 'Apex Motion Sim 02',
    code: 'RACE-02',
    categoryId: 'cat-racing',
    description: 'Triple-monitor GT & F1 simulator rig equipped with realistic force feedback and haptic bass shaker seat.',
    hourlyPrice: 250,
    peakHourPrice: 300,
    weekendPrice: 300,
    memberPrice: 200,
    minCapacity: 1,
    maxCapacity: 2,
    status: 'MAINTENANCE',
    condition: 'Maintenance',
    zone: 'Apex Velocity Bay',
    specifications: {
      'Wheel Base': 'Moza R12 Direct Drive (12Nm)',
      'Pedals': 'Moza CRP Load Cell Pedals',
      'Chassis': 'Next Level Racing Elite Cockpit',
      'Display': 'Triple 32" Curved 165Hz Monitors (surround FOV)',
      'Shifter': 'H-Pattern + Sequential dual-mode'
    },
    controllers: 1,
    accessories: ['Racing Gloves', 'Shifter'],
    display: 'Triple 32" Surround (165Hz)',
    image: '/src/assets/images/racing_simulator_rig_1790420141279.jpg',
    active: false
  },
  {
    id: 'dev-ps5-01',
    name: 'PlayStation 5 Station 01',
    code: 'PS5-01',
    categoryId: 'cat-ps5',
    description: 'Sony PS5 station with 65" 4K OLED 120Hz display, dual haptic DualSense controllers, and full game library free.',
    hourlyPrice: 120,
    peakHourPrice: 150,
    weekendPrice: 150,
    memberPrice: 100,
    minCapacity: 1,
    maxCapacity: 4,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Console Lounge A',
    specifications: {
      'Console': 'PlayStation 5 Slim 1TB SSD',
      'Display': '65" LG C3 OLED 4K 120Hz VRR',
      'Controllers': '2x DualSense Wireless Controllers',
      'Audio': 'Sony Pulse 3D Audio Headset + Soundbar',
      'Game Access': 'All Games Included Free (FC 25, Tekken 8, Mortal Kombat 1, Spider-Man 2, GTA V, God of War - Switch anytime!)'
    },
    controllers: 2,
    accessories: ['Charging Dock', 'PlayStation Plus Deluxe Subscription'],
    display: '65" LG OLED 4K 120Hz',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    active: true
  },
  {
    id: 'dev-ps5-02',
    name: 'PlayStation 5 Station 02',
    code: 'PS5-02',
    categoryId: 'cat-ps5',
    description: 'Sony PS5 station with 65" 4K OLED 120Hz display, tournament couch setup, and full game library free.',
    hourlyPrice: 120,
    peakHourPrice: 150,
    weekendPrice: 150,
    memberPrice: 100,
    minCapacity: 1,
    maxCapacity: 4,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Console Lounge B',
    specifications: {
      'Console': 'PlayStation 5 1TB SSD',
      'Display': '65" LG C3 OLED 4K 120Hz',
      'Controllers': '2x DualSense Controllers',
      'Audio': 'JBL Bar 5.1 Surround',
      'Game Access': 'All Games Included Free (FC 25, WWE 2K24, NBA 2K25, Gran Turismo 7, Call of Duty - Switch anytime!)'
    },
    controllers: 2,
    accessories: ['Charging Stand'],
    display: '65" LG OLED 4K 120Hz',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    active: true
  },
  {
    id: 'dev-ps5-03',
    name: 'PlayStation 5 Squad 03',
    code: 'PS5-03',
    categoryId: 'cat-ps5',
    description: '4-Player couch co-op station configured with 4 DualSense controllers for FIFA/FC25 and fighting tournaments.',
    hourlyPrice: 140,
    peakHourPrice: 170,
    weekendPrice: 170,
    memberPrice: 120,
    minCapacity: 1,
    maxCapacity: 4,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Console Lounge B',
    specifications: {
      'Console': 'PS5 Digital + Disc Edition',
      'Display': '55" Sony Bravia XR 4K 120Hz',
      'Controllers': '4x DualSense Wireless Controllers included',
      'Audio': 'Dolby Atmos Soundbar'
    },
    controllers: 4,
    accessories: ['4-Way Charging Station'],
    display: '55" Sony Bravia 120Hz',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    active: false
  },
  {
    id: 'dev-xbox-01',
    name: 'Xbox Series X Ultimate 01',
    code: 'XBOX-01',
    categoryId: 'cat-xbox',
    description: 'Microsoft Xbox Series X with 12 Teraflops GPU and over 400 titles via Xbox Game Pass Ultimate.',
    hourlyPrice: 130,
    peakHourPrice: 150,
    weekendPrice: 150,
    memberPrice: 110,
    minCapacity: 1,
    maxCapacity: 4,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Console Lounge B',
    specifications: {
      'Console': 'Xbox Series X 1TB NVMe',
      'Display': '55" Hisense U7K Mini-LED 144Hz 4K',
      'Controllers': '2x Xbox Wireless Elite Series 2 Core',
      'Library': 'Forza Horizon 5, Halo Infinite, Starfield, Gears 5'
    },
    controllers: 2,
    accessories: ['Elite Thumbstick Kit'],
    display: '55" Mini-LED 144Hz',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    active: false
  },
  {
    id: 'dev-vr-01',
    name: 'CyberVR Arena 01',
    code: 'VR-01',
    categoryId: 'cat-vr',
    description: 'Immersive VR arena with Meta Quest 3, high-bandwidth WiFi 6E wireless PCVR link, and bHaptics tactile vest.',
    hourlyPrice: 220,
    peakHourPrice: 260,
    weekendPrice: 260,
    memberPrice: 180,
    minCapacity: 1,
    maxCapacity: 2,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'CyberVR Hologrid',
    specifications: {
      'Headset': 'Meta Quest 3 (4K+ Infinite Display)',
      'PCVR Rig': 'RTX 4080 PC for ultra-detailed PCVR graphics',
      'Haptics': 'bHaptics TactSuit X40 Wireless Vest',
      'Sensors': 'Ceiling cable suspension & guardian boundary'
    },
    controllers: 2,
    accessories: ['bHaptics Vest', 'Silicone Sweat Guards', 'Wrist Straps'],
    display: '4K+ High-Resolution Pancake Lenses',
    image: '/src/assets/images/hero_esports_lounge_1790420114656.jpg',
    active: false
  },
  {
    id: 'dev-vip-01',
    name: 'CyberVault VIP Suite 01',
    code: 'VIP-01',
    categoryId: 'cat-vip',
    description: 'Ultra-exclusive private room for squads. Features PS5, RTX 4090 Dual Rig, 85" 4K theater, and snack bar.',
    hourlyPrice: 350,
    peakHourPrice: 420,
    weekendPrice: 420,
    memberPrice: 300,
    minCapacity: 1,
    maxCapacity: 8,
    status: 'AVAILABLE',
    condition: 'Working',
    zone: 'Private CyberVault',
    specifications: {
      'Private Suite': 'Acoustic Soundproof Private Studio',
      'Gaming Gear': '1x PS5 Console + 1x RTX 4090 Custom Rig',
      'Display': '85" Sony 4K 120Hz Cinema Display + Dual 27" OLEDs',
      'Amenities': 'Plush Leather Recliners, Ambient Cyber Lighting, Mini-Fridge'
    },
    controllers: 4,
    accessories: ['Dedicated Staff Call Button', 'Snack Bar Access'],
    display: '85" 4K 120Hz Cinema Screen',
    image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
    active: false
  }
];

export const initialAddons: Addon[] = [];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-01',
    phone: '01712345678',
    name: 'Tanvir Ahmed',
    email: 'tanvir@gmail.com',
    totalBookings: 8,
    totalSpent: 1680,
    cancelledCount: 0,
    noShowCount: 0,
    lastVisit: '2026-09-24',
    isMember: true,
    membershipTier: 'CYBER_ELITE',
    notes: 'Regular Valorant and PC-01 player. Prefers 240Hz.'
  },
  {
    id: 'cust-02',
    phone: '01898765432',
    name: 'Fahim Hasan',
    email: 'fahim.h@yahoo.com',
    totalBookings: 14,
    totalSpent: 3950,
    cancelledCount: 1,
    noShowCount: 0,
    lastVisit: '2026-09-25',
    isMember: true,
    membershipTier: 'RACING_CLUB',
    notes: 'F1 enthusiast, frequents RACE-01.'
  },
  {
    id: 'cust-03',
    phone: '01911223344',
    name: 'Mahim Rahman',
    email: 'mahim@cybercraze.com',
    totalBookings: 22,
    totalSpent: 6400,
    cancelledCount: 0,
    noShowCount: 0,
    lastVisit: '2026-09-26',
    isMember: true,
    membershipTier: 'VIP_BLACK',
    notes: 'Tournament organizer & VIP guest.'
  }
];

export const initialBookings: Booking[] = [
  {
    id: 'CC-2026-000121',
    accessCode: '748291',
    customerId: 'cust-01',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01712345678',
    customerEmail: 'tanvir@gmail.com',
    deviceId: 'dev-pc-02',
    deviceName: 'Titan-X Battle Station 02',
    deviceCode: 'PC-02',
    categoryId: 'cat-pc',
    categoryName: 'PC Gaming',
    date: '2026-09-26',
    startTime: '10:00',
    endTime: '12:00',
    durationMinutes: 120,
    playersCount: 1,
    hourlyRate: 100,
    subtotal: 200,
    addons: [
      { addonId: 'add-monster', name: 'Monster Energy Drink (350ml)', price: 180, quantity: 1 }
    ],
    addonsTotal: 180,
    discount: 0,
    deposit: 100,
    remainingAmount: 280,
    totalAmount: 380,
    paymentStatus: 'DEPOSIT_PAID',
    paymentMethod: 'BKASH',
    status: 'ACTIVE',
    notes: 'Ranked queue grind',
    createdAt: '2026-09-25T14:30:00Z',
    updatedAt: '2026-09-26T10:00:00Z',
    qrCodeData: 'CC-2026-000121:748291:01712345678'
  },
  {
    id: 'CC-2026-000122',
    accessCode: '395182',
    customerId: 'cust-02',
    customerName: 'Fahim Hasan',
    customerPhone: '01898765432',
    customerEmail: 'fahim.h@yahoo.com',
    deviceId: 'dev-ps5-02',
    deviceName: 'PlayStation 5 Arena 02',
    deviceCode: 'PS5-02',
    categoryId: 'cat-ps5',
    categoryName: 'PlayStation 5',
    date: '2026-09-26',
    startTime: '19:00',
    endTime: '21:00',
    durationMinutes: 120,
    playersCount: 2,
    hourlyRate: 120,
    subtotal: 240,
    addons: [
      { addonId: 'add-controller', name: 'Extra DualSense / Xbox Controller', price: 50, quantity: 1 }
    ],
    addonsTotal: 50,
    discount: 0,
    deposit: 100,
    remainingAmount: 190,
    totalAmount: 290,
    paymentStatus: 'PAID',
    paymentMethod: 'BKASH',
    status: 'CONFIRMED',
    notes: 'FC 25 Champions tournament matchup',
    createdAt: '2026-09-25T18:20:00Z',
    updatedAt: '2026-09-25T18:25:00Z',
    qrCodeData: 'CC-2026-000122:395182:01898765432'
  }
];

export const initialActiveSessions: ActiveSession[] = [
  {
    id: 'sess-01',
    bookingId: 'CC-2026-000121',
    deviceId: 'dev-pc-02',
    deviceCode: 'PC-02',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01712345678',
    startedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    scheduledEnd: new Date(Date.now() + 85 * 60 * 1000).toISOString(),
    extendedMinutes: 0,
    status: 'ACTIVE',
    totalCharged: 380
  }
];

export const initialPromoCodes: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'CYBER10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minSpend: 200,
    usageCount: 42,
    usageLimit: 500,
    active: true
  },
  {
    id: 'promo-2',
    code: 'LANPARTY',
    discountType: 'FIXED',
    discountValue: 50,
    minSpend: 300,
    usageCount: 18,
    usageLimit: 200,
    active: true
  },
  {
    id: 'promo-3',
    code: 'SPEEDDEMON',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minSpend: 250,
    applicableCategory: 'cat-racing',
    usageCount: 9,
    usageLimit: 100,
    active: true
  }
];

export const initialPricingRules: PricingRule[] = [
  {
    id: 'rule-peak',
    name: 'Evening Prime Peak Hours',
    type: 'PEAK',
    rateMultiplier: 1.2,
    startHour: 18, // 6:00 PM
    endHour: 22,   // 10:00 PM
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    priority: 10,
    active: true
  },
  {
    id: 'rule-weekend',
    name: 'Friday & Saturday Weekend Surge',
    type: 'WEEKEND',
    rateMultiplier: 1.2,
    daysOfWeek: [5, 6], // Friday, Saturday
    priority: 5,
    active: true
  }
];

export const initialOpeningHours: OpeningHourDay[] = [
  { day: 'Saturday', dayIndex: 6, open: '10:00', close: '23:00', isOpen: true },
  { day: 'Sunday', dayIndex: 0, open: '10:00', close: '23:00', isOpen: true },
  { day: 'Monday', dayIndex: 1, open: '10:00', close: '23:00', isOpen: true },
  { day: 'Tuesday', dayIndex: 2, open: '10:00', close: '23:00', isOpen: true },
  { day: 'Wednesday', dayIndex: 3, open: '10:00', close: '23:00', isOpen: true },
  { day: 'Thursday', dayIndex: 4, open: '10:00', close: '23:00', isOpen: true },
  { day: 'Friday', dayIndex: 5, open: '14:00', close: '23:30', isOpen: true } // Friday post-Jummah
];

export const initialMaintenanceBlocks: MaintenanceBlock[] = [
  {
    id: 'maint-01',
    deviceId: 'dev-race-02',
    deviceCode: 'RACE-02',
    date: '2026-09-26',
    startTime: '14:00',
    endTime: '18:00',
    reason: 'Pedal hydraulic oil replacement and wheel firmware calibration'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-01',
    actor: 'SuperAdmin (Mahim)',
    role: 'SUPER_ADMIN',
    action: 'DEVICE_PRICING_UPDATED',
    target: 'RACE-01',
    timestamp: '2026-09-25T11:20:00Z',
    details: 'Adjusted base hourly price from ৳220 to ৳250/hour'
  },
  {
    id: 'log-02',
    actor: 'Staff (Nabil)',
    role: 'STAFF',
    action: 'CHECK_IN_COMPLETED',
    target: 'CC-2026-000121',
    timestamp: '2026-09-26T10:00:15Z',
    details: 'Customer Tanvir checked in for PC-02 session'
  },
  {
    id: 'log-03',
    actor: 'Manager (Rafid)',
    role: 'MANAGER',
    action: 'MAINTENANCE_SCHEDULED',
    target: 'RACE-02',
    timestamp: '2026-09-26T09:00:00Z',
    details: 'Scheduled hydraulic calibration 14:00-18:00'
  }
];

export const defaultSettings: CafeSettings = {
  businessName: 'CyberCraze – HQ Gaming Space',
  brandTagline: 'YOUR GAME. YOUR SPACE. YOUR TIME.',
  address: 'Akua Hazibari – Shadar, Mymensingh, Bangladesh',
  locationShort: 'Mymensingh, Bangladesh',
  phone: '+880 1712-345678',
  whatsapp: '+880 1712-345678',
  email: 'hq@cybercraze.gg',
  facebookUrl: 'https://facebook.com/cybercraze.hq',
  instagramUrl: 'https://instagram.com/cybercraze.hq',
  currency: 'BDT',
  currencySymbol: '৳',
  timezone: 'Asia/Dhaka',
  advanceBookingDays: 14,
  minAdvanceNoticeMinutes: 15,
  cancellationNoticeHours: 1,
  depositType: 'FIXED',
  depositValue: 100, // ৳100 deposit standard
  otpEnabled: false,
  allowedDurations: [60, 120, 180, 240, 300, 360]
};
