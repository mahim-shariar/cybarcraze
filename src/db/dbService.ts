import { db } from './index.ts';
import { 
  users,
  bookings, 
  devices, 
  vipPasses, 
  vipDailyUsage, 
  activeSessions, 
  tournaments, 
  leaderboard 
} from './schema.ts';
import { eq, lt, and, desc, sql } from 'drizzle-orm';

// Helper: Get today's date in YYYY-MM-DD
export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

// -------------------------------------------------------------
// 1. AUTO-DELETE EXPIRED BOOKINGS
// "after booking day pass the booking is automatically deleted if i will booking today after today this booking data automatically deleted"
// -------------------------------------------------------------
export async function cleanupExpiredBookings(): Promise<{ deletedCount: number }> {
  try {
    const today = getTodayDateStr();
    // Delete any booking where date is strictly before today's date
    const result = await db
      .delete(bookings)
      .where(lt(bookings.date, today))
      .returning({ id: bookings.id });

    if (result.length > 0) {
      console.log(`[Auto-Cleanup] Purged ${result.length} past-day bookings prior to ${today}`);
    }
    return { deletedCount: result.length };
  } catch (error) {
    console.error('Failed to cleanup expired bookings:', error);
    return { deletedCount: 0 };
  }
}

// -------------------------------------------------------------
// 2. BOOKINGS
// -------------------------------------------------------------
export async function getAllBookings() {
  try {
    // Automatically purge past bookings before returning
    await cleanupExpiredBookings();
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw new Error('Failed to fetch bookings', { cause: error });
  }
}

export async function createBooking(data: typeof bookings.$inferInsert) {
  try {
    // Automatically purge expired bookings
    await cleanupExpiredBookings();

    const inserted = await db.insert(bookings).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking', { cause: error });
  }
}

export async function getBookingById(id: string) {
  try {
    await cleanupExpiredBookings();
    const res = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!res[0]) return null;
    const today = getTodayDateStr();
    if (res[0].date < today) {
      await db.delete(bookings).where(eq(bookings.id, id));
      return null;
    }
    return res[0];
  } catch (error) {
    console.error('Error finding booking:', error);
    throw new Error('Failed to find booking', { cause: error });
  }
}

