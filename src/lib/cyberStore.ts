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
import {
  initialCategories,
  initialDevices,
  initialAddons,
  initialCustomers,
  initialBookings,
  initialActiveSessions,
  initialPromoCodes,
  initialPricingRules,
  initialOpeningHours,
  initialMaintenanceBlocks,
  initialActivityLogs,
  defaultSettings
} from './initialData';

const STORAGE_KEY = 'cybercraze_store_v4';

export interface DatabaseState {
  categories: DeviceCategory[];
  devices: Device[];
  addons: Addon[];
  customers: Customer[];
  bookings: Booking[];
  sessions: ActiveSession[];
  promoCodes: PromoCode[];
  pricingRules: PricingRule[];
  openingHours: OpeningHourDay[];
  maintenanceBlocks: MaintenanceBlock[];
  activityLogs: ActivityLog[];
  settings: CafeSettings;
}

export class CyberStore {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
    // Auto sync with active session timer checks
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.state = this.loadFromStorage();
          this.notify();
        }
      });
    }
  }

  private loadFromStorage(): DatabaseState {
    if (typeof window === 'undefined') {
      return this.getDefaultState();
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const todayStr = new Date().toISOString().split('T')[0];
        const unexpiredBookings = (parsed.bookings || initialBookings).filter(
          (b: Booking) => b.date >= todayStr
        );
        return {
          categories: parsed.categories || initialCategories,
          devices: parsed.devices || initialDevices,
          addons: parsed.addons || initialAddons,
          customers: parsed.customers || initialCustomers,
          bookings: unexpiredBookings,
          sessions: parsed.sessions || initialActiveSessions,
          promoCodes: parsed.promoCodes || initialPromoCodes,
          pricingRules: parsed.pricingRules || initialPricingRules,
          openingHours: parsed.openingHours || initialOpeningHours,
          maintenanceBlocks: parsed.maintenanceBlocks || initialMaintenanceBlocks,
          activityLogs: parsed.activityLogs || initialActivityLogs,
          settings: parsed.settings || defaultSettings,
        };
      }
    } catch (e) {
      console.error('Failed to load storage, using defaults', e);
    }
    return this.getDefaultState();
  }

  private getDefaultState(): DatabaseState {
    return {
      categories: [...initialCategories],
      devices: [...initialDevices],
      addons: [...initialAddons],
      customers: [...initialCustomers],
      bookings: [...initialBookings],
      sessions: [...initialActiveSessions],
      promoCodes: [...initialPromoCodes],
      pricingRules: [...initialPricingRules],
      openingHours: [...initialOpeningHours],
      maintenanceBlocks: [...initialMaintenanceBlocks],
      activityLogs: [...initialActivityLogs],
      settings: { ...defaultSettings },
    };
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to save store to localStorage', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // --- GETTERS ---
  public getState(): DatabaseState {
    return this.state;
  }

  public getCategories(): DeviceCategory[] {
    return [...this.state.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getDevices(): Device[] {
    return this.state.devices;
  }

  public getDeviceById(id: string): Device | undefined {
    return this.state.devices.find((d) => d.id === id || d.code.toUpperCase() === id.toUpperCase());
  }

  public getBookings(): Booking[] {
    const todayStr = new Date().toISOString().split('T')[0];
    const unexpired = this.state.bookings.filter((b) => b.date >= todayStr);
    if (unexpired.length !== this.state.bookings.length) {
      this.state.bookings = unexpired;
      this.saveToStorage();
    }
    return this.state.bookings;
  }

  public getSessions(): ActiveSession[] {
    return this.state.sessions;
  }

  public getAddons(): Addon[] {
    return this.state.addons;
  }

  public getCustomers(): Customer[] {
    return this.state.customers;
  }

  public getPromoCodes(): PromoCode[] {
    return this.state.promoCodes;
  }

  public getSettings(): CafeSettings {
    return this.state.settings;
  }

  public getOpeningHours(): OpeningHourDay[] {
    return this.state.openingHours;
  }

  public getMaintenanceBlocks(): MaintenanceBlock[] {
    return this.state.maintenanceBlocks;
  }

  public getActivityLogs(): ActivityLog[] {
    return this.state.activityLogs;
  }

  // --- TIME & BOOKING LOGIC ---
  private timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private minutesToTime(totalMins: number): string {
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  public calculateEndTime(startTime: string, durationMinutes: number): string {
    const startMins = this.timeToMinutes(startTime);
    return this.minutesToTime(startMins + durationMinutes);
  }

  // --- AVAILABILITY CHECK ---
  public isDeviceAvailable(
    deviceId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): { available: boolean; reason?: string } {
    const device = this.state.devices.find((d) => d.id === deviceId);
    if (!device) return { available: false, reason: 'Device not found' };
    if (!device.active) return { available: false, reason: 'Device is currently inactive' };
    if (device.status === 'DISABLED' || device.status === 'BLOCKED') {
      return { available: false, reason: 'Device is currently blocked from bookings' };
    }

    const reqStart = this.timeToMinutes(startTime);
    const reqEnd = this.timeToMinutes(endTime);

    // 1. Check Maintenance Blocks
    const maintenance = this.state.maintenanceBlocks.find(
      (m) =>
        m.deviceId === deviceId &&
        m.date === date &&
        reqStart < this.timeToMinutes(m.endTime) &&
        reqEnd > this.timeToMinutes(m.startTime)
    );
    if (maintenance) {
      return {
        available: false,
        reason: `Station scheduled for maintenance: ${maintenance.reason} (${maintenance.startTime}–${maintenance.endTime})`
      };
    }

    // 2. Check Overlapping Bookings
    const overlap = this.state.bookings.find((b) => {
      if (b.deviceId !== deviceId || b.date !== date) return false;
      if (b.status === 'CANCELLED' || b.status === 'NO_SHOW') return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      const bStart = this.timeToMinutes(b.startTime);
      const bEnd = this.timeToMinutes(b.endTime);

      return reqStart < bEnd && reqEnd > bStart;
    });

    if (overlap) {
      return {
        available: false,
        reason: `Slot overlaps with existing booking from ${overlap.startTime} to ${overlap.endTime}`
      };
    }

    return { available: true };
  }

  // --- PRICE CALCULATION ---
  public calculateBookingQuote(params: {
    deviceId: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    promoCode?: string;
    addons?: { addonId: string; quantity: number }[];
    isMember?: boolean;
  }): {
    hourlyRate: number;
    subtotal: number;
    addonsList: { addonId: string; name: string; price: number; quantity: number }[];
    addonsTotal: number;
    discount: number;
    totalAmount: number;
    depositRequired: number;
    remainingAmount: number;
    promoApplied?: PromoCode;
  } {
    const device = this.state.devices.find((d) => d.id === params.deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    const hours = params.durationMinutes / 60;
    const dateObj = new Date(params.date + 'T12:00:00Z');
    const dayOfWeek = isNaN(dateObj.getDay()) ? 0 : dateObj.getDay();
    const startHour = Number(params.startTime.split(':')[0]) || 12;

    let baseRate = device.hourlyPrice;

    // Check Member Rate
    if (params.isMember && device.memberPrice) {
      baseRate = device.memberPrice;
    } else {
      // Check Weekend (Friday=5, Saturday=6 in BD)
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      if (isWeekend && device.weekendPrice) {
        baseRate = Math.max(baseRate, device.weekendPrice);
      }
      // Check Peak Hour (6PM-10PM: 18-22)
      const isPeakHour = startHour >= 18 && startHour < 22;
      if (isPeakHour && device.peakHourPrice) {
        baseRate = Math.max(baseRate, device.peakHourPrice);
      }
    }

    const subtotal = Math.round(baseRate * hours);

    // Addons calculation
    let addonsTotal = 0;
    const addonsList: { addonId: string; name: string; price: number; quantity: number }[] = [];
    if (params.addons) {
      for (const item of params.addons) {
        const addon = this.state.addons.find((a) => a.id === item.addonId);
        if (addon && item.quantity > 0) {
          const itemTotal = addon.price * item.quantity;
          addonsTotal += itemTotal;
          addonsList.push({
            addonId: addon.id,
            name: addon.name,
            price: addon.price,
            quantity: item.quantity
          });
        }
      }
    }

    // Promo code discount
    let discount = 0;
    let promoApplied: PromoCode | undefined;
    if (params.promoCode) {
      const cleanCode = params.promoCode.trim().toUpperCase();
      const promo = this.state.promoCodes.find(
        (p) => p.code.toUpperCase() === cleanCode && p.active && p.usageCount < p.usageLimit
      );
      if (promo) {
        const eligibleBase = subtotal + addonsTotal;
        if (eligibleBase >= promo.minSpend) {
          if (promo.discountType === 'PERCENTAGE') {
            discount = Math.round((eligibleBase * promo.discountValue) / 100);
          } else {
            discount = Math.min(promo.discountValue, eligibleBase);
          }
          promoApplied = promo;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + addonsTotal - discount);

    // Deposit calculation
    let depositRequired = 0;
    const depType = this.state.settings.depositType;
    if (depType === 'FULL') {
      depositRequired = totalAmount;
    } else if (depType === 'FIXED') {
      depositRequired = Math.min(this.state.settings.depositValue, totalAmount);
    } else if (depType === 'PERCENTAGE') {
      depositRequired = Math.round((totalAmount * this.state.settings.depositValue) / 100);
    } else {
      depositRequired = 0;
    }

    const remainingAmount = Math.max(0, totalAmount - depositRequired);

    return {
      hourlyRate: baseRate,
      subtotal,
      addonsList,
      addonsTotal,
      discount,
      totalAmount,
      depositRequired,
      remainingAmount,
      promoApplied
    };
  }

  // --- CREATE TRANSACTIONAL BOOKING (NO DOUBLE BOOKING) ---
  public createBooking(data: {
    deviceId: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    playersCount?: number;
    addons?: { addonId: string; quantity: number }[];
    promoCode?: string;
    notes?: string;
    paymentMethod?: 'CASH' | 'BKASH' | 'NAGAD' | 'BANK' | 'CARD';
    isWalkIn?: boolean;
    markCheckedIn?: boolean;
  }): Booking {
    const device = this.state.devices.find((d) => d.id === data.deviceId);
    if (!device) throw new Error('Selected gaming device does not exist.');

    const endTime = this.calculateEndTime(data.startTime, data.durationMinutes);

    // 1. Transactional check for overlaps
    const check = this.isDeviceAvailable(data.deviceId, data.date, data.startTime, endTime);
    if (!check.available) {
      throw new Error(`Booking conflict: ${check.reason}`);
    }

    // 2. Quote calculations
    const quote = this.calculateBookingQuote({
      deviceId: data.deviceId,
      date: data.date,
      startTime: data.startTime,
      durationMinutes: data.durationMinutes,
      promoCode: data.promoCode,
      addons: data.addons
    });

    // 3. Customer record update/create
    const cleanPhone = data.customerPhone.trim();
    let customer = this.state.customers.find((c) => c.phone === cleanPhone);
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        phone: cleanPhone,
        name: data.customerName.trim(),
        email: data.customerEmail?.trim(),
        totalBookings: 1,
        totalSpent: quote.totalAmount,
        cancelledCount: 0,
        noShowCount: 0,
        lastVisit: data.date,
        isMember: false
      };
      this.state.customers.push(customer);
    } else {
      customer.name = data.customerName.trim();
      if (data.customerEmail) customer.email = data.customerEmail.trim();
      customer.totalBookings += 1;
      customer.totalSpent += quote.totalAmount;
      customer.lastVisit = data.date;
    }

    // 4. Generate Unique Booking ID & 6-Digit Access Code
    const count = this.state.bookings.length + 125;
    const bookingId = `CC-2026-${String(count).padStart(6, '0')}`;
    const accessCode = String(Math.floor(100000 + Math.random() * 900000));

    const category = this.state.categories.find((c) => c.id === device.categoryId);

    const initialStatus = data.markCheckedIn ? 'ACTIVE' : 'CONFIRMED';
    const initialPaymentStatus =
      quote.depositRequired >= quote.totalAmount && quote.totalAmount > 0
        ? 'PAID'
        : quote.depositRequired > 0
        ? 'DEPOSIT_PAID'
        : 'PENDING';

    const booking: Booking = {
      id: bookingId,
      accessCode,
      customerId: customer.id,
      customerName: data.customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: data.customerEmail?.trim(),
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      categoryId: device.categoryId,
      categoryName: category?.name || 'Gaming Station',
      date: data.date,
      startTime: data.startTime,
      endTime,
      durationMinutes: data.durationMinutes,
      playersCount: data.playersCount || 1,
      hourlyRate: quote.hourlyRate,
      subtotal: quote.subtotal,
      addons: quote.addonsList,
      addonsTotal: quote.addonsTotal,
      discount: quote.discount,
      promoCode: quote.promoApplied?.code,
      deposit: quote.depositRequired,
      remainingAmount: quote.remainingAmount,
      totalAmount: quote.totalAmount,
      paymentStatus: initialPaymentStatus,
      paymentMethod: data.paymentMethod || 'BKASH',
      status: initialStatus,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      qrCodeData: `${bookingId}:${accessCode}:${cleanPhone}`
    };

    this.state.bookings.unshift(booking);

    // If promo code applied, increment usage
    if (quote.promoApplied) {
      quote.promoApplied.usageCount += 1;
    }

    // If walk-in with direct start, launch active session immediately
    if (data.markCheckedIn) {
      device.status = 'OCCUPIED';
      const session: ActiveSession = {
        id: `sess-${Date.now()}`,
        bookingId: booking.id,
        deviceId: device.id,
        deviceCode: device.code,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        startedAt: new Date().toISOString(),
        scheduledEnd: new Date(Date.now() + booking.durationMinutes * 60 * 1000).toISOString(),
        extendedMinutes: 0,
        status: 'ACTIVE',
        totalCharged: booking.totalAmount
      };
      this.state.sessions.unshift(session);
    } else {
      // If date is today and starting soon, mark device BOOKED if not currently OCCUPIED
      const todayStr = new Date().toISOString().split('T')[0];
      if (data.date === todayStr && device.status === 'AVAILABLE') {
        device.status = 'BOOKED';
      }
    }

    // Log activity
    this.logActivity({
      actor: data.isWalkIn ? 'Front Counter Staff' : 'Guest Customer',
      role: data.isWalkIn ? 'STAFF' : 'CUSTOMER',
      action: data.isWalkIn ? 'WALK_IN_CREATED' : 'ONLINE_BOOKING_CREATED',
      target: booking.id,
      details: `${booking.deviceName} (${booking.deviceCode}) booked for ${booking.date} ${booking.startTime}-${booking.endTime} (৳${booking.totalAmount})`
    });

    this.saveToStorage();
    return booking;
  }

  // --- MANAGE BOOKING LOOKUP (NO LOGIN REQUIRED) ---
  public getBookingByCredentials(bookingId: string, phoneOrCode: string): Booking | null {
    const cleanId = bookingId.trim().toUpperCase();
    const cleanSecret = phoneOrCode.trim();

    const booking = this.state.bookings.find((b) => b.id.toUpperCase() === cleanId);
    if (!booking) return null;

    const matchesPhone = booking.customerPhone === cleanSecret || booking.customerPhone.replace(/[\s-]/g, '') === cleanSecret.replace(/[\s-]/g, '');
    const matchesCode = booking.accessCode === cleanSecret;

    if (matchesPhone || matchesCode) {
      return booking;
    }
    return null;
  }

  public getBookingsByPhone(phone: string): Booking[] {
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    return this.state.bookings.filter((b) => b.customerPhone.replace(/[\s-]/g, '') === cleanPhone);
  }

  // --- CANCEL BOOKING ---
  public cancelBooking(bookingId: string, reason?: string): { success: boolean; message: string } {
    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    if (booking.status === 'CANCELLED') return { success: false, message: 'Booking is already cancelled' };
    if (booking.status === 'COMPLETED') return { success: false, message: 'Completed sessions cannot be cancelled' };

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.updatedAt = new Date().toISOString();

    // Free device status if it was booked
    const device = this.state.devices.find((d) => d.id === booking.deviceId);
    if (device && device.status === 'BOOKED') {
      device.status = 'AVAILABLE';
    }

    // Update customer stats
    const customer = this.state.customers.find((c) => c.id === booking.customerId);
    if (customer) {
      customer.cancelledCount += 1;
    }

    this.logActivity({
      actor: 'System / Customer',
      role: 'CUSTOMER',
      action: 'BOOKING_CANCELLED',
      target: booking.id,
      details: `Booking ${booking.id} cancelled. Reason: ${booking.cancellationReason}`
    });

    this.saveToStorage();
    return { success: true, message: 'Your booking has been cancelled successfully.' };
  }

  // --- START DIRECT SESSION (VIP OR WALK-IN) ---
  public startDirectSession(data: {
    deviceId: string;
    customerName: string;
    customerPhone: string;
    durationMinutes: number;
    bookingId?: string;
  }): ActiveSession {
    const device = this.state.devices.find((d) => d.id === data.deviceId);
    const now = new Date();
    const scheduledEnd = new Date(now.getTime() + data.durationMinutes * 60 * 1000);
    const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(scheduledEnd.getHours()).padStart(2, '0')}:${String(scheduledEnd.getMinutes()).padStart(2, '0')}`;

    if (device) {
      device.status = 'OCCUPIED';
    }

    const session: ActiveSession = {
      id: `sess-${Date.now()}`,
      bookingId: data.bookingId,
      deviceId: data.deviceId,
      deviceCode: device ? device.code : 'GAME',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      startedAt: now.toISOString(),
      scheduledEnd: scheduledEnd.toISOString(),
      extendedMinutes: 0,
      status: 'ACTIVE',
      totalCharged: 0,
      startTime,
      endTime,
      durationMinutes: data.durationMinutes,
    };

    this.state.sessions.unshift(session);
    this.saveToStorage();
    return session;
  }

  // --- RESCHEDULE BOOKING ---
  public rescheduleBooking(params: {
    bookingId: string;
    newDate: string;
    newStartTime: string;
    newDeviceId?: string;
  }): { success: boolean; message: string } {
    const booking = this.state.bookings.find((b) => b.id === params.bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED' || booking.status === 'ACTIVE') {
      return { success: false, message: `Cannot reschedule a booking in ${booking.status} status` };
    }

    const targetDeviceId = params.newDeviceId || booking.deviceId;
    const newEndTime = this.calculateEndTime(params.newStartTime, booking.durationMinutes);

    const check = this.isDeviceAvailable(
      targetDeviceId,
      params.newDate,
      params.newStartTime,
      newEndTime,
      booking.id
    );

    if (!check.available) {
      return { success: false, message: `Reschedule failed: ${check.reason}` };
    }

    const oldDate = booking.date;
    const oldTime = booking.startTime;

    booking.date = params.newDate;
    booking.startTime = params.newStartTime;
    booking.endTime = newEndTime;
    if (params.newDeviceId && params.newDeviceId !== booking.deviceId) {
      const newDev = this.state.devices.find((d) => d.id === params.newDeviceId);
      if (newDev) {
        booking.deviceId = newDev.id;
        booking.deviceName = newDev.name;
        booking.deviceCode = newDev.code;
      }
    }
    booking.updatedAt = new Date().toISOString();

    this.logActivity({
      actor: 'Customer / Staff',
      role: 'STAFF',
      action: 'BOOKING_RESCHEDULED',
      target: booking.id,
      details: `Rescheduled from ${oldDate} ${oldTime} to ${booking.date} ${booking.startTime}`
    });

    this.saveToStorage();
    return { success: true, message: 'Your session has been rescheduled successfully.' };
  }

  // --- ADMIN ACTIONS: CHECK IN / START SESSION ---
  public checkInAndStartSession(bookingId: string): { success: boolean; message: string } {
    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    booking.status = 'ACTIVE';
    booking.updatedAt = new Date().toISOString();

    const device = this.state.devices.find((d) => d.id === booking.deviceId);
    if (device) {
      device.status = 'OCCUPIED';
    }

    // Check if session exists
    let session = this.state.sessions.find((s) => s.bookingId === booking.id);
    if (!session) {
      session = {
        id: `sess-${Date.now()}`,
        bookingId: booking.id,
        deviceId: booking.deviceId,
        deviceCode: booking.deviceCode,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        startedAt: new Date().toISOString(),
        scheduledEnd: new Date(Date.now() + booking.durationMinutes * 60 * 1000).toISOString(),
        extendedMinutes: 0,
        status: 'ACTIVE',
        totalCharged: booking.totalAmount
      };
      this.state.sessions.unshift(session);
    } else {
      session.status = 'ACTIVE';
    }

    this.logActivity({
      actor: 'Admin / Staff',
      role: 'STAFF',
      action: 'SESSION_STARTED',
      target: booking.id,
      details: `Checked in customer ${booking.customerName} for ${booking.deviceName}`
    });

    this.saveToStorage();
    return { success: true, message: `Session started for ${booking.customerName} on ${booking.deviceCode}` };
  }

  // --- EXTEND ACTIVE SESSION ---
  public extendSession(sessionId: string, additionalMinutes: number): { success: boolean; message: string } {
    const session = this.state.sessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, message: 'Active session not found' };

    const device = this.state.devices.find((d) => d.id === session.deviceId);
    const hourlyPrice = device?.hourlyPrice || 100;
    const additionalFee = Math.round((hourlyPrice * additionalMinutes) / 60);

    const currentEnd = new Date(session.scheduledEnd).getTime();
    const newEnd = new Date(currentEnd + additionalMinutes * 60 * 1000).toISOString();

    session.scheduledEnd = newEnd;
    session.extendedMinutes += additionalMinutes;
    session.totalCharged += additionalFee;

    // Also update booking record
    const booking = this.state.bookings.find((b) => b.id === session.bookingId);
    if (booking) {
      booking.durationMinutes += additionalMinutes;
      booking.totalAmount += additionalFee;
      booking.remainingAmount += additionalFee;
      booking.endTime = this.calculateEndTime(booking.startTime, booking.durationMinutes);
    }

    this.logActivity({
      actor: 'Staff Counter',
      role: 'STAFF',
      action: 'SESSION_EXTENDED',
      target: session.deviceCode,
      details: `Extended ${additionalMinutes} mins (+৳${additionalFee}) for ${session.customerName}`
    });

    this.saveToStorage();
    return { success: true, message: `Extended by ${additionalMinutes} mins (+৳${additionalFee})` };
  }

  // --- END ACTIVE SESSION ---
  public endSession(sessionId: string): { success: boolean; message: string } {
    const session = this.state.sessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, message: 'Active session not found' };

    session.status = 'COMPLETED';

    const booking = this.state.bookings.find((b) => b.id === session.bookingId);
    if (booking) {
      booking.status = 'COMPLETED';
      booking.paymentStatus = 'PAID';
    }

    const device = this.state.devices.find((d) => d.id === session.deviceId);
    if (device) {
      device.status = 'AVAILABLE';
    }

    this.logActivity({
      actor: 'Staff Counter',
      role: 'STAFF',
      action: 'SESSION_COMPLETED',
      target: session.deviceCode,
      details: `Session ended for ${session.customerName}. Station ${session.deviceCode} is now available.`
    });

    this.saveToStorage();
    return { success: true, message: `Session completed for ${session.deviceCode}` };
  }

  // --- DEVICE CRUD ---
  public addDevice(device: Omit<Device, 'id'>): Device {
    const id = `dev-${Date.now()}`;
    const newDevice: Device = { ...device, id };
    this.state.devices.push(newDevice);

    this.logActivity({
      actor: 'Admin',
      role: 'SUPER_ADMIN',
      action: 'DEVICE_CREATED',
      target: newDevice.code,
      details: `Added new device ${newDevice.name} (${newDevice.code}) at ৳${newDevice.hourlyPrice}/h`
    });

    this.saveToStorage();
    return newDevice;
  }

  public updateDevice(id: string, updates: Partial<Device>): Device {
    const index = this.state.devices.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Device not found');

    const old = this.state.devices[index];
    this.state.devices[index] = { ...old, ...updates };

    this.logActivity({
      actor: 'Admin',
      role: 'SUPER_ADMIN',
      action: 'DEVICE_UPDATED',
      target: old.code,
      details: `Updated details for ${old.name} (${old.code})`
    });

    this.saveToStorage();
    return this.state.devices[index];
  }

  public deleteDevice(id: string): void {
    const index = this.state.devices.findIndex((d) => d.id === id);
    if (index !== -1) {
      const dev = this.state.devices[index];
      this.state.devices.splice(index, 1);
      this.logActivity({
        actor: 'Admin',
        role: 'SUPER_ADMIN',
        action: 'DEVICE_DELETED',
        target: dev.code,
        details: `Deleted device ${dev.name}`
      });
      this.saveToStorage();
    }
  }

  // --- CATEGORY CRUD ---
  public addCategory(cat: Omit<DeviceCategory, 'id'>): DeviceCategory {
    const id = `cat-${Date.now()}`;
    const newCat: DeviceCategory = { ...cat, id };
    this.state.categories.push(newCat);
    this.saveToStorage();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<DeviceCategory>): DeviceCategory {
    const index = this.state.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    this.state.categories[index] = { ...this.state.categories[index], ...updates };
    this.saveToStorage();
    return this.state.categories[index];
  }

  // --- SETTINGS & MISC ---
  public updateSettings(settings: Partial<CafeSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.saveToStorage();
  }

  public addMaintenanceBlock(block: Omit<MaintenanceBlock, 'id'>): MaintenanceBlock {
    const newBlock: MaintenanceBlock = {
      ...block,
      id: `maint-${Date.now()}`
    };
    this.state.maintenanceBlocks.push(newBlock);

    // Also flag device as maintenance if applicable
    const dev = this.state.devices.find((d) => d.id === block.deviceId);
    if (dev) {
      dev.status = 'MAINTENANCE';
    }

    this.logActivity({
      actor: 'Admin',
      role: 'MANAGER',
      action: 'MAINTENANCE_ADDED',
      target: block.deviceCode || block.deviceId,
      details: `Scheduled maintenance: ${block.reason} (${block.startTime}-${block.endTime})`
    });

    this.saveToStorage();
    return newBlock;
  }

  public deleteMaintenanceBlock(id: string): void {
    const index = this.state.maintenanceBlocks.findIndex((m) => m.id === id);
    if (index !== -1) {
      const block = this.state.maintenanceBlocks[index];
      this.state.maintenanceBlocks.splice(index, 1);
      const dev = this.state.devices.find((d) => d.id === block.deviceId);
      if (dev && dev.status === 'MAINTENANCE') {
        dev.status = 'AVAILABLE';
      }
      this.saveToStorage();
    }
  }

  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    this.state.activityLogs.unshift({
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    });
    if (this.state.activityLogs.length > 200) {
      this.state.activityLogs.pop();
    }
  }
}

export const cyberStore = new CyberStore();
