import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as dbService from './src/db/dbService.ts';

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// -------------------------------------------------------------
// BACKEND API ROUTES (Cloud SQL PostgreSQL Integration)
// -------------------------------------------------------------

// 1. Auto-cleanup past day bookings
app.post('/api/bookings/cleanup', async (req: Request, res: Response) => {
  try {
    const result = await dbService.cleanupExpiredBookings();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cleanup bookings' });
  }
});

// 2. Bookings CRUD
app.get('/api/bookings', async (req: Request, res: Response) => {
  try {
    const list = await dbService.getAllBookings();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch bookings' });
  }
});

app.post('/api/bookings', async (req: Request, res: Response) => {
  try {
    const booking = await dbService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create booking' });
  }
});

app.get('/api/bookings/:id', async (req: Request, res: Response) => {
  try {
    const booking = await dbService.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to find booking' });
  }
});

// 3. VIP Membership Passes
app.get('/api/vip-passes', async (req: Request, res: Response) => {
  try {
    const list = await dbService.getAllVipPasses();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch VIP passes' });
  }
});

app.post('/api/vip-passes', async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, customerEmail, tier } = req.body;
    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'Name and Phone number are required to register VIP pass' });
    }
    const pass = await dbService.registerVipPass({
      customerName,
      customerPhone,
      customerEmail,
      tier: tier || 'WEEKLY_1HR_DAILY'
    });
    res.status(201).json(pass);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register VIP pass' });
  }
});

app.get('/api/vip-passes/lookup', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter q (phone or code)' });
    }
    const pass = await dbService.lookupVipPass(query);
    if (!pass) {
      return res.status(404).json({ error: 'No VIP pass found for this phone or code' });
    }

    // Check if daily 1-hour free session is remaining today
    const today = dbService.getTodayDateStr();
    const dailyAvailable = await dbService.checkVipDailyHourRemaining(pass.id, today);

    res.json({
      pass,
      dailyAvailableToday: dailyAvailable
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to lookup VIP pass' });
  }
});

// 4. Counter Active Play Sessions & Countdown Timers
// When scanned, timer starts ticking down; when expired, status = TIME_OVER
app.get('/api/sessions', async (req: Request, res: Response) => {
  try {
    const sessions = await dbService.getActiveSessions();
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch sessions' });
  }
});

app.post('/api/sessions/start', async (req: Request, res: Response) => {
  try {
    const { deviceId, bookingId, vipPassId, customerName, customerPhone, durationMinutes } = req.body;
    if (!deviceId || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Device, Name and Phone are required' });
    }

    // If VIP pass, check daily 1-hour limit first
    if (vipPassId) {
      const today = dbService.getTodayDateStr();
      const dailyAvailable = await dbService.checkVipDailyHourRemaining(vipPassId, today);
      if (!dailyAvailable) {
        return res.status(400).json({ 
          error: "Today's limit already up! This VIP pass has already claimed its 1-hour daily session for today. Extra hours can be booked with the member discount." 
        });
      }
    }

    const session = await dbService.startPlaySession({
      deviceId,
      bookingId,
      vipPassId,
      customerName,
      customerPhone,
      durationMinutes: durationMinutes || 60
    });

    // If VIP pass, record daily usage
    if (vipPassId) {
      const today = dbService.getTodayDateStr();
      await dbService.recordVipDailyUsage(vipPassId, today, bookingId);
    }

    res.status(201).json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start play session' });
  }
});

app.post('/api/sessions/finish', async (req: Request, res: Response) => {
  try {
    const { sessionId, deviceId } = req.body;
    await dbService.finishSession(sessionId, deviceId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to finish session' });
  }
});

// 5. Gaming Essentials: Tournaments & Leaderboard
app.get('/api/tournaments', async (req: Request, res: Response) => {
  try {
    const list = await dbService.getTournaments();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const list = await dbService.getLeaderboard();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/devices', async (req: Request, res: Response) => {
  try {
    const devs = await dbService.getDevicesList();
    res.json(devs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Delete device API
app.delete('/api/devices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await dbService.deleteDeviceFromDb(id);
    res.json({ success: true, message: `Device ${id} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete device' });
  }
});

// Staff Authentication & Management
app.post('/api/staff/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const staff = await dbService.authenticateStaffUser(email, password);
    if (!staff) {
      return res.status(401).json({ error: 'Invalid staff email or password' });
    }
    res.json({ success: true, staff });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Staff login failed' });
  }
});

app.get('/api/staff/users', async (req: Request, res: Response) => {
  try {
    const list = await dbService.getAllStaffUsers();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch staff members' });
  }
});

app.post('/api/staff/users', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, phone, role } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }
    const created = await dbService.createStaffUser({
      email,
      password,
      displayName,
      phone,
      role: role || 'STAFF',
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create staff user' });
  }
});

app.delete('/api/staff/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await dbService.deleteStaffUser(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete staff user' });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  // Periodically clean up expired past-day bookings every hour
  setInterval(() => {
    dbService.cleanupExpiredBookings().catch(console.error);
  }, 60 * 60 * 1000);

  // Initial cleanup and seed on boot
  dbService.cleanupExpiredBookings().catch(console.error);
  dbService.seedInitialDataIfEmpty().catch(console.error);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CyberCraze Cloud SQL Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