// -------------------------------------------------------------
// 3. VIP MEMBERSHIP PASSES
// -------------------------------------------------------------
export async function registerVipPass(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tier: 'WEEKLY_1HR_DAILY' | 'MONTHLY_1HR_DAILY';
}) {
  try {
    const id = `VIP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const passCode = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;

    const today = new Date();
    const startDate = today.toISOString().split('T')[0];

    const expiryDateObj = new Date(today);
    if (data.tier === 'WEEKLY_1HR_DAILY') {
      expiryDateObj.setDate(today.getDate() + 7);
    } else {
      expiryDateObj.setDate(today.getDate() + 30);
    }
    const expiryDate = expiryDateObj.toISOString().split('T')[0];

    const qrCodeData = JSON.stringify({
      type: 'CYBERCRAZE_VIP_PASS',
      id,
      passCode,
      name: data.customerName,
      phone: data.customerPhone,
      tier: data.tier,
      expires: expiryDate
    });

    const newPass: typeof vipPasses.$inferInsert = {
      id,
      passCode,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || '',
      tier: data.tier,
      startDate,
      expiryDate,
      dailyMinutesAllowance: 60, // 1 hour free every day
      discountPercent: data.tier === 'MONTHLY_1HR_DAILY' ? 25 : 20,
      status: 'ACTIVE',
      qrCodeData
    };

    // Upsert by phone number
    const inserted = await db
      .insert(vipPasses)
      .values(newPass)
      .onConflictDoUpdate({
        target: vipPasses.customerPhone,
        set: {
          customerName: data.customerName,
          tier: data.tier,
          startDate,
          expiryDate,
          status: 'ACTIVE',
          qrCodeData
        }
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Error registering VIP pass:', error);
    throw new Error('Failed to register VIP pass', { cause: error });
  }
}

export async function lookupVipPass(query: string) {
  try {
    let clean = query.trim();
    if (!clean) return null;

    // 1. If scanned as JSON QR payload
    if (clean.startsWith('{') && clean.includes('CYBERCRAZE_VIP_PASS')) {
      try {
        const parsed = JSON.parse(clean);
        clean = parsed.phone || parsed.customerPhone || parsed.passCode || parsed.id || clean;
      } catch (err) {}
    } else if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        clean = parsed.phone || parsed.customerPhone || parsed.passCode || parsed.id || clean;
      } catch (err) {}
    }

    // 2. If scanned as colon delimited string (e.g., "CC-2026-000125:482910:01712345678")
    if (clean.includes(':')) {
      const parts = clean.split(':');
      const phoneCandidate = parts.find(p => /^\+?[0-9]{9,15}$/.test(p.trim().replace(/[\s-]/g, '')));
      if (phoneCandidate) {
        clean = phoneCandidate.trim();
      }
    }

    const digitsOnly = clean.replace(/[\s-]/g, '');

    // Lookup by phone exact or digits
    const byPhone = await db.select().from(vipPasses).where(eq(vipPasses.customerPhone, clean));
    if (byPhone.length > 0) return byPhone[0];

    if (digitsOnly.length >= 9) {
      const byPhoneDigits = await db.select().from(vipPasses).where(eq(vipPasses.customerPhone, digitsOnly));
      if (byPhoneDigits.length > 0) return byPhoneDigits[0];
    }

    // Lookup by pass code
    const byCode = await db.select().from(vipPasses).where(eq(vipPasses.passCode, clean.toUpperCase()));
    if (byCode.length > 0) return byCode[0];

    // Lookup by id
    const byId = await db.select().from(vipPasses).where(eq(vipPasses.id, clean.toUpperCase()));
    if (byId.length > 0) return byId[0];

    return null;
  } catch (error) {
    console.error('Error looking up VIP pass:', error);
    throw new Error('Failed to lookup VIP pass', { cause: error });
  }
}

export async function checkVipDailyHourRemaining(vipPassId: string, date: string): Promise<boolean> {
  try {
    const used = await db
      .select()
      .from(vipDailyUsage)
      .where(and(eq(vipDailyUsage.vipPassId, vipPassId), eq(vipDailyUsage.date, date)));

    return used.length === 0; // True if daily free hour not yet consumed today
  } catch (error) {
    console.error('Error checking VIP daily usage:', error);
    return true;
  }
}

export async function recordVipDailyUsage(vipPassId: string, date: string, bookingId?: string) {
  try {
    return await db.insert(vipDailyUsage).values({
      vipPassId,
      date,
      minutesUsed: 60,
      bookingId: bookingId || null
    }).returning();
  } catch (error) {
    console.error('Error recording VIP daily usage:', error);
  }
}

export async function getAllVipPasses() {
  try {
    return await db.select().from(vipPasses).orderBy(desc(vipPasses.createdAt));
  } catch (error) {
    console.error('Error fetching VIP passes:', error);
    throw new Error('Failed to fetch VIP passes', { cause: error });
  }
}

// -------------------------------------------------------------
// 4. ACTIVE SESSIONS & LIVE COUNTDOWN TIMER
// "if any one booking after scaning the qr code time will started so they need to out if there time is finish"
// -------------------------------------------------------------
export async function startPlaySession(params: {
  deviceId: string;
  bookingId?: string;
  vipPassId?: string;
  customerName: string;
  customerPhone: string;
  durationMinutes: number;
}) {
  try {
    const id = `SES-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.durationMinutes * 60 * 1000);

    const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(expiresAt.getHours()).padStart(2, '0')}:${String(expiresAt.getMinutes()).padStart(2, '0')}`;

    // Insert active session
    const session = await db.insert(activeSessions).values({
      id,
      deviceId: params.deviceId,
      bookingId: params.bookingId || null,
      vipPassId: params.vipPassId || null,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      startTime,
      endTime,
      startedAt: now,
      expiresAt,
      durationMinutes: params.durationMinutes,
      status: 'ACTIVE',
      timeOverAlertAcknowledged: false
    }).returning();

    // Mark station as OCCUPIED
    await db
      .update(devices)
      .set({ status: 'OCCUPIED' })
      .where(eq(devices.id, params.deviceId));

    // If linked to booking, update booking status
    if (params.bookingId) {
      await db
        .update(bookings)
        .set({ status: 'ACTIVE' })
        .where(eq(bookings.id, params.bookingId));
    }

    return session[0];
  } catch (error) {
    console.error('Error starting play session:', error);
    throw new Error('Failed to start play session', { cause: error });
  }
}

export async function getActiveSessions() {
  try {
    const sessionsList = await db.select().from(activeSessions).orderBy(desc(activeSessions.startedAt));
    const now = new Date();

    // Check for expired sessions
    for (const s of sessionsList) {
      if (s.status === 'ACTIVE' && new Date(s.expiresAt) <= now) {
        // Mark as TIME_OVER
        await db
          .update(activeSessions)
          .set({ status: 'TIME_OVER' })
          .where(eq(activeSessions.id, s.id));
        s.status = 'TIME_OVER';
      }
    }

    return sessionsList;
  } catch (error) {
    console.error('Error getting active sessions:', error);
    throw new Error('Failed to get active sessions', { cause: error });
  }
}

export async function finishSession(sessionId: string, deviceId: string) {
  try {
    await db
      .update(activeSessions)
      .set({ status: 'COMPLETED' })
      .where(eq(activeSessions.id, sessionId));

    // Release device back to AVAILABLE
    await db
      .update(devices)
      .set({ status: 'AVAILABLE' })
      .where(eq(devices.id, deviceId));

    return { success: true };
  } catch (error) {
    console.error('Error finishing session:', error);
    throw new Error('Failed to finish session', { cause: error });
  }
}

// -------------------------------------------------------------
// 5. TOURNAMENTS & LEADERBOARD
// -------------------------------------------------------------
export async function getTournaments() {
  try {
    return await db.select().from(tournaments).orderBy(tournaments.date);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

export async function getLeaderboard() {
  try {
    return await db.select().from(leaderboard).orderBy(desc(leaderboard.wins));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function getDevicesList() {
  try {
    return await db.select().from(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
}

export async function deleteDeviceFromDb(id: string) {
  try {
    const deleted = await db.delete(devices).where(eq(devices.id, id)).returning();
    return { success: true, deleted: deleted[0] };
  } catch (error) {
    console.error('Error deleting device from Cloud SQL:', error);
    throw new Error('Failed to delete device', { cause: error });
  }
}

// -------------------------------------------------------------
// STAFF & USER MANAGEMENT (Cloud SQL)
// -------------------------------------------------------------
export async function getAllStaffUsers() {
  try {
    const list = await db.select({
      id: users.id,
      uid: users.uid,
      email: users.email,
      displayName: users.displayName,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
    return list;
  } catch (error) {
    console.error('Error fetching staff users:', error);
    return [];
  }
}

export async function createStaffUser(data: {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF';
}) {
  try {
    const uid = `usr-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const inserted = await db.insert(users).values({
      uid,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.password, // Plain text or hashed password for staff console authentication
      displayName: data.displayName.trim(),
      phone: data.phone?.trim() || null,
      role: data.role || 'STAFF',
    }).returning({
      id: users.id,
      uid: users.uid,
      email: users.email,
      displayName: users.displayName,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    });
    return inserted[0];
  } catch (error) {
    console.error('Error creating staff user:', error);
    throw new Error('Failed to create staff user', { cause: error });
  }
}

