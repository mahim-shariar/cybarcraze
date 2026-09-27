export type DeviceStatus = 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED' | 'BLOCKED';

export type EquipmentCondition = 'Working' | 'Maintenance' | 'Broken' | 'Replacement Required';

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type PaymentStatus = 'PAID' | 'DEPOSIT_PAID' | 'PENDING' | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'BANK' | 'CARD';

export interface DeviceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  displayOrder: number;
  active: boolean;
}

export interface Device {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  description: string;
  hourlyPrice: number;
  peakHourPrice?: number;
  weekendPrice?: number;
  memberPrice?: number;
  minCapacity: number;
  maxCapacity: number;
  status: DeviceStatus;
  condition: EquipmentCondition;
  zone: string;
  specifications: Record<string, string>;
  controllers: number;
  accessories: string[];
  display: string;
  image: string;
  active: boolean;
}

export interface BookingAddonItem {
  addonId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  accessCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  categoryId: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  playersCount: number;
  hourlyRate: number;
  subtotal: number;
  addons: BookingAddonItem[];
  addonsTotal: number;
  discount: number;
  promoCode?: string;
  deposit: number;
  remainingAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  qrCodeData: string;
  cancellationReason?: string;
}

export interface ActiveSession {
  id: string;
  bookingId?: string;
  deviceId: string;
  deviceCode: string;
  customerName: string;
  customerPhone: string;
  startedAt: string;
  scheduledEnd: string;
  extendedMinutes: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  totalCharged: number;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'CONTROLLER' | 'GEAR' | 'SNACK' | 'DRINK' | 'COMBO';
  stock: number;
  active: boolean;
  image?: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  totalBookings: number;
  totalSpent: number;
  cancelledCount: number;
  noShowCount: number;
  lastVisit?: string;
  isMember: boolean;
  membershipTier?: string;
  notes?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minSpend: number;
  applicableCategory?: string;
  usageCount: number;
  usageLimit: number;
  active: boolean;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'STANDARD' | 'PEAK' | 'WEEKEND' | 'HOLIDAY' | 'CUSTOM';
  rateMultiplier: number;
  startHour?: number;
  endHour?: number;
  daysOfWeek: number[]; // 0=Sun, 6=Sat
  priority: number;
  active: boolean;
}

export interface OpeningHourDay {
  day: string;
  dayIndex: number;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface MaintenanceBlock {
  id: string;
  deviceId: string;
  deviceCode?: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface CafeSettings {
  businessName: string;
  brandTagline: string;
  address: string;
  locationShort: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  advanceBookingDays: number;
  minAdvanceNoticeMinutes: number;
  cancellationNoticeHours: number;
  depositType: 'NONE' | 'FIXED' | 'PERCENTAGE' | 'FULL';
  depositValue: number;
  otpEnabled: boolean;
  allowedDurations: number[]; // in minutes, e.g. [60, 120, 180, 240, 300, 360] (Strict 1-hour multiples only)
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF';
}
