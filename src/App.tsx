import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from './lib/useNavigation';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { PageLoadingBar } from './components/PageLoadingBar';

// Public Pages
import { HomePage } from './pages/HomePage';
import { DevicesPage } from './pages/DevicesPage';
import { ZonesPage } from './pages/ZonesPage';
import { PricingPage } from './pages/PricingPage';
import { OffersPage } from './pages/OffersPage';
import { MembershipPage } from './pages/MembershipPage';
import { ContactPage } from './pages/ContactPage';
import { BookingPage } from './pages/BookingPage';
import { ManageBookingPage } from './pages/ManageBookingPage';
import { PolicyPages } from './pages/PolicyPages';

// Admin Components
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminSessions } from './features/admin/AdminSessions';
import { AdminBookings } from './features/admin/AdminBookings';
import { AdminCalendar } from './features/admin/AdminCalendar';
import { AdminDevices } from './features/admin/AdminDevices';
import { AdminCategories } from './features/admin/AdminCategories';
import { AdminPricing } from './features/admin/AdminPricing';
import { AdminCustomers } from './features/admin/AdminCustomers';
import { AdminMaintenance } from './features/admin/AdminMaintenance';
import { AdminActivityLogs } from './features/admin/AdminActivityLogs';
import { AdminSettings } from './features/admin/AdminSettings';
import { AdminCheckInView } from './features/admin/AdminCheckInView';
import { AdminStaffManager } from './features/admin/AdminStaffManager';
import { AdminVipPasses } from './features/admin/AdminVipPasses';
import { AdminLoginModal, StaffAuthSession } from './features/admin/AdminLoginModal';

// Global Admin Modals
import { AdminWalkInModal } from './features/admin/AdminWalkInModal';
import { AdminCheckInModal } from './features/admin/AdminCheckInModal';

export default function App() {
  const { route, navigate, isNavigating } = useNavigation();

  // Admin tab state
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Staff Authentication State
  const [authSession, setAuthSession] = useState<StaffAuthSession | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('cybercraze_staff_auth');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Universal Admin Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isNewDeviceModalOpen, setIsNewDeviceModalOpen] = useState(false);

  // Check if current route is an Admin route
  const isAdminRoute = route.path.startsWith('/admin');

  // Handle direct tab deep links e.g. /admin/live, or reset to dashboard when visiting /admin
  React.useEffect(() => {
    if (route.path === '/admin' || route.path === '/admin/') {
      setAdminTab('dashboard');
    } else if (route.path.startsWith('/admin/')) {
      const sub = route.path.replace('/admin/', '').split('/')[0];
      if (sub) setAdminTab(sub);
    }
  }, [route.path]);

  const handleStaffLogout = () => {
    localStorage.removeItem('cybercraze_staff_auth');
    setAuthSession(null);
    navigate('/');
  };

  // -----------------------------------------------------------------
  // ADMIN PORTAL
  // -----------------------------------------------------------------
  if (isAdminRoute) {
    // If not authenticated, require staff / manager / admin login
    if (!authSession) {
      return (
        <AdminLoginModal
          onLoginSuccess={(session) => setAuthSession(session)}
          onCancel={() => navigate('/')}
        />
      );
    }

    return (
      <>
        <PageLoadingBar isLoading={isNavigating} />
        <AdminLayout
          currentTab={adminTab}
          setCurrentTab={(tab) => {
            setAdminTab(tab);
            navigate(`/admin/${tab}`);
          }}
          navigate={navigate}
          onOpenWalkIn={() => setIsWalkInOpen(true)}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenNewDevice={() => {
            setAdminTab('devices');
            setIsNewDeviceModalOpen(true);
          }}
          authSession={authSession}
          onLogout={handleStaffLogout}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboard
              setCurrentTab={(tab) => {
                setAdminTab(tab);
                navigate(`/admin/${tab}`);
              }}
              onOpenWalkIn={() => setIsWalkInOpen(true)}
              onOpenNewDevice={() => {
                setAdminTab('devices');
                setIsNewDeviceModalOpen(true);
              }}
              onOpenCheckIn={() => setIsCheckInOpen(true)}
            />
          )}
          {adminTab === 'sessions' && <AdminSessions />}
          {adminTab === 'bookings' && <AdminBookings />}
          {adminTab === 'calendar' && <AdminCalendar />}
          {adminTab === 'checkin' && <AdminCheckInView />}
          {adminTab === 'vippasses' && <AdminVipPasses />}
          {adminTab === 'devices' && (
            <AdminDevices
              isAddModalOpen={isNewDeviceModalOpen}
              onCloseAddModal={() => setIsNewDeviceModalOpen(false)}
            />
          )}
          {adminTab === 'categories' && <AdminCategories />}
          {adminTab === 'pricing' && <AdminPricing />}
          {adminTab === 'customers' && <AdminCustomers />}
          {adminTab === 'staff' && <AdminStaffManager currentStaffRole={authSession.role} />}
          {adminTab === 'opening-hours' && <AdminMaintenance />}
          {adminTab === 'activity-logs' && <AdminActivityLogs />}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>

        {/* Universal Modals */}
        <AdminWalkInModal
          isOpen={isWalkInOpen}
          onClose={() => setIsWalkInOpen(false)}
        />
        <AdminCheckInModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
        />
      </>
    );
  }

  // -----------------------------------------------------------------
  // PUBLIC COMMERCIAL WEBSITE
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-300">
      <PageLoadingBar isLoading={isNavigating} />
      <Navbar currentPath={route.path} navigate={navigate} />

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.path}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {route.path === '/' && <HomePage navigate={navigate} />}
            {route.path === '/zones' && <ZonesPage navigate={navigate} />}
            {route.path === '/devices' && <DevicesPage navigate={navigate} />}
            {route.path === '/pricing' && <PricingPage navigate={navigate} />}
            {route.path === '/offers' && <OffersPage navigate={navigate} />}
            {route.path === '/membership' && <MembershipPage navigate={navigate} />}
            {route.path === '/contact' && <ContactPage />}
            
            {/* Booking Reservation Engine */}
            {route.path === '/book' && (
              <BookingPage
                navigate={navigate}
                initialDeviceId={route.query.device}
                initialCategory={route.query.category}
                initialPromo={route.query.promo}
                initialPhone={route.query.phone}
              />
            )}

            {/* Manage Booking (No Login) */}
            {route.path === '/booking/manage' && (
              <ManageBookingPage navigate={navigate} />
            )}

            {/* Direct Booking ID pass e.g. /booking/CC-2026-000121 */}
            {route.path.startsWith('/booking/') && route.path !== '/booking/manage' && (
              <ManageBookingPage navigate={navigate} directBookingId={route.params.id} />
            )}

            {/* Policy Pages */}
            {route.path === '/terms' && <PolicyPages type="terms" />}
            {route.path === '/privacy' && <PolicyPages type="privacy" />}
            {route.path === '/booking-policy' && <PolicyPages type="booking-policy" />}
            {route.path === '/cancellation-policy' && <PolicyPages type="cancellation-policy" />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer navigate={navigate} />
      <MobileNav currentPath={route.path} navigate={navigate} />
    </div>
  );
}
