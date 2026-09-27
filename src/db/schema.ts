import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users / Staff table (Cloud SQL stored staff & managers)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Unique account identifier
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  displayName: text('display_name'),
  phone: text('phone'),
  role: text('role').default('STAFF'), // SUPER_ADMIN, MANAGER, STAFF
  createdAt: timestamp('created_at').defaultNow(),
});

// Gaming Fleet Devices
export const devices = pgTable('devices', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  categoryId: text('category_id').notNull(),
  description: text('description'),
  hourlyPrice: integer('hourly_price').notNull().default(120),
  peakHourPrice: integer('peak_hour_price').default(150),
  display: text('display').default('65" 4K 120Hz OLED'),
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, OCCUPIED, MAINTENANCE, BLOCKED
  zone: text('zone').default('Console Lounge'),
  image: text('image'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bookings table
// Auto-deleted when booking date passes (date < current_date)
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  startTime: text('start_time').notNull(), // e.g. "14:00"
  endTime: text('end_time').notNull(), // e.g. "15:00"
  durationMinutes: integer('duration_minutes').notNull().default(60),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  playersCount: integer('players_count').default(1),
  totalAmount: integer('total_amount').notNull().default(120),
  deposit: integer('deposit').default(0),
  paymentMethod: text('payment_method').default('CASH'),
  paymentStatus: text('payment_status').default('PENDING'),
  status: text('status').notNull().default('CONFIRMED'), // CONFIRMED, ACTIVE, COMPLETED, CANCELLED, NO_SHOW
  accessCode: text('access_code').notNull(),
  qrCodeData: text('qr_code_data').notNull(),
  isVip: boolean('is_vip').default(false),
  vipPassId: text('vip_pass_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// VIP Membership Passes
// Phone number registered in backend; provides daily free hour and discount on bookings
export const vipPasses = pgTable('vip_passes', {
  id: text('id').primaryKey(),
  passCode: text('pass_code').notNull().unique(), // e.g. VIP-7890
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull().unique(), // Registered phone
  customerEmail: text('customer_email'),
  tier: text('tier').notNull().default('WEEKLY_1HR_DAILY'), // WEEKLY_1HR_DAILY, MONTHLY_1HR_DAILY
  startDate: text('start_date').notNull(), // YYYY-MM-DD
  expiryDate: text('expiry_date').notNull(), // YYYY-MM-DD
  dailyMinutesAllowance: integer('daily_minutes_allowance').default(60), // 1 hour free every day
  discountPercent: integer('discount_percent').default(20), // 20% off extra bookings
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, EXPIRED, PAUSED
  qrCodeData: text('qr_code_data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Track daily VIP 1-hour usage so they get 1 hour every day
export const vipDailyUsage = pgTable('vip_daily_usage', {
  id: serial('id').primaryKey(),
  vipPassId: text('vip_pass_id').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  minutesUsed: integer('minutes_used').default(60),
  bookingId: text('booking_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Active Counter Play Sessions with live timer & auto-expiration
// When QR is scanned, time starts ticking down; when 00:00 reached, status = EXPIRED
export const activeSessions = pgTable('active_sessions', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  bookingId: text('booking_id'),
  vipPassId: text('vip_pass_id'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  startTime: text('start_time').notNull(), // e.g. "14:00"
  endTime: text('end_time').notNull(), // e.g. "15:00"
  startedAt: timestamp('started_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, TIME_OVER, COMPLETED
  timeOverAlertAcknowledged: boolean('time_over_alert_acknowledged').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Cafe Tournaments (Esports essentials)
export const tournaments = pgTable('tournaments', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  game: text('game').notNull(), // e.g. "EA Sports FC 25", "Tekken 8"
  date: text('date').notNull(),
  time: text('time').notNull(),
  prizePool: text('prize_pool').notNull(),
  entryFee: integer('entry_fee').default(100),
  maxParticipants: integer('max_participants').default(16),
  registeredCount: integer('registered_count').default(0),
  status: text('status').default('UPCOMING'), // UPCOMING, LIVE, COMPLETED
  rules: text('rules'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Local Lounge Leaderboard & Rankings (FC 25 & Tekken 8 Champions)
export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  playerName: text('player_name').notNull(),
  game: text('game').notNull(),
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  rankTier: text('rank_tier').default('Master'),
  badge: text('badge').default('Top Scorer'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