export async function authenticateStaffUser(email: string, pass: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (rows.length === 0) {
      return null;
    }
    const user = rows[0];
    if (user.passwordHash !== pass) {
      return null;
    }
    return {
      id: user.id,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Staff Member',
      phone: user.phone,
      role: user.role as 'SUPER_ADMIN' | 'MANAGER' | 'STAFF',
    };
  } catch (error) {
    console.error('Error authenticating staff:', error);
    return null;
  }
}

export async function deleteStaffUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw new Error('Failed to delete staff user');
  }
}

// -------------------------------------------------------------
// 6. SEED INITIAL DATA IF EMPTY
// -------------------------------------------------------------
export async function seedInitialDataIfEmpty() {
  try {
    const existingDevices = await db.select().from(devices).limit(1);
    if (existingDevices.length === 0) {
      console.log('[Seed] Populating initial devices into Cloud SQL...');
      await db.insert(devices).values([
        {
          id: 'dev-ps5-01',
          name: 'PlayStation 5 Station 01',
          code: 'PS5-01',
          categoryId: 'cat-ps5',
          description: 'Sony PS5 station with 65" 4K OLED 120Hz display, dual haptic DualSense controllers, and full game library free.',
          hourlyPrice: 120,
          peakHourPrice: 150,
          display: '65" LG OLED 4K 120Hz',
          status: 'AVAILABLE',
          zone: 'Console Lounge A',
          image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
          active: true,
        },
        {
          id: 'dev-ps5-02',
          name: 'PlayStation 5 Station 02',
          code: 'PS5-02',
          categoryId: 'cat-ps5',
          description: 'Sony PS5 station with 65" 4K OLED 120Hz display, tournament couch setup, and full game library free.',
          hourlyPrice: 120,
          peakHourPrice: 150,
          display: '65" LG OLED 4K 120Hz',
          status: 'AVAILABLE',
          zone: 'Console Lounge B',
          image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
          active: true,
        },
        {
          id: 'dev-ps5-03',
          name: 'PlayStation 5 Squad 03',
          code: 'PS5-03',
          categoryId: 'cat-ps5',
          description: '4-Player couch co-op station configured with 4 DualSense controllers for FIFA/FC25 and fighting tournaments.',
          hourlyPrice: 140,
          peakHourPrice: 170,
          display: '55" Sony Bravia 120Hz',
          status: 'AVAILABLE',
          zone: 'Console Lounge B',
          image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
          active: true,
        },
        {
          id: 'dev-pc-01',
          name: 'Titan-X Battle Station 01',
          code: 'PC-01',
          categoryId: 'cat-pc',
          description: 'Pro esports tournament setup. RTX 4080 16GB, Core i9-14900K, 32GB DDR5, 240Hz 0.03ms OLED.',
          hourlyPrice: 100,
          peakHourPrice: 120,
          display: '27" OLED 240Hz',
          status: 'AVAILABLE',
          zone: 'Alpha Battle Arena',
          image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
          active: true,
        },
        {
          id: 'dev-pc-02',
          name: 'Titan-X Battle Station 02',
          code: 'PC-02',
          categoryId: 'cat-pc',
          description: 'Pro esports tournament setup with lightning response time and tuned high-fidelity audio.',
          hourlyPrice: 100,
          peakHourPrice: 120,
          display: '27" OLED 240Hz',
          status: 'AVAILABLE',
          zone: 'Alpha Battle Arena',
          image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
          active: true,
        },
        {
          id: 'dev-race-01',
          name: 'Apex Motion Sim 01',
          code: 'RACE-01',
          categoryId: 'cat-racing',
          description: 'Direct-Drive Force Feedback cockpit with hydraulic load-cell pedals, Sparco racing seat, and 49" curved ultra-wide.',
          hourlyPrice: 250,
          peakHourPrice: 300,
          display: '49" Samsung Odyssey 240Hz 32:9',
          status: 'AVAILABLE',
          zone: 'Apex Velocity Bay',
          image: '/src/assets/images/racing_simulator_rig_1790420141279.jpg',
          active: true,
        },
        {
          id: 'dev-xbox-01',
          name: 'Xbox Series X Ultimate 01',
          code: 'XBOX-01',
          categoryId: 'cat-xbox',
          description: 'Microsoft Xbox Series X with 12 Teraflops GPU and over 400 titles via Xbox Game Pass Ultimate.',
          hourlyPrice: 130,
          peakHourPrice: 150,
          display: '55" Mini-LED 144Hz',
          status: 'AVAILABLE',
          zone: 'Console Lounge B',
          image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
          active: true,
        },
        {
          id: 'dev-vr-01',
          name: 'CyberVR Arena 01',
          code: 'VR-01',
          categoryId: 'cat-vr',
          description: 'Immersive VR arena with Meta Quest 3, high-bandwidth WiFi 6E wireless PCVR link, and bHaptics tactile vest.',
          hourlyPrice: 220,
          peakHourPrice: 260,
          display: '4K+ High-Resolution Pancake Lenses',
          status: 'AVAILABLE',
          zone: 'CyberVR Hologrid',
          image: '/src/assets/images/hero_esports_lounge_1790420114656.jpg',
          active: true,
        },
        {
          id: 'dev-vip-01',
          name: 'CyberVault VIP Suite 01',
          code: 'VIP-01',
          categoryId: 'cat-vip',
          description: 'Ultra-exclusive private room for squads. Features PS5, RTX 4090 Dual Rig, 85" 4K theater, and snack bar.',
          hourlyPrice: 350,
          peakHourPrice: 420,
          display: '85" 4K 120Hz Cinema Screen',
          status: 'AVAILABLE',
          zone: 'Private CyberVault',
          image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
          active: true,
        }
      ]);
      console.log('[Seed] Initial devices seeded successfully.');
    }

    const existingTournaments = await db.select().from(tournaments).limit(1);
    if (existingTournaments.length === 0) {
      await db.insert(tournaments).values([
        {
          id: 'tourn-fc25-01',
          title: 'EA Sports FC 25 Mymensingh Open',
          game: 'EA Sports FC 25',
          date: '2026-10-02',
          time: '16:00',
          prizePool: '৳10,000 Cash + Free Hours',
          entryFee: 150,
          maxParticipants: 32,
          registeredCount: 14,
          status: 'UPCOMING',
          rules: 'Single Elimination 1v1, 6 Min halves, Tactical Defending only',
        },
        {
          id: 'tourn-tekken8-01',
          title: 'Tekken 8 King of the Iron Fist Lounge',
          game: 'Tekken 8',
          date: '2026-10-09',
          time: '17:00',
          prizePool: '৳8,000 Cash + VIP Pass',
          entryFee: 100,
          maxParticipants: 16,
          registeredCount: 9,
          status: 'UPCOMING',
          rules: 'Double elimination, Best of 3 games, Finals Best of 5',
        }
      ]);
    }

    const existingLeaderboard = await db.select().from(leaderboard).limit(1);
    if (existingLeaderboard.length === 0) {
      await db.insert(leaderboard).values([
        { playerName: 'Fahim Hasan', game: 'EA Sports FC 25', wins: 28, losses: 4, rankTier: 'Grandmaster', badge: 'FC Champion' },
        { playerName: 'Tanvir Ahmed', game: 'Valorant', wins: 42, losses: 11, rankTier: 'Radiant', badge: 'Ace Striker' },
        { playerName: 'Mahim Rahman', game: 'Tekken 8', wins: 23, losses: 6, rankTier: 'Tekken God', badge: 'Combo Master' },
        { playerName: 'Nabil Hasan', game: 'EA Sports FC 25', wins: 19, losses: 8, rankTier: 'Master', badge: 'Playmaker' }
      ]);
    }

    // Seed default admin, manager and staff accounts if no users exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      await db.insert(users).values([
        {
          uid: 'usr-admin-01',
          email: 'admin@cybercraze.gg',
          passwordHash: 'admin123',
          displayName: 'Lounge Super Admin',
          phone: '+8801700000001',
          role: 'SUPER_ADMIN'
        },
        {
          uid: 'usr-manager-01',
          email: 'manager@cybercraze.gg',
          passwordHash: 'manager123',
          displayName: 'Operations Manager',
          phone: '+8801700000002',
          role: 'MANAGER'
        },
        {
          uid: 'usr-staff-01',
          email: 'staff@cybercraze.gg',
          passwordHash: 'staff123',
          displayName: 'Frontdesk Staff',
          phone: '+8801700000003',
          role: 'STAFF'
        }
      ]);
      console.log('[Seed] Default staff and manager accounts seeded.');
    }
  } catch (seedErr) {
    console.error('[Seed] Error seeding data:', seedErr);
  }
}
